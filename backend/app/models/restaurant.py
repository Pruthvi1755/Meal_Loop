from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Restaurant(Base):
    """
    SQLAlchemy ORM Model representing a registered restaurant or food partner in Bengaluru.
    """
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    business_name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    business_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Bakery, Cafe, Pizzeria, Biryani House
    cuisine_type: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    locality: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Indiranagar, Koramangala, etc.
    opening_time: Mapped[str] = mapped_column(String(10), nullable=False, default="08:00")
    closing_time: Mapped[str] = mapped_column(String(10), nullable=False, default="22:00")
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pickup_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    approval_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        index=True
    )  # 'pending', 'approved', 'rejected', 'suspended'

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
    owner: Mapped["User"] = relationship("User", back_populates="restaurant")
    listings: Mapped[List["FoodListing"]] = relationship(
        "FoodListing",
        back_populates="restaurant",
        cascade="all, delete-orphan"
    )
