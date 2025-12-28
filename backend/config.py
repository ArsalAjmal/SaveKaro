from pydantic_settings import BaseSettings
from typing import List
import secrets
import os

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "fwd_project"
    COLLECTION_NAME: str = "products"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    SECRET_KEY: str = secrets.token_hex(32)  # Generate a random key if not provided
    
    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""  # Will be set from .env
    SMTP_PASSWORD: str = ""  # Will be set from .env (App Password)
    EMAIL_FROM: str = ""  # Will be set from .env
    EMAIL_ENABLED: bool = False  # Set to True to enable real emails

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'

settings = Settings()
