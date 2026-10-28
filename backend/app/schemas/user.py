from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class CustomerRegisterRequest(BaseModel):
    """Payload sent by customer during registration."""
    full_name: str = Field(..., min_length=2, max_length=120, example="Aditi Rao")
    email: EmailStr = Field(..., example="aditi@example.com")
    phone: str = Field(..., min_length=10, max_length=15, example="+91 9876543210")
    password: str = Field(..., min_length=6, max_length=100, example="SuperSecurePass123")


class RestaurantPartnerRegisterRequest(BaseModel):
    """Payload sent by food partner during business onboarding."""
    owner_name: str = Field(..., min_length=2, max_length=120, example="Chef Vikram")
    email: EmailStr = Field(..., example="partner@bangalorebaking.com")
    phone: str = Field(..., min_length=10, max_length=15, example="+91 9845012345")
    password: str = Field(..., min_length=6, max_length=100, example="PartnerSecurePass123")
    
    # Business Details
    business_name: str = Field(..., min_length=2, max_length=150, example="The Bangalore Baking Co.")
    description: Optional[str] = Field(None, example="European artisan boulangerie and viennoiserie in Indiranagar.")
    business_type: str = Field(..., example="Bakery & Cafe")
    cuisine_type: Optional[str] = Field("Artisanal Bakes & Coffee", example="Artisanal Bakes & Coffee")
    address: str = Field(..., min_length=5, example="100 Feet Road, Indiranagar, Bengaluru")
    locality: str = Field(..., example="Indiranagar")
    opening_time: str = Field("08:00", example="08:00")
    closing_time: str = Field("22:00", example="22:00")


class LoginRequest(BaseModel):
    """Payload sent to authenticate an existing user."""
    email: EmailStr = Field(..., example="aditi@example.com")
    password: str = Field(..., example="SuperSecurePass123")


class GoogleAuthRequest(BaseModel):
    """Payload for Google Sign-In authentication."""
    email: EmailStr = Field(..., example="user@gmail.com")
    name: str = Field(..., example="Kavya Menon")
    role: str = Field("customer", example="customer")


class RestaurantSummaryResponse(BaseModel):
    """Restaurant info nested inside user profile."""
    id: int
    business_name: str
    business_type: str
    address: str
    locality: str
    approval_status: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """User profile response (passwords are strictly excluded)."""
    id: int
    full_name: str
    email: str
    phone: str
    role: str
    account_status: str
    created_at: datetime
    restaurant: Optional[RestaurantSummaryResponse] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Authentication response returning signed JWT access token and user info."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
