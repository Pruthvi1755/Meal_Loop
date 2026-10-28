import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Leaf, Clock, MapPin, QrCode, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { apiGetMyReservations, apiCancelReservation } from '../services/api';

export default function CustomerDashboard({ orders, onCancelOrder, onDiscoverMore }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyReservations();
  }, []);

  const loadMyReservations = async () => {
    try {
      setLoading(true);
      const data = await apiGetMyReservations();
      if (data && Array.isArray(data)) {
        const mapped = data.map(r => ({
          id: `ORD-${r.id}`,
          dbId: r.id,
          foodName: r.food_title,
          restaurantName: r.restaurant_name,
          restaurantAddress: r.restaurant_address,
          pickupCode: r.pickup_code,
          pickupWindow: r.pickup_window,
          pricePaid: r.total_price,
          originalValue: r.original_value,
          quantity: r.quantity,
          status: r.status === 'confirmed' ? 'READY_FOR_PICKUP' : r.status === 'collected' ? 'COMPLETED' : 'CANCELLED',
          date: new Date(r.created_at).toLocaleDateString(),
          co2SavedKg: (1.8 * r.quantity).toFixed(1)
        }));
        setLiveOrders(mapped);
      }
    } catch (err) {
      console.warn('Could not load reservations from database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (order) => {
    if (order.dbId) {
      try {
        await apiCancelReservation(order.dbId);
        await loadMyReservations();
      } catch (err) {
        alert(err.message || 'Failed to cancel reservation');
      }
    }
    if (onCancelOrder) onCancelOrder(order.id);
  };

  const effectiveOrders = liveOrders.length > 0 ? liveOrders : orders;

  // Minimal Statistics
  const totalMealsRescued = effectiveOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.quantity, 0);
  const totalMoneySaved = effectiveOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + (o.originalValue - o.pricePaid), 0);
  const totalCo2Saved = effectiveOrders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + parseFloat(o.co2SavedKg || 1.8), 0);

  const activeOrders = effectiveOrders.filter(o => o.status === 'READY_FOR_PICKUP' || o.status === 'PENDING');
  const pastOrders = effectiveOrders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingTop: 'var(--space-4)' }}>
      {/* Header & Title */}
      <div>
        <h1 className="text-h1" style={{ marginBottom: 'var(--space-2)' }}>
          My Reservations
        </h1>
        <p className="text-body-muted">
          Track your active food pickups and view your environmental impact history.
        </p>
      </div>

      {/* Minimal Statistics Strip - Clean Apple Solid Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        {/* Meals Rescued */}
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="text-uppercase-label">Meals Rescued</span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: 'var(--color-primary-accent-subtle)',
                color: 'var(--color-primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingBag size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            {totalMealsRescued}
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Delicious dishes diverted from waste
          </span>
        </div>

        {/* Money Saved */}
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="text-uppercase-label">Money Saved</span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: 'var(--color-food-accent-subtle)',
                color: 'var(--color-food-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DollarSign size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            ₹{totalMoneySaved.toLocaleString('en-IN')}
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Saved through surplus pricing
          </span>
        </div>

        {/* CO2 Diverted */}
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span className="text-uppercase-label">CO₂ Footprint Saved</span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: 'var(--color-success-subtle)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Leaf size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            {totalCo2Saved.toFixed(1)} kg
          </div>
          <span className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
            Greenhouse gas emissions prevented
          </span>
        </div>
      </div>

      {/* Tabs / Filter Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-option ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Pickups ({activeOrders.length})
          </button>
          <button
            type="button"
            className={`segmented-option ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Order History ({pastOrders.length})
          </button>
        </div>

        <Button variant="ghost" size="sm" onClick={onDiscoverMore}>
          Discover More Surplus <ArrowRight size={14} />
        </Button>
      </div>

      {/* Reservation Cards List */}
      {displayedOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {displayedOrders.map((order) => {
            const isReady = order.status === 'READY_FOR_PICKUP';
            const isCompleted = order.status === 'COMPLETED';

            return (
              <div
                key={order.id}
                className="card"
                style={{
                  padding: 'var(--space-5)',
                  backgroundColor: 'var(--color-bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="text-micro font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                        ORDER #{order.id}
                      </span>
                      {isReady && <Badge variant="warning">Ready for Pickup</Badge>}
                      {isCompleted && <Badge variant="success">Completed</Badge>}
                      {order.status === 'CANCELLED' && <Badge variant="error">Cancelled</Badge>}
                    </div>
                    <h3 className="text-h3">{order.foodName}</h3>
                    <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {order.restaurantName} • {order.restaurantAddress}
                    </p>
                  </div>

                  {/* Pickup Code Display */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-bg-surface-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-input)',
                      padding: '8px 16px',
                      textAlign: 'center'
                    }}
                  >
                    <span className="text-micro" style={{ color: 'var(--color-text-tertiary)', display: 'block' }}>
                      PICKUP CODE
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-primary-accent)' }}>
                      {order.pickupCode}
                    </span>
                  </div>
                </div>

                {/* Details Bar */}
                <div
                  style={{
                    backgroundColor: 'var(--color-bg-surface-secondary)',
                    borderRadius: '10px',
                    padding: 'var(--space-3) var(--space-4)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 'var(--space-3)',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: 'var(--color-food-accent)' }} />
                    <div>
                      <span className="text-micro" style={{ color: 'var(--color-text-tertiary)', display: 'block' }}>Window</span>
                      <span className="text-small font-medium">{order.pickupWindow}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={16} style={{ color: 'var(--color-primary-accent)' }} />
                    <div>
                      <span className="text-micro" style={{ color: 'var(--color-text-tertiary)', display: 'block' }}>Quantity</span>
                      <span className="text-small font-medium">{order.quantity} item(s)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-micro" style={{ color: 'var(--color-text-tertiary)', display: 'block' }}>Amount Paid</span>
                    <span className="text-small font-semibold">
                      ₹{order.pricePaid}{' '}
                      <span style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>
                        (saved ₹{order.originalValue - order.pricePaid})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action Footer */}
                {isReady && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                    {onCancelOrder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(order)}
                      >
                        Cancel Reservation
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => alert(`Directions to ${order.restaurantAddress}:\nUse your navigation app to head to Bengaluru destination.`)}
                    >
                      <MapPin size={14} /> Get Directions
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-8) var(--space-4)',
            textAlign: 'center'
          }}
        >
          <p className="text-h3" style={{ marginBottom: 'var(--space-2)' }}>
            {activeTab === 'active' ? 'No Active Reservations' : 'No Past Orders Found'}
          </p>
          <p className="text-body-muted" style={{ maxWidth: '420px', margin: '0 auto var(--space-4)' }}>
            {activeTab === 'active'
              ? 'You have not reserved any surplus meals yet today. Discover delicious options nearby!'
              : 'You have no previous orders in your history.'}
          </p>
          <Button variant="primary" onClick={onDiscoverMore}>
            Explore Surplus Meals
          </Button>
        </div>
      )}
    </div>
  );
}
