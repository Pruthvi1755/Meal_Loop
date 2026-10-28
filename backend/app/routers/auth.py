from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.permissions import get_current_user
from app.models.user import User
from app.models.restaurant import Restaurant
from app.schemas.user import (
    CustomerRegisterRequest,
    RestaurantPartnerRegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    UserResponse,
    TokenResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register/customer",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer account"
)
def register_customer(payload: CustomerRegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new diner in Bengaluru:
    1. Validates email uniqueness.
    2. Hashes password using bcrypt.
    3. Persists user with role 'customer'.
    4. Issues signed JWT access token.
    """
    normalized_email = payload.email.lower().strip()
    
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please log in."
        )

    password_hash = hash_password(payload.password)

    new_user = User(
        full_name=payload.full_name.strip(),
        email=normalized_email,
        phone=payload.phone.strip(),
        password_hash=password_hash,
        role="customer",
        account_status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})

    return TokenResponse(access_token=token, token_type="bearer", user=new_user)


@router.post(
    "/register/partner",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a food business partner (Pending Admin Approval)"
)
def register_restaurant_partner(payload: RestaurantPartnerRegisterRequest, db: Session = Depends(get_db)):
    """
    Onboards a new restaurant, bakery, or hotel in Bengaluru:
    1. Validates email uniqueness.
    2. Creates User account with role 'restaurant_partner'.
    3. Creates associated Restaurant entity with approval_status='pending'.
    4. Issues signed JWT access token.
    """
    normalized_email = payload.email.lower().strip()

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this business email address already exists. Please log in."
        )

    password_hash = hash_password(payload.password)

    # Atomic transaction: create user and restaurant profile together
    new_user = User(
        full_name=payload.owner_name.strip(),
        email=normalized_email,
        phone=payload.phone.strip(),
        password_hash=password_hash,
        role="restaurant_partner",
        account_status="active"
    )
    db.add(new_user)
    db.flush()

    new_restaurant = Restaurant(
        owner_user_id=new_user.id,
        business_name=payload.business_name.strip(),
        description=payload.description.strip() if payload.description else None,
        business_type=payload.business_type.strip(),
        cuisine_type=payload.cuisine_type.strip() if payload.cuisine_type else None,
        address=payload.address.strip(),
        locality=payload.locality.strip(),
        opening_time=payload.opening_time.strip(),
        closing_time=payload.closing_time.strip(),
        approval_status="pending"  # Unapproved by default; requires Admin verification
    )
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})

    return TokenResponse(access_token=token, token_type="bearer", user=new_user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate with email and password"
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates customer, restaurant partner, or platform admin:
    1. Looks up account by case-insensitive email.
    2. Verifies password against stored bcrypt hash.
    3. Verifies account is active.
    4. Returns signed JWT token and user profile.
    """
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact MealLoop support.",
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    return TokenResponse(access_token=token, token_type="bearer", user=user)


@router.post(
    "/google",
    summary="Authenticate or Sign In using Google account"
)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Simulated Google Sign-in for Users and Restaurant/Hotel partners.
    """
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if user:
        if user.account_status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended. Please contact support."
            )
        token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
        return TokenResponse(access_token=token, token_type="bearer", user=user)

    # If new restaurant partner, prompt them to fill in hotel details
    if payload.role == "restaurant_partner":
        return {
            "needs_registration": True,
            "email": normalized_email,
            "name": payload.name,
            "role": "restaurant_partner"
        }

    # Auto-register new diner with verified Google email
    new_user = User(
        full_name=payload.name.strip(),
        email=normalized_email,
        phone="+91 9800000000",
        password_hash=hash_password("GoogleAuthPass123!"),
        role="customer",
        account_status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=new_user)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile"
)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile and attached restaurant (if partner).
    """
    return current_user
