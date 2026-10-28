import random
import string
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_user, get_current_restaurant_partner
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.listing import FoodListing
from app.models.reservation import Reservation
from app.schemas.reservation import (
    ReservationCreateRequest,
    PickupVerifyRequest,
    ReservationResponse
)

router = APIRouter(prefix="/reservations", tags=["Reservations & Orders"])


def _generate_pickup_code(db: Session) -> str:
    """Generate a unique 6-character pickup code formatted as BLR-XXXX."""
    for _ in range(20):
        suffix = "".join(random.choices(string.digits, k=4))
        code = f"BLR-{suffix}"
        exists = db.query(Reservation).filter(Reservation.pickup_code == code).first()
        if not exists:
            return code
    return f"BLR-{int(datetime.utcnow().timestamp()) % 10000:04d}"


def _format_reservation_response(res: Reservation) -> ReservationResponse:
    """Helper to enrich reservation with listing and restaurant metadata."""
    resp = ReservationResponse(
        id=res.id,
        customer_user_id=res.customer_user_id,
        customer_name=res.customer.full_name if res.customer else "Diner",
        customer_phone=res.customer.phone if res.customer else None,
        listing_id=res.listing_id,
        food_title=res.listing.title if res.listing else "Surplus Food Package",
        food_category=res.listing.category if res.listing else None,
        food_image=res.listing.image_url if res.listing else None,
        restaurant_id=res.restaurant_id,
        restaurant_name=res.restaurant.business_name if res.restaurant else "Partner Restaurant",
        restaurant_address=res.restaurant.address if res.restaurant else "Bengaluru",
        locality=res.restaurant.locality if res.restaurant else "Bengaluru",
        quantity=res.quantity,
        unit_price=float(res.unit_price),
        total_price=float(res.total_price),
        original_value=float(res.original_value),
        savings_amount=float(res.savings_amount),
        pickup_code=res.pickup_code,
        pickup_window=res.pickup_window,
        status=res.status,
        payment_status=res.payment_status,
        payment_method=res.payment_method,
        created_at=res.created_at,
        collected_at=res.collected_at,
        cancelled_at=res.cancelled_at
    )
    return resp


@router.post(
    "",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Reserve a surplus food listing with simulated payment (Atomic Inventory Lock)"
)
def create_reservation(
    payload: ReservationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CRITICAL WORKFLOW & INVENTORY SAFETY:
    1. Locks the food listing row using `with_for_update()` to prevent race conditions & overselling.
    2. Validates that the requested quantity <= available_quantity.
    3. Decrements inventory atomically.
    4. Records simulated payment & generates a verified pickup code.
    """
    if current_user.role not in ["customer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customer accounts can reserve meals."
        )

    # 1. Fetch listing with row lock (prevents concurrent overselling)
    listing = (
        db.query(FoodListing)
        .filter(FoodListing.id == payload.listing_id)
        .with_for_update()
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food listing #{payload.listing_id} not found."
        )

    if listing.listing_status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This listing is no longer active or is already sold out."
        )

    # 2. Strict Inventory Safety Check
    if listing.available_quantity < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient inventory. Only {listing.available_quantity} item(s) remaining for '{listing.title}'."
        )

    # 3. Calculate financial totals
    unit_discounted = float(listing.discounted_price)
    unit_original = float(listing.original_price)
    total_price = round(unit_discounted * payload.quantity, 2)
    original_value = round(unit_original * payload.quantity, 2)
    savings_amount = round(original_value - total_price, 2)

    # 4. Atomically decrement inventory
    listing.available_quantity -= payload.quantity
    if listing.available_quantity == 0:
        listing.listing_status = "sold_out"

    pickup_code = _generate_pickup_code(db)

    # 5. Create reservation record
    reservation = Reservation(
        customer_user_id=current_user.id,
        listing_id=listing.id,
        restaurant_id=listing.restaurant_id,
        quantity=payload.quantity,
        unit_price=unit_discounted,
        total_price=total_price,
        original_value=original_value,
        savings_amount=savings_amount,
        pickup_code=pickup_code,
        pickup_window=listing.pickup_window,
        status="confirmed",
        payment_status="paid_simulated",
        payment_method=payload.payment_method
    )

    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return _format_reservation_response(reservation)


@router.get(
    "/my-reservations",
    response_model=List[ReservationResponse],
    summary="Get customer's active and past reservations"
)
def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all reservations placed by the authenticated customer."""
    reservations = (
        db.query(Reservation)
        .filter(Reservation.customer_user_id == current_user.id)
        .order_by(Reservation.created_at.desc())
        .all()
    )
    return [_format_reservation_response(r) for r in reservations]


@router.get(
    "/restaurant",
    response_model=List[ReservationResponse],
    summary="Get restaurant partner's customer pickup queue"
)
def get_restaurant_reservations(
    current_partner: User = Depends(get_current_restaurant_partner),
    db: Session = Depends(get_db)
):
    """Returns all orders/reservations placed at the authenticated partner's restaurant."""
    restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == current_partner.id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant profile not found for this partner account."
        )

    reservations = (
        db.query(Reservation)
        .filter(Reservation.restaurant_id == restaurant.id)
        .order_by(Reservation.created_at.desc())
        .all()
    )
    return [_format_reservation_response(r) for r in reservations]


@router.post(
    "/verify-pickup",
    response_model=ReservationResponse,
    summary="Verify customer pickup code and mark order collected (Partner only)"
)
def verify_pickup_code(
    payload: PickupVerifyRequest,
    current_partner: User = Depends(get_current_restaurant_partner),
    db: Session = Depends(get_db)
):
    """
    Partner enters customer's pickup code (e.g. BLR-7049):
    1. Validates code matches a reservation for partner's restaurant.
    2. Marks reservation as 'collected'.
    3. Records collection timestamp.
    """
    restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == current_partner.id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant profile not found."
        )

    cleaned_code = payload.pickup_code.strip().upper()
    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.pickup_code == cleaned_code,
            Reservation.restaurant_id == restaurant.id
        )
        .first()
    )

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pickup code '{cleaned_code}' was not found for your restaurant."
        )

    if reservation.status == "collected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This meal was already collected at {reservation.collected_at.strftime('%I:%M %p')}."
        )

    if reservation.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reservation was cancelled by the customer."
        )

    reservation.status = "collected"
    reservation.collected_at = datetime.utcnow()
    db.commit()
    db.refresh(reservation)

    return _format_reservation_response(reservation)


@router.patch(
    "/{reservation_id}/cancel",
    response_model=ReservationResponse,
    summary="Cancel reservation and return inventory (Customer only)"
)
def cancel_reservation(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancels an active reservation:
    1. Verifies ownership.
    2. Checks status is 'confirmed'.
    3. Locks listing row with `with_for_update()` and restocks inventory.
    4. Sets reservation status to 'cancelled' and payment status to 'refunded_simulated'.
    """
    reservation = (
        db.query(Reservation)
        .filter(Reservation.id == reservation_id)
        .first()
    )

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reservation #{reservation_id} not found."
        )

    if reservation.customer_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this reservation."
        )

    if reservation.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a reservation with status '{reservation.status}'."
        )

    # Restock inventory safely
    listing = (
        db.query(FoodListing)
        .filter(FoodListing.id == reservation.listing_id)
        .with_for_update()
        .first()
    )
    if listing:
        listing.available_quantity += reservation.quantity
        if listing.listing_status == "sold_out":
            listing.listing_status = "active"

    reservation.status = "cancelled"
    reservation.payment_status = "refunded_simulated"
    reservation.cancelled_at = datetime.utcnow()

    db.commit()
    db.refresh(reservation)

    return _format_reservation_response(reservation)
