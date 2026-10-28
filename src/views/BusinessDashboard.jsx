import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, PackageCheck, AlertCircle, Settings, ShieldCheck, MapPin, Store } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { apiGetMyRestaurant, apiUpdateMyRestaurant, apiGetMyListings, apiCreateListing, apiGetRestaurantReservations, apiVerifyPickup } from '../services/api';

export default function BusinessDashboard({
  listings,
  reservations,
  onAddListing,
  onVerifyPickup
}) {
  // Live Restaurant Profile State from PostgreSQL
  const [restaurantProfile, setRestaurantProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState(null);

  // Live Food Listings State from PostgreSQL
  const [liveListings, setLiveListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [createListingError, setCreateListingError] = useState(null);
  const [createListingSuccess, setCreateListingSuccess] = useState(null);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);

  // Live Customer Pickup Queue from PostgreSQL
  const [liveReservations, setLiveReservations] = useState([]);

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeVerificationMsg, setCodeVerificationMsg] = useState(null);

  // Profile Edit Form State
  const [editBizName, setEditBizName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState('');
  const [editLocality, setEditLocality] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOpenTime, setEditOpenTime] = useState('');
  const [editCloseTime, setEditCloseTime] = useState('');

  // New Listing Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Bakery');
  const [newOrigPrice, setNewOrigPrice] = useState('');
  const [newDiscPrice, setNewDiscPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('5');
  const [newWindow, setNewWindow] = useState('7:00 PM – 8:30 PM');

  // Load restaurant profile on mount
  useEffect(() => {
    loadProfile();
    loadMyListings();
    loadRestaurantReservations();
  }, []);

  const loadRestaurantReservations = async () => {
    try {
      const data = await apiGetRestaurantReservations();
      if (data && Array.isArray(data)) {
        const mapped = data.map(r => ({
          id: `RES-${r.id}`,
          dbId: r.id,
          customerName: r.customer_name || 'Diner',
          itemTitle: r.food_title,
          quantity: r.quantity,
          pickupCode: r.pickup_code,
          window: r.pickup_window,
          status: r.status === 'collected' ? 'COLLECTED' : 'PENDING_PICKUP',
          amount: r.total_price
        }));
        setLiveReservations(mapped);
      }
    } catch (err) {
      console.warn('Could not load restaurant reservations:', err);
    }
  };

  const loadMyListings = async () => {
    try {
      setLoadingListings(true);
      const data = await apiGetMyListings();
      if (data && Array.isArray(data)) {
        const mapped = data.map(item => ({
          id: `BL-${item.id}`,
          title: item.title,
          category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          quantityTotal: item.available_quantity,
          quantityRemaining: item.available_quantity,
          originalPrice: item.original_price,
          discountedPrice: item.discounted_price,
          pickupWindow: item.pickup_window,
          status: item.listing_status.toUpperCase()
        }));
        setLiveListings(mapped);
      }
    } catch (err) {
      console.warn('Could not load partner listings from API:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const data = await apiGetMyRestaurant();
      setRestaurantProfile(data);
      // Initialize edit form
      setEditBizName(data.business_name || '');
      setEditDesc(data.description || '');
      setEditType(data.business_type || 'Bakery & Cafe');
      setEditLocality(data.locality || 'Indiranagar');
      setEditAddress(data.address || '');
      setEditOpenTime(data.opening_time || '08:00');
      setEditCloseTime(data.closing_time || '22:00');
    } catch (err) {
      console.warn('Could not load restaurant profile from API:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiUpdateMyRestaurant({
        business_name: editBizName,
        description: editDesc,
        business_type: editType,
        locality: editLocality,
        address: editAddress,
        opening_time: editOpenTime,
        closing_time: editCloseTime
      });
      setRestaurantProfile(updated);
      setEditSuccessMsg('Business profile and operating hours saved successfully to database!');
      setTimeout(() => {
        setEditSuccessMsg(null);
        setIsEditProfileOpen(false);
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const isApproved = restaurantProfile ? restaurantProfile.approval_status === 'approved' : true;
  const isPending = restaurantProfile?.approval_status === 'pending';

  const displayListings = liveListings.length > 0 ? liveListings : listings;

  // Business Analytics
  const totalSalavagedItems = displayListings.reduce((acc, l) => acc + (l.quantityTotal - l.quantityRemaining), 0);
  const totalRevenue = reservations.reduce((acc, r) => acc + r.amount, 0);
  const activeListingsCount = displayListings.filter(l => l.status === 'ACTIVE').length;

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!newTitle || !newOrigPrice || !newDiscPrice) return;

    if (isPending) {
      alert('Your restaurant account is currently pending approval by Platform Administration. You will be able to publish public surplus listings once verified.');
      return;
    }

    try {
      setIsSubmittingListing(true);
      setCreateListingError(null);
      const res = await apiCreateListing({
        title: newTitle.trim(),
        description: `${newCategory} surplus fresh from our kitchen.`,
        category: newCategory.toLowerCase(),
        dietary_type: 'Vegetarian',
        original_price: parseFloat(newOrigPrice),
        discounted_price: parseFloat(newDiscPrice),
        available_quantity: parseInt(newQuantity, 10),
        pickup_window: newWindow.trim(),
        image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80'
      });

      setCreateListingSuccess(`"${res.title}" added to your live surplus menu!`);
      await loadMyListings();

      if (onAddListing) {
        onAddListing({
          id: `BL-${res.id}`,
          title: res.title,
          category: res.category,
          quantityTotal: res.available_quantity,
          quantityRemaining: res.available_quantity,
          originalPrice: res.original_price,
          discountedPrice: res.discounted_price,
          pickupWindow: res.pickup_window,
          status: 'ACTIVE'
        });
      }

      setTimeout(() => {
        setCreateListingSuccess(null);
        setNewTitle('');
        setNewOrigPrice('');
        setNewDiscPrice('');
        setNewQuantity('5');
        setIsAddModalOpen(false);
      }, 1200);

    } catch (err) {
      setCreateListingError(err.message || 'Failed to publish surplus listing.');
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const displayReservations = liveReservations.length > 0 ? liveReservations : reservations;

  const handleCodeVerify = async (e) => {
    e.preventDefault();
    if (!codeInput) return;

    try {
      const verified = await apiVerifyPickup(codeInput.trim());
      setCodeVerificationMsg({
        type: 'success',
        text: `Verified! Code matches ${verified.customer_name} for ${verified.food_title}. Marked as COLLECTED in database.`
      });
      setCodeInput('');
      await loadRestaurantReservations();
      if (onVerifyPickup) onVerifyPickup(verified.id);
    } catch (err) {
      // Local fallback
      const matched = reservations.find(r => r.pickupCode.toLowerCase() === codeInput.trim().toLowerCase());
      if (matched) {
        if (onVerifyPickup) onVerifyPickup(matched.id);
        setCodeVerificationMsg({
          type: 'success',
          text: `Verified! Code matches ${matched.customerName} for ${matched.itemTitle}.`
        });
        setCodeInput('');
      } else {
        setCodeVerificationMsg({
          type: 'error',
          text: err.message || `Code "${codeInput}" not found in current reservations.`
        });
      }
    }
  };

  const handleManualVerify = async (pickupCode, resId) => {
    try {
      await apiVerifyPickup(pickupCode);
      await loadRestaurantReservations();
    } catch (err) {
      console.warn('Manual verify API note:', err);
    }
    if (onVerifyPickup) onVerifyPickup(resId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingTop: 'var(--space-4)' }}>
      {/* Page Header with Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-1)' }}>
            <h1 className="text-h1">
              {restaurantProfile?.business_name || 'Merchant Partner Portal'}
            </h1>
            {isPending && <Badge variant="warning">Pending Admin Approval</Badge>}
            {isApproved && <Badge variant="success">Verified Partner Kitchen</Badge>}
          </div>
          <p className="text-body-muted">
            {restaurantProfile?.address || '100 Feet Road, Indiranagar, Bengaluru'} • Hours: {restaurantProfile?.opening_time || '08:00'} – {restaurantProfile?.closing_time || '22:00'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button
            variant="secondary"
            icon={Settings}
            onClick={() => setIsEditProfileOpen(true)}
          >
            Edit Profile & Hours
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Surplus Listing
          </Button>
        </div>
      </div>

      {/* Pending Approval Notice Banner */}
      {isPending && (
        <div
          style={{
            backgroundColor: 'var(--color-warning-subtle)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}
        >
          <AlertCircle size={22} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <div>
            <h4 className="font-semibold text-small" style={{ color: 'var(--color-warning)' }}>
              Account Verification in Progress
            </h4>
            <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Your restaurant application is currently under review by MealLoop Platform Administration. Once approved, your listings will be published publicly on the Bengaluru surplus food discovery marketplace.
            </p>
          </div>
        </div>
      )}

      {/* Analytics Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)' }}>
          <span className="text-uppercase-label">Active Surplus Offers</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-text-primary)' }}>
            {activeListingsCount}
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Available for customer reservation
          </span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)' }}>
          <span className="text-uppercase-label">Meals Salvaged Today</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-success)' }}>
            {totalSalavagedItems} items
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            100% prevented from disposal
          </span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)' }}>
          <span className="text-uppercase-label">Recovered Revenue</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-text-primary)' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Net captured today
          </span>
        </div>
      </div>

      {/* Quick Pickup Code Verification Tool */}
      <div
        className="card"
        style={{
          padding: 'var(--space-5)',
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        <h3 className="text-h4" style={{ marginBottom: 'var(--space-2)' }}>
          Quick Pickup Code Verification
        </h3>
        <p className="text-small" style={{ marginBottom: 'var(--space-4)' }}>
          Enter the customer’s 6-character code (e.g., BLR-7049) to mark their meal as collected.
        </p>

        <form onSubmit={handleCodeVerify} style={{ display: 'flex', gap: 'var(--space-3)', maxWidth: '480px' }}>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              setCodeVerificationMsg(null);
            }}
            placeholder="e.g. BLR-7049"
            style={{
              flexGrow: 1,
              height: '40px',
              padding: '0 12px',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-surface-secondary)',
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}
          />
          <Button variant="secondary" type="submit">
            Verify Code
          </Button>
        </form>

        {codeVerificationMsg && (
          <div
            style={{
              marginTop: 'var(--space-3)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              backgroundColor: codeVerificationMsg.type === 'success' ? 'var(--color-success-subtle)' : 'var(--color-error-subtle)',
              color: codeVerificationMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
            }}
          >
            {codeVerificationMsg.text}
          </div>
        )}
      </div>

      {/* Active Surplus Listings Table */}
      <div>
        <div style={{ marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="text-h3">Today's Surplus Listings</h2>
          <span className="text-small">{displayListings.length} items registered</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Listing Item</th>
                <th>Category</th>
                <th>Units Left</th>
                <th>Original</th>
                <th>Surplus Price</th>
                <th>Pickup Window</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayListings.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td>{item.category}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {item.quantityRemaining} / {item.quantityTotal}
                    </span>
                  </td>
                  <td style={{ textDecoration: 'line-through', color: 'var(--color-text-tertiary)' }}>
                    ₹{item.originalPrice}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-food-accent)' }}>
                    ₹{item.discountedPrice}
                  </td>
                  <td>{item.pickupWindow}</td>
                  <td>
                    {item.status === 'ACTIVE' ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="neutral">Sold Out</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Reservations Queue Table */}
      <div>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <h2 className="text-h3">Customer Pickup Queue</h2>
          <p className="text-small">Live reservations waiting for customer pickup today.</p>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Item Ordered</th>
                <th>Pickup Code</th>
                <th>Window</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayReservations.map((res) => {
                const isCollected = res.status === 'COLLECTED';
                return (
                  <tr key={res.id}>
                    <td style={{ fontWeight: 600 }}>{res.customerName}</td>
                    <td>{res.itemTitle} (x{res.quantity})</td>
                    <td>
                      <code
                        style={{
                          backgroundColor: 'var(--color-bg-surface-secondary)',
                          padding: '3px 6px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          color: 'var(--color-primary-accent)'
                        }}
                      >
                        {res.pickupCode}
                      </code>
                    </td>
                    <td>{res.window}</td>
                    <td>₹{res.amount}</td>
                    <td>
                      {isCollected ? (
                        <Badge variant="success">Collected</Badge>
                      ) : (
                        <Badge variant="warning">Pending Pickup</Badge>
                      )}
                    </td>
                    <td>
                      {!isCollected ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleManualVerify(res.pickupCode, res.id)}
                        >
                          <Check size={13} /> Mark Picked Up
                        </Button>
                      ) : (
                        <span className="text-small" style={{ color: 'var(--color-text-tertiary)' }}>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Restaurant Profile Modal (Phase 3) */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Restaurant Profile & Operating Hours"
        subtitle="Saved directly to persistent PostgreSQL database"
        maxWidth="580px"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {editSuccessMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--color-success-subtle)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.8125rem' }}>
              {editSuccessMsg}
            </div>
          )}

          <Input
            label="Business Name"
            required
            value={editBizName}
            onChange={(e) => setEditBizName(e.target.value)}
          />

          <Input
            label="Short Description"
            value={editDesc}
            placeholder="e.g. Artisanal sourdough bakery and specialty cafe"
            onChange={(e) => setEditDesc(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="input-group">
              <label className="input-label">Business Type</label>
              <select
                className="input-field"
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              >
                <option value="Bakery & Cafe">Bakery & Cafe</option>
                <option value="Pizzeria">Pizzeria</option>
                <option value="Biryani & Meals">Biryani & Meals</option>
                <option value="Organic & Healthy">Organic & Healthy</option>
                <option value="Deli & Rolls">Deli & Rolls</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Bengaluru Locality</label>
              <select
                className="input-field"
                value={editLocality}
                onChange={(e) => setEditLocality(e.target.value)}
              >
                <option value="Indiranagar">Indiranagar</option>
                <option value="Koramangala">Koramangala</option>
                <option value="Church Street">Church Street (CBD)</option>
                <option value="HSR Layout">HSR Layout</option>
                <option value="Whitefield">Whitefield</option>
                <option value="Malleshwaram">Malleshwaram</option>
                <option value="Jayanagar">Jayanagar</option>
              </select>
            </div>
          </div>

          <Input
            label="Street Address"
            required
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Opening Time"
              type="time"
              required
              value={editOpenTime}
              onChange={(e) => setEditOpenTime(e.target.value)}
            />
            <Input
              label="Closing Time"
              type="time"
              required
              value={editCloseTime}
              onChange={(e) => setEditCloseTime(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Surplus Listing Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Surplus Food Listing"
        subtitle="Offer fresh remaining items at a discounted surplus price"
      >
        <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {isPending && (
            <div
              style={{
                backgroundColor: 'var(--color-warning-subtle)',
                border: '1px solid var(--color-warning)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}
            >
              <AlertCircle size={20} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div>
                <h5 className="font-semibold text-small" style={{ color: 'var(--color-warning)' }}>
                  Platform Approval Required
                </h5>
                <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Your hotel/restaurant profile is currently under review by Platform Administration. Menu dish uploading is enabled immediately upon admin approval.
                </p>
              </div>
            </div>
          )}

          {createListingSuccess && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--color-success-subtle)', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} />
              {createListingSuccess}
            </div>
          )}

          {createListingError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--color-error-subtle)', color: 'var(--color-error)', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              {createListingError}
            </div>
          )}

          <Input
            label="Food / Package Title"
            required
            placeholder="e.g. Fresh Baked Sourdough & Croissant Set"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isPending || isSubmittingListing}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input-field"
                disabled={isPending || isSubmittingListing}
              >
                <option value="Bakery">Bakery & Pastries</option>
                <option value="Meals">Prepared Meals</option>
                <option value="Deli">Deli & Sandwiches</option>
                <option value="Produce">Artisan Produce</option>
              </select>
            </div>

            <Input
              label="Quantity Available"
              type="number"
              required
              min="1"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              disabled={isPending || isSubmittingListing}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input
              label="Original Price (₹)"
              type="number"
              required
              placeholder="e.g. 580"
              value={newOrigPrice}
              onChange={(e) => setNewOrigPrice(e.target.value)}
              disabled={isPending || isSubmittingListing}
            />
            <Input
              label="Discounted Surplus Price (₹)"
              type="number"
              required
              placeholder="e.g. 199"
              value={newDiscPrice}
              onChange={(e) => setNewDiscPrice(e.target.value)}
              disabled={isPending || isSubmittingListing}
            />
          </div>

          <Input
            label="Pickup Window"
            placeholder="e.g. Today, 6:30 PM – 8:00 PM"
            value={newWindow}
            onChange={(e) => setNewWindow(e.target.value)}
            disabled={isPending || isSubmittingListing}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isPending || isSubmittingListing}
            >
              {isSubmittingListing ? 'Publishing...' : isPending ? 'Locked (Pending Approval)' : 'Publish Listing'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
