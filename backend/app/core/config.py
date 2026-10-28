from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings
    Loads configuration values from environment variables or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "MealLoop API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = "mealloop-dev-super-secret-key-bengaluru-2026-surplus"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database: Supports PostgreSQL and local SQLite
    DATABASE_URL: str = "sqlite:///./mealloop.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            # Neon DB and cloud providers often provide postgres:// or postgresql://
            if cleaned.startswith("postgres://"):
                cleaned = cleaned.replace("postgres://", "postgresql+psycopg2://", 1)
            elif cleaned.startswith("postgresql://") and not cleaned.startswith("postgresql+psycopg2://"):
                cleaned = cleaned.replace("postgresql://", "postgresql+psycopg2://", 1)
            return cleaned
        return v

    # CORS Allowed Origins
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://meal-loop-seven.vercel.app"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()
