from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.restaurants import router as restaurants_router
from app.routers.admin import router as admin_router
from app.routers.listings import router as listings_router
from app.routers.reservations import router as reservations_router

__all__ = [
    "health_router",
    "auth_router",
    "restaurants_router",
    "admin_router",
    "listings_router",
    "reservations_router"
]
