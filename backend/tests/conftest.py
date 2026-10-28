import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test environment
os.environ["ENVIRONMENT"] = "testing"

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.listing import FoodListing
from app.models.reservation import Reservation
from app.core.security import hash_password, create_access_token

# Isolated in-memory SQLite database for test suite
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables before tests and tear down after session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    """Provide a clean database session per test function with rollback."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    """FastAPI TestClient with overridden get_db dependency."""
    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_users(db):
    """Seeds test accounts: admin, approved partner, pending partner, and customer."""
    # 1. Admin
    admin = User(
        full_name="Platform Admin",
        email="test_admin@mealloop.in",
        phone="+91 8011223344",
        password_hash=hash_password("Admin@12345"),
        role="admin",
        account_status="active"
    )
    db.add(admin)

    # 2. Approved Partner
    partner_approved = User(
        full_name="Approved Chef",
        email="chef_approved@indiranagar.com",
        phone="+91 9900112233",
        password_hash=hash_password("Partner@12345"),
        role="restaurant_partner",
        account_status="active"
    )
    db.add(partner_approved)
    db.flush()

    rest_approved = Restaurant(
        owner_user_id=partner_approved.id,
        business_name="Artisan Sourdough Kitchen",
        description="Daily fresh bakery",
        business_type="Bakery & Cafe",
        locality="Indiranagar",
        address="100 Feet Road, Indiranagar, Bengaluru",
        opening_time="07:00",
        closing_time="22:00",
        approval_status="approved"
    )
    db.add(rest_approved)
    db.flush()

    # 3. Pending Partner (unapproved)
    partner_pending = User(
        full_name="New Hotelier",
        email="new_hotelier@mgroad.com",
        phone="+91 9988112233",
        password_hash=hash_password("Partner@12345"),
        role="restaurant_partner",
        account_status="active"
    )
    db.add(partner_pending)
    db.flush()

    rest_pending = Restaurant(
        owner_user_id=partner_pending.id,
        business_name="Grand Heritage Dining",
        description="Buffet and meals",
        business_type="Hotel Dining",
        locality="MG Road",
        address="MG Road, Bengaluru",
        opening_time="08:00",
        closing_time="23:00",
        approval_status="pending"
    )
    db.add(rest_pending)

    # 4. Customer
    customer = User(
        full_name="Kavya Sharma",
        email="kavya@gmail.com",
        phone="+91 9845112233",
        password_hash=hash_password("Customer@12345"),
        role="customer",
        account_status="active"
    )
    db.add(customer)

    # 5. Sample Food Listing for Approved Restaurant (5 units)
    listing = FoodListing(
        restaurant_id=rest_approved.id,
        title="Artisan French Baguette Set",
        description="Freshly baked baguettes",
        category="bakery",
        dietary_type="Vegetarian",
        original_price=450.0,
        discounted_price=150.0,
        discount_percent=67,
        available_quantity=5,
        pickup_window="Today, 7:00 PM - 9:00 PM",
        listing_status="active"
    )
    db.add(listing)

    db.commit()

    return {
        "admin": admin,
        "admin_token": create_access_token(data={"sub": str(admin.id), "email": admin.email, "role": admin.role}),
        "approved_partner": partner_approved,
        "approved_partner_token": create_access_token(data={"sub": str(partner_approved.id), "email": partner_approved.email, "role": partner_approved.role}),
        "approved_restaurant": rest_approved,
        "pending_partner": partner_pending,
        "pending_partner_token": create_access_token(data={"sub": str(partner_pending.id), "email": partner_pending.email, "role": partner_pending.role}),
        "pending_restaurant": rest_pending,
        "customer": customer,
        "customer_token": create_access_token(data={"sub": str(customer.id), "email": customer.email, "role": customer.role}),
        "listing": listing
    }
