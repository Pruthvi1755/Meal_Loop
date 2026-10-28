from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RestaurantUpdateRequest(BaseModel):
    """Payload sent by restaurant partner to update their business profile."""
    business_name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    business_type: Optional[str] = None
    cuisine_type: Optional[str] = None
    address: Optional[str] = Field(None, min_length=5)
    locality: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    image_url: Optional[str] = None
    pickup_instructions: Optional[str] = None


class RestaurantDetailResponse(BaseModel):
    """Full restaurant details returned by API."""
    id: int
    owner_user_id: int
    business_name: str
    description: Optional[str] = None
    business_type: str
    cuisine_type: Optional[str] = None
    address: str
    locality: str
    opening_time: str
    closing_time: str
    image_url: Optional[str] = None
    pickup_instructions: Optional[str] = None
    approval_status: str
    created_at: datetime
    
    # Nested owner info (populated from relationship)
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    owner_phone: Optional[str] = None

    class Config:
        from_attributes = True


class RestaurantApprovalRequest(BaseModel):
    """Payload sent by Admin to approve, reject, or suspend a restaurant partner."""
    status: str = Field(..., pattern="^(approved|rejected|suspended|pending)$", example="approved")
    admin_notes: Optional[str] = Field(None, example="Verified physical FSSAI certificate and kitchen inspection.")


class PartnerDashboardMetricsResponse(BaseModel):
    """Aggregated database metrics for the partner dashboard."""
    business_name: str
    locality: str
    approval_status: str
    active_listings_count: int = 0
    pending_reservations_count: int = 0
    completed_pickups_count: int = 0
    total_revenue_inr: float = 0.0
