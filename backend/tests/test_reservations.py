import pytest
from fastapi import status


def test_customer_can_reserve_and_pay(client, test_users):
    """Test reservation workflow with atomic inventory decrement and pickup code generation."""
    listing_id = test_users["listing"].id
    initial_stock = test_users["listing"].available_quantity
    headers = {"Authorization": f"Bearer {test_users['customer_token']}"}

    payload = {
        "listing_id": listing_id,
        "quantity": 2,
        "payment_method": "simulated_upi"
    }

    response = client.post("/api/v1/reservations", json=payload, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["status"] == "confirmed"
    assert data["payment_status"] == "paid_simulated"
    assert data["quantity"] == 2
    assert data["total_price"] == 300.0  # 150 * 2
    assert data["pickup_code"].startswith("BLR-")

    # Verify inventory in database was decremented
    listing_res = client.get("/api/v1/listings")
    current_listing = next(l for l in listing_res.json() if l["id"] == listing_id)
    assert current_listing["available_quantity"] == initial_stock - 2


def test_overselling_prevention_raises_conflict(client, test_users):
    """INVENTORY SAFETY: Attempting to reserve more than available inventory returns 409 Conflict."""
    listing_id = test_users["listing"].id
    available = test_users["listing"].available_quantity
    headers = {"Authorization": f"Bearer {test_users['customer_token']}"}

    # Request more than currently available
    payload = {
        "listing_id": listing_id,
        "quantity": available + 5,
        "payment_method": "simulated_card"
    }

    response = client.post("/api/v1/reservations", json=payload, headers=headers)
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "insufficient inventory" in response.json()["detail"].lower()


def test_pickup_verification_workflow(client, test_users):
    """Test pickup code verification by the restaurant partner."""
    customer_headers = {"Authorization": f"Bearer {test_users['customer_token']}"}
    partner_headers = {"Authorization": f"Bearer {test_users['approved_partner_token']}"}

    # 1. Customer reserves 1 item
    res_payload = {
        "listing_id": test_users["listing"].id,
        "quantity": 1,
        "payment_method": "simulated_upi"
    }
    create_res = client.post("/api/v1/reservations", json=res_payload, headers=customer_headers)
    assert create_res.status_code == status.HTTP_201_CREATED
    pickup_code = create_res.json()["pickup_code"]

    # 2. Partner verifies the pickup code
    verify_payload = {"pickup_code": pickup_code}
    verify_res = client.post("/api/v1/reservations/verify-pickup", json=verify_payload, headers=partner_headers)
    assert verify_res.status_code == status.HTTP_200_OK
    assert verify_res.json()["status"] == "collected"
    assert verify_res.json()["collected_at"] is not None


def test_invalid_pickup_code_returns_404(client, test_users):
    """Test that submitting an unverified or nonexistent pickup code returns 404."""
    partner_headers = {"Authorization": f"Bearer {test_users['approved_partner_token']}"}
    verify_payload = {"pickup_code": "BLR-0000"}

    response = client.post("/api/v1/reservations/verify-pickup", json=verify_payload, headers=partner_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_customer_cancellation_restocks_inventory(client, test_users):
    """Test that customer cancelling a reservation returns inventory back to listing."""
    customer_headers = {"Authorization": f"Bearer {test_users['customer_token']}"}
    listing_id = test_users["listing"].id

    # 1. Create reservation of 2 items
    create_res = client.post("/api/v1/reservations", json={"listing_id": listing_id, "quantity": 2}, headers=customer_headers)
    reservation_id = create_res.json()["id"]

    # Check inventory before cancel
    listing_res1 = client.get("/api/v1/listings")
    stock_before = next(l for l in listing_res1.json() if l["id"] == listing_id)["available_quantity"]

    # 2. Cancel reservation
    cancel_res = client.patch(f"/api/v1/reservations/{reservation_id}/cancel", headers=customer_headers)
    assert cancel_res.status_code == status.HTTP_200_OK
    assert cancel_res.json()["status"] == "cancelled"
    assert cancel_res.json()["payment_status"] == "refunded_simulated"

    # 3. Check inventory was restored (+2)
    listing_res2 = client.get("/api/v1/listings")
    stock_after = next(l for l in listing_res2.json() if l["id"] == listing_id)["available_quantity"]
    assert stock_after == stock_before + 2
