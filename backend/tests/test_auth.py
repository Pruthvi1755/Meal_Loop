import pytest
from fastapi import status


def test_customer_registration_success(client):
    """Test successful customer registration with automatic customer role."""
    payload = {
        "full_name": "Rohan Mehra",
        "email": "rohan.mehra@gmail.com",
        "phone": "+91 9876500000",
        "password": "SecurePassword123"
    }
    response = client.post("/api/v1/auth/register/customer", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "rohan.mehra@gmail.com"
    assert data["user"]["role"] == "customer"


def test_customer_duplicate_email_fails(client, test_users):
    """Test that registering with an existing email returns 409 Conflict."""
    payload = {
        "full_name": "Duplicate User",
        "email": test_users["customer"].email,
        "phone": "+91 9999988888",
        "password": "SomePassword123"
    }
    response = client.post("/api/v1/auth/register/customer", json=payload)
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"].lower()


def test_partner_registration_status_is_pending(client):
    """Test that new restaurant registration creates pending approval status."""
    payload = {
        "owner_name": "Chef Sumanth",
        "business_name": "Koramangala Biryani Point",
        "business_type": "Biryani & Meals",
        "locality": "Koramangala",
        "address": "5th Block, Koramangala, Bengaluru",
        "email": "sumanth@biryanipoint.com",
        "phone": "+91 9888001122",
        "password": "PartnerPassword123",
        "opening_time": "11:00",
        "closing_time": "23:00"
    }
    response = client.post("/api/v1/auth/register/partner", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["user"]["role"] == "restaurant_partner"
    assert data["user"]["restaurant"]["approval_status"] == "pending"


def test_login_valid_credentials(client, test_users):
    """Test successful login returning JWT token."""
    payload = {
        "email": test_users["customer"].email,
        "password": "Customer@12345"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client, test_users):
    """Test login with wrong password returns 401 Unauthorized."""
    payload = {
        "email": test_users["customer"].email,
        "password": "WrongPassword999"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "incorrect" in response.json()["detail"].lower()


def test_unauthorized_access_to_protected_route(client):
    """Test that requesting protected endpoints without token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_role_restriction_customer_cannot_access_admin(client, test_users):
    """Test that customer token cannot access admin routes (403 Forbidden)."""
    headers = {"Authorization": f"Bearer {test_users['customer_token']}"}
    response = client.get("/api/v1/admin/stats", headers=headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
