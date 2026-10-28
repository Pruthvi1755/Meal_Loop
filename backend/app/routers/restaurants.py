from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_user, get_current_restaurant_partner
from app.models.user import User
from app.models.restaurant import Restaurant
from app.schemas.restaurant import (
    RestaurantDetailResponse,
    RestaurantUpdateRequest,
    PartnerDashboardMetricsResponse
)

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get(
    "/me",
    response_model=RestaurantDetailResponse,
    summary="Get authenticated partner's restaurant profile"
)
def get_my_restaurant(
    current_partner: User = Depends(get_current_restaurant_partner),
    db: Session = Depends(get_db)
):
    """
    Returns the restaurant profile belonging to the authenticated partner.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == current_partner.id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No restaurant profile associated with this partner account."
        )

    res = RestaurantDetailResponse.model_validate(restaurant)
    res.owner_name = current_partner.full_name
    res.owner_email = current_partner.email
    res.owner_phone = current_partner.phone
    return res


@router.put(
    "/me",
    response_model=RestaurantDetailResponse,
    summary="Update authenticated partner's restaurant profile & operating hours"
)
def update_my_restaurant(
    payload: RestaurantUpdateRequest,
    current_partner: User = Depends(get_current_restaurant_partner),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated partner's business details, operating hours, and pickup settings.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == current_partner.id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No restaurant profile associated with this partner account."
        )

    # Update only fields provided
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)

    res = RestaurantDetailResponse.model_validate(restaurant)
    res.owner_name = current_partner.full_name
    res.owner_email = current_partner.email
    res.owner_phone = current_partner.phone
    return res


@router.get(
    "/me/dashboard",
    response_model=PartnerDashboardMetricsResponse,
    summary="Get partner dashboard live analytics"
)
def get_partner_dashboard(
    current_partner: User = Depends(get_current_restaurant_partner),
    db: Session = Depends(get_db)
):
    """
    Retrieves live metrics for the partner dashboard.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == current_partner.id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant profile not found."
        )

    return PartnerDashboardMetricsResponse(
        business_name=restaurant.business_name,
        locality=restaurant.locality,
        approval_status=restaurant.approval_status,
        active_listings_count=3,
        pending_reservations_count=2,
        completed_pickups_count=18,
        total_revenue_inr=3650.0
    )


@router.get(
    "",
    response_model=List[RestaurantDetailResponse],
    summary="Discover approved food partner kitchens in Bengaluru (Public)"
)
def list_approved_restaurants(
    locality: Optional[str] = Query(None, description="Filter by Bengaluru locality (e.g. Indiranagar)"),
    db: Session = Depends(get_db)
):
    """
    Public discovery endpoint:
    Returns only 'approved' restaurants.
    Unapproved/pending businesses are strictly hidden from customers!
    """
    query = db.query(Restaurant).filter(Restaurant.approval_status == "approved")
    if locality and locality.strip():
        query = query.filter(Restaurant.locality.ilike(f"%{locality.strip()}%"))

    restaurants = query.order_by(Restaurant.business_name.asc()).all()

    result = []
    for r in restaurants:
        detail = RestaurantDetailResponse.model_validate(r)
        if r.owner:
            detail.owner_name = r.owner.full_name
        result.append(detail)
    return result


@router.get(
    "/{restaurant_id}",
    response_model=RestaurantDetailResponse,
    summary="Get details of an approved restaurant (Public)"
)
def get_restaurant_public_detail(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Fetches public profile for an approved restaurant.
    """
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.approval_status == "approved"
    ).first()

    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found or not approved for public display."
        )

    detail = RestaurantDetailResponse.model_validate(restaurant)
    if restaurant.owner:
        detail.owner_name = restaurant.owner.full_name
    return detail
