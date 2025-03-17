import os
from typing import Any, Dict, List, Optional

from pydantic import AnyHttpUrl, EmailStr, PostgresDsn, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Système de Gestion des Congés"
    API_V1_STR: str = "/api"
    
    # Configuration JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev_secret_change_in_production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 heures
    
    # Configuration base de données
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/conges"
    )
    
    # Configuration email
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "localhost")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", 1025))
    EMAIL_USER: str = os.getenv("EMAIL_USER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_FROM: EmailStr = os.getenv("EMAIL_FROM", "noreply@conges.local")

    class Config:
        case_sensitive = True


settings = Settings()