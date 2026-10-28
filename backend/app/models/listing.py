from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class FoodListing(Base):
    """
    SQLAlchemy ORM Model representing a surplus food listing/dish
    uploaded by an approved restaurant in Bengaluru.
    """
    __tablename__ = "food_listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # bakery, meals, deli, produce
    dietary_type: Mapped[str] = mapped_column(String(50), nullable=False, default="Vegetarian")
    
    original_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discounted_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    available_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    
    pickup_window: Mapped[str] = mapped_column(String(100), nullable=False, default="Today, 6:30 PM – 8:30 PM")
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    listing_status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    restaurant: Mapped["Restaurant"] = relationship("Restaurant", back_populates="listings")
    reservations = relationship("Reservation", back_populates="listing", cascade="all, delete-orphan")
