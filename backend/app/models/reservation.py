from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Reservation(Base):
    """
    Persistent food reservation record in PostgreSQL:
    Tracks customer meal rescue, inventory decrement, simulated payment,
    unique pickup verification code, and pickup status.
    """
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    customer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id"), nullable=False, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)

    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    original_value = Column(Float, nullable=False)
    savings_amount = Column(Float, nullable=False)

    pickup_code = Column(String(20), unique=True, nullable=False, index=True)
    pickup_window = Column(String(100), nullable=False)

    # Status: 'confirmed', 'collected', 'cancelled'
    status = Column(String(20), nullable=False, default="confirmed", index=True)

    # Simulated Payment: 'paid_simulated', 'refunded_simulated'
    payment_status = Column(String(30), nullable=False, default="paid_simulated")
    payment_method = Column(String(50), nullable=False, default="simulated_upi_card")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    collected_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)

    # Relationships
    customer = relationship("User", foreign_keys=[customer_user_id])
    listing = relationship("FoodListing", back_populates="reservations")
    restaurant = relationship("Restaurant")
