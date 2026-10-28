import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Configure connection arguments based on database engine type
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create SQLAlchemy Database Engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Automatically tests connections before using them
    echo=False           # Set to True if you want to see raw SQL logs
)

# Session factory bound to the engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Dependency that yields a thread-safe database session
    for the lifecycle of an HTTP request, then guarantees it is closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
