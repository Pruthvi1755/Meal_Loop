from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FoodListingCreateRequest(BaseModel):
    """Payload sent by approved partner to create a new surplus dish/package."""
    title: str = Field(..., min_length=2, max_length=150, example="Artisan Sourdough Loaf & Almond Croissant")
    description: Optional[str] = Field(None, example="Freshly baked wild yeast sourdough batard with frangipane croissants.")
    category: str = Field(..., example="bakery")
    dietary_type: str = Field("Vegetarian", example="Vegetarian")
    original_price: float = Field(..., gt=0, example=580.0)
    discounted_price: float = Field(..., gt=0, example=199.0)
    available_quantity: int = Field(..., gt=0, example=5)
    pickup_window: str = Field("Today, 6:30 PM – 8:30 PM", example="Today, 6:30 PM – 8:30 PM")
    image_url: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80")


class FoodListingResponse(BaseModel):
    """Publicly visible food listing details."""
    id: int
    restaurant_id: int
    restaurant_name: Optional[str] = None
    restaurant_address: Optional[str] = None
    locality: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: str
    dietary_type: str
    original_price: float
    discounted_price: float
    discount_percent: int
    available_quantity: int
    pickup_window: str
    image_url: Optional[str] = None
    listing_status: str
    created_at: datetime

    class Config:
        from_attributes = True
