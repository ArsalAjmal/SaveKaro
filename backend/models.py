from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProductVariant(BaseModel):
    """Individual variant/size of a product"""
    size: Optional[str] = None
    in_stock: bool = False
    price: Optional[float] = None
    original_price: Optional[float] = None
    sku: Optional[str] = None
    inventory_quantity: int = 0

class Product(BaseModel):
    """Product model matching the scraped data structure"""
    id: Optional[str] = Field(None, alias="_id")
    title: str
    brand: str
    price: float
    original_price: Optional[float] = None
    discount_percent: int = 0
    gender: Optional[str] = None
    category: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None
    source: str
    currency: str = "PKR"
    tags: List[str] = []
    scraped_at: Optional[datetime] = None
    variants: List[Dict[str, Any]] = []

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "title": "Men's Cotton Shirt",
                "brand": "Outfitters",
                "price": 1999,
                "original_price": 2999,
                "discount_percent": 33,
                "gender": "men",
                "category": "shirt",
                "url": "https://outfitters.com.pk/products/mens-shirt",
                "image_url": "https://cdn.shopify.com/...",
                "source": "outfitters.com.pk",
                "currency": "PKR",
                "tags": ["sale", "cotton"],
                "variants": [
                    {"size": "M", "in_stock": True, "price": 1999, "original_price": 2999, "sku": "SHIRT-M-001", "inventory_quantity": 5},
                    {"size": "L", "in_stock": False, "price": 1999, "original_price": 2999, "sku": "SHIRT-L-001", "inventory_quantity": 0}
                ]
            }
        }

class ProductFilters(BaseModel):
    """Query filters for product search"""
    brand: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_discount: Optional[int] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "discount_percent"  # discount_percent, price, -price
    limit: int = 50
    skip: int = 0

class ProductResponse(BaseModel):
    """API response with pagination"""
    total: int
    skip: int
    limit: int
    products: List[Product]

# ===== AUTH MODELS =====

class UserCreate(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str

class User(BaseModel):
    """User model"""
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    name: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    favorites: List[str] = []  # List of product IDs

    class Config:
        populate_by_name = True

class UserResponse(BaseModel):
    """User response without sensitive data"""
    id: str
    email: str
    name: str
    is_verified: bool
    created_at: datetime
    favorites: List[str] = []

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    """Reset password with token"""
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    """Email verification"""
    token: str

class FavoriteRequest(BaseModel):
    """Add/remove favorite"""
    product_id: str
