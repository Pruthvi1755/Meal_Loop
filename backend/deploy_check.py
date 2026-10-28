import os
import sys

# Ensure C extensions are disabled
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.seed import seed_initial_data
from sqlalchemy import text


def verify_and_seed_deployment():
    """
    Utility script for cloud deployments (Neon DB / Render):
    1. Validates connection to database.
    2. Ensures all tables (users, restaurants, food_listings, reservations) exist.
    3. Seeds initial super admin and sample accounts if database is empty.
    """
    print(f"[DEPLOY] Target Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    
    try:
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[DEPLOY] Database ping successful!")
        
        # Create all tables
        print("[DEPLOY] Verifying schema and tables...")
        Base.metadata.create_all(bind=engine)
        print("[DEPLOY] Tables verified successfully.")
        
        # Seed initial data
        db = SessionLocal()
        try:
            print("[DEPLOY] Checking initial seed accounts...")
            seed_initial_data(db)
            print("[DEPLOY] Seed verified successfully.")
        finally:
            db.close()
            
        print("[DEPLOY] Ready for production traffic!")
        return 0
    except Exception as e:
        print(f"[DEPLOY ERROR] Database initialization failed: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(verify_and_seed_deployment())
