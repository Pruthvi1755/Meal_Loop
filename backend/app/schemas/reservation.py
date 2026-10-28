from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReservationCreateRequest(BaseModel):
    """Payload to reserve a food item with simulated payment."""
    listing_id: int = Field(..., gt=0, example=1)
    quantity: int = Field(1, gt=0, le=50, example=1)
    payment_method: str = Field("simulated_upi", example="simulated_upi")


class PickupVerifyRequest(BaseModel):
    """Payload for restaurant partner verifying a customer's pickup code."""
    pickup_code: str = Field(..., min_length=4, max_length=20, example="BLR-7049")


class ReservationResponse(BaseModel):
    """Detailed reservation response for customer and partner dashboards."""
    id: int
    customer_user_id: int
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None

    listing_id: int
    food_title: str
    food_category: Optional[str] = None
    food_image: Optional[str] = None

    restaurant_id: int
    restaurant_name: str
    restaurant_address: str
    locality: Optional[str] = None

    quantity: int
    unit_price: float
    total_price: float
    original_value: float
    savings_amount: float

    pickup_code: str
    pickup_window: str
    status: str
    payment_status: str
    payment_method: str

    created_at: datetime
    collected_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True
