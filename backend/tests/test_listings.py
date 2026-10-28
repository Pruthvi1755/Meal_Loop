import pytest
from fastapi import status


def test_approved_partner_can_create_listing(client, test_users):
    """Test that an approved restaurant partner can upload a surplus dish."""
    headers = {"Authorization": f"Bearer {test_users['approved_partner_token']}"}
    payload = {
        "title": "Almond Croissant & Danish Box",
        "description": "Crisp flaky pastries baked this morning",
        "category": "bakery",
        "dietary_type": "Vegetarian",
        "original_price": 400.0,
        "discounted_price": 140.0,
        "available_quantity": 4,
        "pickup_window": "Today, 6:00 PM - 8:00 PM"
    }
    response = client.post("/api/v1/listings", json=payload, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Almond Croissant & Danish Box"
    assert data["discount_percent"] == 65
    assert data["listing_status"] == "active"


def test_pending_partner_cannot_create_listing(client, test_users):
    """STRICT INVARIANT: Unapproved / pending restaurant CANNOT upload food (403 Forbidden)."""
    headers = {"Authorization": f"Bearer {test_users['pending_partner_token']}"}
    payload = {
        "title": "Grand Buffet Surplus Pack",
        "category": "meals",
        "original_price": 600.0,
        "discounted_price": 200.0,
        "available_quantity": 5,
        "pickup_window": "Today, 8:00 PM - 9:30 PM"
    }
    response = client.post("/api/v1/listings", json=payload, headers=headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "pending" in response.json()["detail"].lower()


def test_invalid_pricing_discount_higher_than_original(client, test_users):
    """Test that setting discounted price higher than original price returns 400 Bad Request."""
    headers = {"Authorization": f"Bearer {test_users['approved_partner_token']}"}
    payload = {
        "title": "Invalid Price Item",
        "category": "bakery",
        "original_price": 100.0,
        "discounted_price": 250.0,  # Invalid: higher than original
        "available_quantity": 3,
        "pickup_window": "Today, 7:00 PM - 8:00 PM"
    }
    response = client.post("/api/v1/listings", json=payload, headers=headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "cannot be greater" in response.json()["detail"].lower()


def test_public_listings_discovery(client, test_users):
    """Test public listing discovery endpoint returns approved restaurants only."""
    response = client.get("/api/v1/listings")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # All listings must be active and have positive stock
    for item in data:
        assert item["listing_status"] == "active"
        assert item["available_quantity"] > 0
