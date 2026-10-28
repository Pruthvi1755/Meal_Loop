from sqlalchemy.orm import Session
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.listing import FoodListing
from app.core.security import hash_password


def seed_initial_data(db: Session) -> None:
    """
    Seeds essential platform accounts & initial surplus dishes if database is fresh:
    1. Super Administrator (admin@mealloop.in)
    2. Approved Sample Partner (partner@bangalorebaking.com)
    3. Sample Customer (customer@mealloop.in)
    4. Initial Surplus Dishes for Approved Partner
    """
    # 1. Super Admin
    admin_email = "admin@mealloop.in"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        admin_user = User(
            full_name="MealLoop Operations Admin",
            email=admin_email,
            phone="+91 8012345678",
            password_hash=hash_password("Admin@12345"),
            role="admin",
            account_status="active"
        )
        db.add(admin_user)
        print(f"[SEED] Created default admin account: {admin_email}")

    # 2. Approved Sample Partner (The Bangalore Baking Co.)
    partner_email = "partner@bangalorebaking.com"
    partner_user = db.query(User).filter(User.email == partner_email).first()
    sample_restaurant = None

    if not partner_user:
        partner_user = User(
            full_name="Chef Vikram Sengupta",
            email=partner_email,
            phone="+91 9845012345",
            password_hash=hash_password("Partner@12345"),
            role="restaurant_partner",
            account_status="active"
        )
        db.add(partner_user)
        db.flush()

        sample_restaurant = Restaurant(
            owner_user_id=partner_user.id,
            business_name="The Bangalore Baking Co.",
            description="European artisan boulangerie and cafe on 100 Feet Road.",
            business_type="Bakery & Cafe",
            cuisine_type="French Pastries & Sourdough",
            address="100 Feet Road, Indiranagar, Bengaluru",
            locality="Indiranagar",
            opening_time="07:30",
            closing_time="22:30",
            approval_status="approved"
        )
        db.add(sample_restaurant)
        db.flush()
        print(f"[SEED] Created default approved partner: {partner_email}")
    else:
        sample_restaurant = db.query(Restaurant).filter(Restaurant.owner_user_id == partner_user.id).first()

    # 3. Sample Customer
    customer_email = "customer@mealloop.in"
    customer_user = db.query(User).filter(User.email == customer_email).first()
    if not customer_user:
        customer_user = User(
            full_name="Aditi Rao",
            email=customer_email,
            phone="+91 9876543210",
            password_hash=hash_password("Customer@12345"),
            role="customer",
            account_status="active"
        )
        db.add(customer_user)
        print(f"[SEED] Created default customer account: {customer_email}")

    # 4. Seed initial dishes if restaurant exists and has 0 listings
    if sample_restaurant:
        count = db.query(FoodListing).filter(FoodListing.restaurant_id == sample_restaurant.id).count()
        if count == 0:
            dishes = [
                FoodListing(
                    restaurant_id=sample_restaurant.id,
                    title="Artisan Sourdough Loaf & Roasted Almond Croissant",
                    description="Freshly baked wild yeast sourdough batard paired with two rich almond frangipane croissants baked this afternoon.",
                    category="bakery",
                    dietary_type="Vegetarian",
                    original_price=580.0,
                    discounted_price=199.0,
                    discount_percent=66,
                    available_quantity=4,
                    pickup_window="Today, 6:30 PM – 8:30 PM",
                    image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
                    listing_status="active"
                ),
                FoodListing(
                    restaurant_id=sample_restaurant.id,
                    title="Filter Coffee Brioche Buns (Pack of 4)",
                    description="Fluffy brioche infused with fresh Chikmagalur filter coffee roast and dusted with organic brown sugar.",
                    category="bakery",
                    dietary_type="Vegetarian",
                    original_price=380.0,
                    discounted_price=130.0,
                    discount_percent=65,
                    available_quantity=6,
                    pickup_window="Today, 7:00 PM – 9:00 PM",
                    image_url="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
                    listing_status="active"
                )
            ]
            for d in dishes:
                db.add(d)
            print(f"[SEED] Seeded initial surplus dishes for {sample_restaurant.business_name}")

    db.commit()
