import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "JOB HUB - AI-Powered Placement Platform"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-job-hub-prototype-2026-secure-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for dev/prototype convenience
    
    # Database (Default to SQLite for effortless zero-config run, or PostgreSQL via env)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./job_hub.db")
    
    # AI / LLM Keys (Supports Google Gemini or local deterministic fallback)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Matching Engine Weights (Configurable)
    WEIGHT_SEMANTIC: float = 0.40
    WEIGHT_SKILL: float = 0.30
    WEIGHT_EXP_EDU: float = 0.15
    WEIGHT_LOCATION: float = 0.15
    
    # Frontend Origin
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        case_sensitive = True

settings = Settings()
