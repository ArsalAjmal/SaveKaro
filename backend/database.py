from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

async def get_database():
    """Get the database instance"""
    if Database.db is None:
        raise RuntimeError("Database not connected. Call connect_to_mongo() first.")
    return Database.db

async def get_collection():
    db = await get_database()
    return db[settings.COLLECTION_NAME]

async def connect_to_mongo():
    """Connect to MongoDB on startup"""
    Database.client = AsyncIOMotorClient(settings.MONGO_URI)
    Database.db = Database.client[settings.DB_NAME]
    print(f"Connected to MongoDB: {settings.DB_NAME}")

async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    if Database.client:
        Database.client.close()
    print("Closed MongoDB connection")

# For convenience, create a global db reference
db = None

def get_db():
    """Get the database synchronously (for imports)"""
    return Database.db
