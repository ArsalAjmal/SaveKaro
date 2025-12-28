from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime, timedelta
import bcrypt
import jwt
import secrets
from models import (
    UserCreate, UserLogin, User, UserResponse, Token,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest,
    FavoriteRequest
)
from database import Database
from config import settings
from email_utils import send_email, create_verification_email, create_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Security
security = HTTPBearer()

# JWT settings
SECRET_KEY = settings.SECRET_KEY if hasattr(settings, 'SECRET_KEY') else "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Email verification tokens storage (in production, use Redis or database)
verification_tokens = {}
reset_tokens = {}


def hash_password(password: str) -> str:
    """Hash a password"""
    # Truncate password to 72 bytes if necessary (bcrypt limitation)
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password"""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def generate_verification_token() -> str:
    """Generate a random verification token"""
    return secrets.token_urlsafe(32)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user"""
    from bson import ObjectId
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    # Convert string ID to ObjectId for MongoDB query
    try:
        user = await Database.db.users.find_one({"_id": ObjectId(user_id)})
    except:
        user = await Database.db.users.find_one({"_id": user_id})
        
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    # Convert ObjectId to string for the User model
    user["_id"] = str(user["_id"])
    return User(**user)


async def send_verification_email(email: str, token: str):
    """Send verification email"""
    verification_link = f"http://localhost:3000/verify-email?token={token}"
    html_content = create_verification_email(verification_link)
    
    await send_email(
        to_email=email,
        subject="Verify Your Email - SaveKaro",
        html_content=html_content
    )


async def send_password_reset_email(email: str, token: str):
    """Send password reset email"""
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    html_content = create_password_reset_email(reset_link)
    
    await send_email(
        to_email=email,
        subject="Reset Your Password - SaveKaro",
        html_content=html_content
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await Database.db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user_dict = {
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "is_verified": False,
        "created_at": datetime.now(),
        "favorites": []
    }
    
    result = await Database.db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Generate verification token
    verification_token = generate_verification_token()
    verification_tokens[verification_token] = {
        "user_id": user_id,
        "email": user_data.email,
        "expires_at": datetime.now() + timedelta(hours=24)
    }
    
    # Send verification email
    await send_verification_email(user_data.email, verification_token)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    # Return user data
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        is_verified=False,
        created_at=user_dict["created_at"],
        favorites=[]
    )
    
    return Token(access_token=access_token, user=user_response)


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user"""
    # Find user
    user = await Database.db.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id})
    
    # Return user data
    user_response = UserResponse(
        id=user_id,
        email=user["email"],
        name=user["name"],
        is_verified=user.get("is_verified", False),
        created_at=user["created_at"],
        favorites=user.get("favorites", [])
    )
    
    return Token(access_token=access_token, user=user_response)


@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Verify user email"""
    from bson import ObjectId
    
    token_data = verification_tokens.get(request.token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    if datetime.now() > token_data["expires_at"]:
        del verification_tokens[request.token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )
    
    # Update user as verified - convert string ID to ObjectId
    user_id = token_data["user_id"]
    try:
        user_object_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
    except:
        user_object_id = user_id
        
    await Database.db.users.update_one(
        {"_id": user_object_id},
        {"$set": {"is_verified": True}}
    )
    
    # Remove used token
    del verification_tokens[request.token]
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(current_user: User = Depends(get_current_user)):
    """Resend email verification"""
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Generate new verification token
    verification_token = generate_verification_token()
    verification_tokens[verification_token] = {
        "user_id": current_user.id,
        "email": current_user.email,
        "expires_at": datetime.now() + timedelta(hours=24)
    }
    
    # Send verification email
    await send_verification_email(current_user.email, verification_token)
    
    return {"message": "Verification email sent successfully"}


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset"""
    user = await Database.db.users.find_one({"email": request.email})
    
    # Don't reveal if email exists or not (security best practice)
    if not user:
        return {"message": "If the email exists, a reset link will be sent"}
    
    # Generate reset token
    reset_token = generate_verification_token()
    reset_tokens[reset_token] = {
        "user_id": str(user["_id"]),
        "email": request.email,
        "expires_at": datetime.now() + timedelta(hours=1)
    }
    
    # Send reset email
    await send_password_reset_email(request.email, reset_token)
    
    return {"message": "If the email exists, a reset link will be sent"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token"""
    from bson import ObjectId
    
    token_data = reset_tokens.get(request.token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    if datetime.now() > token_data["expires_at"]:
        del reset_tokens[request.token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password - convert string ID to ObjectId
    user_id = token_data["user_id"]
    try:
        user_object_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
    except:
        user_object_id = user_id
        
    hashed_password = hash_password(request.new_password)
    await Database.db.users.update_one(
        {"_id": user_object_id},
        {"$set": {"password": hashed_password}}
    )
    
    # Remove used token
    del reset_tokens[request.token]
    
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        favorites=current_user.favorites
    )


@router.post("/favorites/add")
async def add_favorite(
    request: FavoriteRequest,
    current_user: User = Depends(get_current_user)
):
    """Add product to favorites"""
    from bson import ObjectId
    
    await Database.db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$addToSet": {"favorites": request.product_id}}
    )
    return {"message": "Added to favorites"}


@router.post("/favorites/remove")
async def remove_favorite(
    request: FavoriteRequest,
    current_user: User = Depends(get_current_user)
):
    """Remove product from favorites"""
    from bson import ObjectId
    
    await Database.db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$pull": {"favorites": request.product_id}}
    )
    return {"message": "Removed from favorites"}


@router.get("/favorites")
async def get_favorites(current_user: User = Depends(get_current_user)):
    """Get user's favorite products"""
    from bson import ObjectId
    
    # Get product IDs
    favorite_ids = [ObjectId(fav_id) for fav_id in current_user.favorites if ObjectId.is_valid(fav_id)]
    
    # Fetch products
    products = []
    async for product in Database.db.products.find({"_id": {"$in": favorite_ids}}):
        product["_id"] = str(product["_id"])
        products.append(product)
    
    return {"favorites": products}

