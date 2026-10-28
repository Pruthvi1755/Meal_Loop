import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.seed import seed_initial_data
from app.routers import (
    health_router,
    auth_router,
    restaurants_router,
    admin_router,
    listings_router,
    reservations_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hook for startup and shutdown events."""
    print(f"[STARTUP] {settings.PROJECT_NAME} starting up in [{settings.ENVIRONMENT}] mode.")
    
    # Auto-create tables if not present
    Base.metadata.create_all(bind=engine)
    
    # Run seed script for admin & initial accounts
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

    print(f"[INFO] API Documentation available at: http://localhost:8000/docs")
    yield
    print(f"[SHUTDOWN] {settings.PROJECT_NAME} shutting down cleanly.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for MealLoop surplus food discovery & reservation marketplace (Bengaluru)",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS Middleware for Frontend React communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.onrender\.com)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(restaurants_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(listings_router, prefix=settings.API_V1_STR)
app.include_router(reservations_router, prefix=settings.API_V1_STR)
app.include_router(health_router)  # Also expose /health at root


@app.get("/", tags=["Root"])
def read_root():
    """Welcome endpoint confirming server status."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
