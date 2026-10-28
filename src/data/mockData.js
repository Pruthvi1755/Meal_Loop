// MealLoop Mock Dataset - Bengaluru Edition (INR Pricing & Local Culinary Spots)

export const CATEGORIES = [
  { id: 'all', name: 'All Surplus', count: 32 },
  { id: 'bakery', name: 'Artisan Bakery & Cafes', count: 12 },
  { id: 'meals', name: 'Prepared Meals & Biryani', count: 10 },
  { id: 'deli', name: 'Gourmet Rolls & Wraps', count: 6 },
  { id: 'produce', name: 'Farm-Fresh & Groceries', count: 4 }
];

export const INITIAL_FOOD_ITEMS = [
  {
    id: 'food-1',
    name: 'Artisan Sourdough Loaf & Roasted Almond Croissant',
    restaurantName: 'The Bangalore Baking Co.',
    restaurantAddress: '100 Feet Road, Indiranagar',
    category: 'bakery',
    originalPrice: 580,
    discountedPrice: 199,
    discountPercent: 66,
    quantityAvailable: 4,
    pickupWindow: 'Today, 6:30 PM – 8:30 PM',
    distance: '0.8 km away',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    description: 'Freshly baked wild yeast sourdough batard paired with two rich almond frangipane croissants baked this afternoon.',
    dietary: ['Vegetarian', 'Zero Preservatives'],
    rating: 4.9,
    status: 'available'
  },
  {
    id: 'food-2',
    name: 'Hyderabadi Dum Biryani & Mirchi Ka Salan (Surplus Pot)',
    restaurantName: 'Meghana Heritage Kitchen',
    restaurantAddress: 'Koramangala 5th Block',
    category: 'meals',
    originalPrice: 420,
    discountedPrice: 159,
    discountPercent: 62,
    quantityAvailable: 5,
    pickupWindow: 'Tonight, 9:30 PM – 10:30 PM',
    distance: '1.2 km away',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80',
    description: 'Slow-cooked aromatic basmati rice with fragrant spices, tender marinated chicken, boiled egg, mirchi ka salan, and raita.',
    dietary: ['Halal', 'Chef Signature'],
    rating: 4.8,
    status: 'available'
  },
  {
    id: 'food-3',
    name: 'Handcrafted Truffle Burrata Pizza & Garlic Knots',
    restaurantName: 'Brik Oven Neapolitan Pizzeria',
    restaurantAddress: 'Church Street, Central Bengaluru',
    category: 'meals',
    originalPrice: 790,
    discountedPrice: 289,
    discountPercent: 63,
    quantityAvailable: 3,
    pickupWindow: 'Tonight, 10:00 PM – 11:00 PM',
    distance: '2.1 km away',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    description: 'Wood-fired sourdough crust, San Marzano tomato sauce, fresh creamy burrata from Kengeri dairy, and black truffle oil.',
    dietary: ['Vegetarian'],
    rating: 4.9,
    status: 'available'
  },
  {
    id: 'food-4',
    name: 'Organic Bengaluru Harvest Bowl & Cold-Pressed Juice',
    restaurantName: 'Green Theory Organic Cafe',
    restaurantAddress: 'Residency Road, Richmond Town',
    category: 'meals',
    originalPrice: 490,
    discountedPrice: 179,
    discountPercent: 63,
    quantityAvailable: 6,
    pickupWindow: 'Today, 7:00 PM – 8:30 PM',
    distance: '1.5 km away',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    description: 'Ancient grain millets, local roasted greens, farm avocado, sprouts, and cold-pressed Valencia orange juice.',
    dietary: ['Vegan', 'Gluten-Free'],
    rating: 4.7,
    status: 'available'
  },
  {
    id: 'food-5',
    name: 'Smoked Butter Chicken Roll & Masala Fries Set',
    restaurantName: 'Kolkata Kathi & Rolls Co.',
    restaurantAddress: '27th Main, HSR Layout Sector 1',
    category: 'deli',
    originalPrice: 350,
    discountedPrice: 129,
    discountPercent: 63,
    quantityAvailable: 7,
    pickupWindow: 'Today, 6:00 PM – 8:00 PM',
    distance: '2.8 km away',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80',
    description: 'Charcoal-grilled chicken rolled in flakey layered paratha with mint chutney, sliced onions, and peri peri spiced potato wedges.',
    dietary: ['Popular Street Food'],
    rating: 4.6,
    status: 'available'
  },
  {
    id: 'food-6',
    name: 'Signature Mysore Pak & Filter Coffee Macarons',
    restaurantName: 'Glen’s Bakehouse & Confectionery',
    restaurantAddress: 'Lavelle Road, Bengaluru',
    category: 'bakery',
    originalPrice: 520,
    discountedPrice: 189,
    discountPercent: 64,
    quantityAvailable: 3,
    pickupWindow: 'Today, 7:30 PM – 9:00 PM',
    distance: '1.8 km away',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    description: 'Artisanal fusion dessert box: 4 signature filter coffee macarons made with Chikmagalur roast and fresh soft melt-in-mouth Mysore Pak.',
    dietary: ['Vegetarian', 'Local Sweet'],
    rating: 5.0,
    status: 'available'
  }
];

export const NEARBY_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'The Bangalore Baking Co.',
    type: 'European Boulangerie & Cafe',
    mealsRescued: 842,
    rating: 4.9,
    address: '100 Feet Rd, Indiranagar',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rest-2',
    name: 'Brik Oven Neapolitan Pizzeria',
    type: 'Wood-fired Italian',
    mealsRescued: 615,
    rating: 4.9,
    address: 'Church Street, Bengaluru',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rest-3',
    name: 'Green Theory Organic Cafe',
    type: 'Farm-to-Table & Vegan',
    mealsRescued: 930,
    rating: 4.7,
    address: 'Residency Road, Bengaluru',
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_CUSTOMER_ORDERS = [
  {
    id: 'ORD-8921',
    foodName: 'Artisan Sourdough Loaf & Roasted Almond Croissant',
    restaurantName: 'The Bangalore Baking Co.',
    restaurantAddress: '100 Feet Road, Indiranagar, Bengaluru',
    pickupCode: 'BLR-7049',
    pickupWindow: 'Today, 6:30 PM – 8:30 PM',
    pricePaid: 199,
    originalValue: 580,
    quantity: 1,
    status: 'READY_FOR_PICKUP',
    date: '2026-10-26',
    co2SavedKg: 2.1
  },
  {
    id: 'ORD-8812',
    foodName: 'Hyderabadi Dum Biryani & Mirchi Ka Salan (Surplus Pot)',
    restaurantName: 'Meghana Heritage Kitchen',
    restaurantAddress: 'Koramangala 5th Block, Bengaluru',
    pickupCode: 'BLR-6124',
    pickupWindow: 'Yesterday, 9:30 PM – 10:30 PM',
    pricePaid: 159,
    originalValue: 420,
    quantity: 1,
    status: 'COMPLETED',
    date: '2026-10-25',
    co2SavedKg: 3.4
  },
  {
    id: 'ORD-8703',
    foodName: 'Organic Bengaluru Harvest Bowl & Cold-Pressed Juice',
    restaurantName: 'Green Theory Organic Cafe',
    restaurantAddress: 'Residency Road, Richmond Town, Bengaluru',
    pickupCode: 'BLR-5491',
    pickupWindow: 'Oct 24, 7:00 PM – 8:30 PM',
    pricePaid: 179,
    originalValue: 490,
    quantity: 1,
    status: 'COMPLETED',
    date: '2026-10-24',
    co2SavedKg: 1.8
  }
];

export const INITIAL_BUSINESS_LISTINGS = [
  {
    id: 'BL-101',
    title: 'Artisan Sourdough Loaf & Almond Croissant',
    category: 'Bakery',
    quantityTotal: 6,
    quantityRemaining: 4,
    originalPrice: 580,
    discountedPrice: 199,
    pickupWindow: '6:30 PM – 8:30 PM',
    status: 'ACTIVE'
  },
  {
    id: 'BL-102',
    title: 'Filter Coffee Brioche Buns (Pack of 4)',
    category: 'Bakery',
    quantityTotal: 5,
    quantityRemaining: 0,
    originalPrice: 380,
    discountedPrice: 130,
    pickupWindow: '5:00 PM – 6:30 PM',
    status: 'SOLD_OUT'
  },
  {
    id: 'BL-103',
    title: 'Rustic Herb Focaccia with Rosemary',
    category: 'Bakery',
    quantityTotal: 5,
    quantityRemaining: 5,
    originalPrice: 320,
    discountedPrice: 110,
    pickupWindow: '7:00 PM – 8:30 PM',
    status: 'ACTIVE'
  }
];

export const INITIAL_BUSINESS_RESERVATIONS = [
  {
    id: 'RES-401',
    orderId: 'ORD-8921',
    customerName: 'Ananya Sharma',
    itemTitle: 'Artisan Sourdough Loaf & Almond Croissant',
    quantity: 1,
    pickupCode: 'BLR-7049',
    window: '6:30 PM – 8:30 PM',
    status: 'PENDING_PICKUP',
    amount: 199
  },
  {
    id: 'RES-400',
    orderId: 'ORD-8890',
    customerName: 'Rohan Deshmukh',
    itemTitle: 'Filter Coffee Brioche Buns (Pack of 4)',
    quantity: 2,
    pickupCode: 'BLR-5982',
    window: '5:00 PM – 6:30 PM',
    status: 'COLLECTED',
    amount: 260
  }
];

export const INITIAL_ADMIN_DATA = {
  stats: {
    totalRescuedMeals: 28450,
    activeMerchants: 218,
    co2DivertedTons: 64.2,
    customerSavingsInr: 5840200
  },
  merchants: [
    { id: 'M-1', name: 'The Bangalore Baking Co.', type: 'Bakery & Cafe', activeListings: 2, totalRescued: 842, status: 'VERIFIED', rating: 4.9 },
    { id: 'M-2', name: 'Brik Oven Neapolitan Pizzeria', type: 'Italian Pizzeria', activeListings: 1, totalRescued: 615, status: 'VERIFIED', rating: 4.9 },
    { id: 'M-3', name: 'Green Theory Organic Cafe', type: 'Organic & Farm-Fresh', activeListings: 3, totalRescued: 930, status: 'VERIFIED', rating: 4.7 },
    { id: 'M-4', name: 'Meghana Heritage Kitchen', type: 'Biryani & Andhra Meals', activeListings: 1, totalRescued: 1420, status: 'VERIFIED', rating: 4.8 },
    { id: 'M-5', name: 'Kolkata Kathi & Rolls Co.', type: 'Rolls & Fast Casual', activeListings: 2, totalRescued: 390, status: 'VERIFIED', rating: 4.6 },
    { id: 'M-6', name: 'Glen’s Bakehouse', type: 'Bakes & Desserts', activeListings: 1, totalRescued: 760, status: 'VERIFIED', rating: 5.0 }
  ]
};
