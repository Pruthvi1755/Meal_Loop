import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FoodDetailsModal from './components/FoodDetailsModal';
import AuthModal from './components/AuthModal';
import HomeView from './views/HomeView';
import CustomerDashboard from './views/CustomerDashboard';
import BusinessDashboard from './views/BusinessDashboard';
import AdminDashboard from './views/AdminDashboard';
import { apiGetCurrentUser, apiLogout, apiGetListings } from './services/api';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_CUSTOMER_ORDERS,
  INITIAL_BUSINESS_LISTINGS,
  INITIAL_BUSINESS_RESERVATIONS
} from './data/mockData';

export default function App() {
  // Theme State (Apple Light / Dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mealloop_theme') || 'light';
  });

  // Current Navigation Tab
  const [currentView, setCurrentView] = useState('marketplace'); // 'marketplace' | 'customer' | 'business' | 'admin'

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState('customer');
  const [authMode, setAuthMode] = useState('login');

  // Application Data States
  const [foodItems, setFoodItems] = useState(INITIAL_FOOD_ITEMS);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [customerOrders, setCustomerOrders] = useState(INITIAL_CUSTOMER_ORDERS);
  const [businessListings, setBusinessListings] = useState(INITIAL_BUSINESS_LISTINGS);
  const [businessReservations, setBusinessReservations] = useState(INITIAL_BUSINESS_RESERVATIONS);

  // Sync theme with document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mealloop_theme', theme);
  }, [theme]);

  // Load user session and live surplus listings on application mount
  useEffect(() => {
    apiGetCurrentUser().then(user => {
      if (user) setCurrentUser(user);
    });
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const data = await apiGetListings();
      if (data && data.length > 0) {
        const mapped = data.map(item => ({
          id: `db-${item.id}`,
          name: item.title,
          restaurantName: item.restaurant_name || 'Partner Kitchen',
          restaurantAddress: item.restaurant_address || 'Bengaluru',
          category: item.category,
          originalPrice: item.original_price,
          discountedPrice: item.discounted_price,
          discountPercent: item.discount_percent,
          quantityAvailable: item.available_quantity,
          pickupWindow: item.pickup_window,
          distance: '0.8 km away',
          image: item.image_url || 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80',
          description: item.description || 'Daily fresh surplus.',
          dietary: [item.dietary_type || 'Fresh Daily'],
          rating: 4.9,
          status: 'available'
        }));
        setFoodItems(mapped);
      }
    } catch (err) {
      console.warn('Could not load listings from database:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenAuth = (roleOrTab = 'login', mode = 'login') => {
    let role = 'customer';
    let pMode = mode;
    if (roleOrTab === 'partner' || roleOrTab === 'business' || roleOrTab === 'register_partner') {
      role = 'partner';
      if (roleOrTab === 'register_partner') pMode = 'register';
    } else if (roleOrTab === 'admin') {
      role = 'admin';
    }
    setAuthRole(role);
    setAuthMode(pMode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    // Direct user to appropriate landing dashboard based on their role
    if (user.role === 'restaurant_partner') {
      setCurrentView('business');
    } else if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('marketplace');
    }
  };

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setCurrentView('marketplace');
  };

  // Open food details modal
  const handleOpenFoodDetails = (food) => {
    setSelectedFood(food);
    setIsDetailsOpen(true);
  };

  // Reserve a food item
  const handleReserveFood = (newOrder, foodId, reservedQty) => {
    // If not authenticated, prompt login first
    if (!currentUser) {
      setIsDetailsOpen(false);
      handleOpenAuth('login');
      alert('Please sign in or create an account to reserve and rescue surplus food.');
      return;
    }

    // 1. Add to customer orders
    setCustomerOrders(prev => [newOrder, ...prev]);

    // 2. Add to business reservations queue
    const bizRes = {
      id: `RES-${Math.floor(500 + Math.random() * 500)}`,
      orderId: newOrder.id,
      customerName: currentUser.full_name,
      itemTitle: newOrder.foodName,
      quantity: reservedQty,
      pickupCode: newOrder.pickupCode,
      window: newOrder.pickupWindow,
      status: 'PENDING_PICKUP',
      amount: newOrder.pricePaid
    };
    setBusinessReservations(prev => [bizRes, ...prev]);

    // 3. Decrement available quantity on food marketplace
    setFoodItems(prev =>
      prev.map(item => {
        if (item.id === foodId) {
          const remaining = Math.max(0, item.quantityAvailable - reservedQty);
          return { ...item, quantityAvailable: remaining };
        }
        return item;
      })
    );
  };

  // Cancel reservation
  const handleCancelOrder = (orderId) => {
    setCustomerOrders(prev =>
      prev.map(ord => ord.id === orderId ? { ...ord, status: 'CANCELLED' } : ord)
    );
  };

  // Business: Add new surplus listing
  const handleAddBusinessListing = (newListing) => {
    setBusinessListings(prev => [newListing, ...prev]);

    // Also reflect on the public marketplace
    const marketplaceItem = {
      id: `food-${Date.now()}`,
      name: newListing.title,
      restaurantName: currentUser?.restaurant?.business_name || 'The Bangalore Baking Co.',
      restaurantAddress: currentUser?.restaurant?.address || '100 Feet Road, Indiranagar, Bengaluru',
      category: newListing.category.toLowerCase(),
      originalPrice: newListing.originalPrice,
      discountedPrice: newListing.discountedPrice,
      discountPercent: Math.round(((newListing.originalPrice - newListing.discountedPrice) / newListing.originalPrice) * 100),
      quantityAvailable: newListing.quantityRemaining,
      pickupWindow: newListing.pickupWindow,
      distance: '0.8 km away',
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80',
      description: 'Freshly listed surplus from today’s artisanal production. High quality guarantee.',
      dietary: ['Fresh Daily'],
      rating: 4.9,
      status: 'available'
    };

    setFoodItems(prev => [marketplaceItem, ...prev]);
  };

  // Business: Mark pickup as collected
  const handleVerifyPickup = (resId) => {
    setBusinessReservations(prev =>
      prev.map(r => r.id === resId ? { ...r, status: 'COLLECTED' } : r)
    );

    const res = businessReservations.find(r => r.id === resId);
    if (res && res.pickupCode) {
      setCustomerOrders(prev =>
        prev.map(ord => ord.pickupCode === res.pickupCode ? { ...ord, status: 'COMPLETED' } : ord)
      );
    }
  };

  const activeReservationsCount = customerOrders.filter(o => o.status === 'READY_FOR_PICKUP').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Apple-style Solid Navbar with Auth State */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeOrderCount={activeReservationsCount}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="container" style={{ flexGrow: 1, paddingBottom: 'var(--space-8)' }}>
        {currentView === 'marketplace' && (
          <HomeView
            foodItems={foodItems}
            onSelectFood={handleOpenFoodDetails}
            onExploreCategory={() => {}}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'customer' && (
          <CustomerDashboard
            orders={customerOrders}
            onCancelOrder={handleCancelOrder}
            onDiscoverMore={() => setCurrentView('marketplace')}
          />
        )}

        {currentView === 'business' && (
          <BusinessDashboard
            listings={businessListings}
            reservations={businessReservations}
            onAddListing={handleAddBusinessListing}
            onVerifyPickup={handleVerifyPickup}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Apple-style Minimal Footer */}
      <Footer />

      {/* Food Details & Reservation Modal */}
      <FoodDetailsModal
        food={selectedFood}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onReserve={handleReserveFood}
      />

      {/* Solid Apple-inspired Authentication Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authRole}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
