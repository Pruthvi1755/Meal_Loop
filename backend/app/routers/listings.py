from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_restaurant_partner
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.listing import FoodListing
from app.schemas.listing import FoodListingCreateRequest, FoodListingResponse

router = APIRouter(prefix="/listings", tags=["Food Listings"])


@router.post(
    "",
    response_model=FoodListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new surplus dish/menu item (Approved Partners Only)"
)
def create_food_listing(
    payload: FoodListingCreateRequest,
    current_partner: User = Depends(get_current_restaurant_partner),
    db: Session = Depends(get_db)
):
    """
    Creates a new surplus food offer in PostgreSQL:
    1. Verifies that the authenticated partner owns a restaurant.
    2. STRICT INVARIANT: Verifies that restaurant approval_status == 'approved'.
       Unapproved restaurants CANNOT publish dishes.
    3. Validates that discounted_price <= original_price.
    4. Automatically calculates discount percentage.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == current_partner.id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant profile not found for this partner account."
        )

    # STRICT APPROVAL CHECK
    if restaurant.approval_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your restaurant '{restaurant.business_name}' is currently [{restaurant.approval_status.upper()}]. You cannot upload food or menu items until platform administration has approved your account."
        )

    if payload.discounted_price > payload.original_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Discounted surplus price cannot be greater than the original price."
        )

    discount_percent = int(round(
        ((payload.original_price - payload.discounted_price) / payload.original_price) * 100
    ))

    new_listing = FoodListing(
        restaurant_id=restaurant.id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        category=payload.category.lower().strip(),
        dietary_type=payload.dietary_type.strip(),
        original_price=payload.original_price,
        discounted_price=payload.discounted_price,
        discount_percent=discount_percent,
        available_quantity=payload.available_quantity,
        pickup_window=payload.pickup_window.strip(),
        image_url=payload.image_url.strip() if payload.image_url else "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80",
        listing_status="active"
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    resp = FoodListingResponse.model_validate(new_listing)
    resp.restaurant_name = restaurant.business_name
    resp.restaurant_address = restaurant.address
    resp.locality = restaurant.locality
    return resp


@router.get(
    "",
    response_model=List[FoodListingResponse],
    summary="Browse live surplus food offers in Bengaluru (Public)"
)
def list_active_food_listings(
    category: Optional[str] = Query(None, description="Category filter (e.g. bakery, meals, deli, produce)"),
    locality: Optional[str] = Query(None, description="Bengaluru locality filter"),
    search: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db)
):
    """
    Public discovery endpoint:
    Returns active surplus food listings from APPROVED restaurants only.
    """
    query = (
        db.query(FoodListing)
        .join(Restaurant)
        .filter(
            FoodListing.listing_status == "active",
            FoodListing.available_quantity > 0,
            Restaurant.approval_status == "approved"
        )
    )

    if category and category.lower() != "all":
        query = query.filter(FoodListing.category == category.lower().strip())

    if locality and locality.strip():
        query = query.filter(Restaurant.locality.ilike(f"%{locality.strip()}%"))

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (FoodListing.title.ilike(search_pattern)) |
            (Restaurant.business_name.ilike(search_pattern))
        )

    listings = query.order_by(FoodListing.created_at.desc()).all()

    results = []
    for item in listings:
        resp = FoodListingResponse.model_validate(item)
        if item.restaurant:
            resp.restaurant_name = item.restaurant.business_name
            resp.restaurant_address = item.restaurant.address
            resp.locality = item.restaurant.locality
        results.append(resp)
    return results


@router.get(
    "/my-listings",
    response_model=List[FoodListingResponse],
    summary="Get authenticated partner's surplus listings"
)
def list_my_restaurant_listings(
    current_partner: User = Depends(get_current_restaurant_partner),
    db: Session = Depends(get_db)
):
    """
    Returns all dishes/listings uploaded by the authenticated partner.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == current_partner.id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant profile not found."
        )

    listings = (
        db.query(FoodListing)
        .filter(FoodListing.restaurant_id == restaurant.id)
        .order_by(FoodListing.created_at.desc())
        .all()
    )

    results = []
    for item in listings:
        resp = FoodListingResponse.model_validate(item)
        resp.restaurant_name = restaurant.business_name
        resp.restaurant_address = restaurant.address
        resp.locality = restaurant.locality
        results.append(resp)
    return results
