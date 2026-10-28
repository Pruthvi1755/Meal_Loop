import React, { useState } from 'react';
import { Clock, MapPin, CheckCircle2, ShieldCheck, AlertCircle, Plus, Minus, CreditCard } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';
import { apiCreateReservation } from '../services/api';

/**
 * Apple-inspired Food Details & Reservation Modal
 */
export default function FoodDetailsModal({ food, isOpen, onClose, onReserve }) {
  const [quantity, setQuantity] = useState(1);
  const [reservedSuccess, setReservedSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  if (!food) return null;

  const totalDiscounted = Math.round(food.discountedPrice * quantity);
  const totalOriginal = Math.round(food.originalPrice * quantity);
  const totalSavings = totalOriginal - totalDiscounted;

  const handleIncrease = () => {
    if (quantity < food.quantityAvailable) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleConfirmReservation = async () => {
    try {
      setReserving(true);
      setReserveError(null);

      let listingId = 1;
      if (typeof food.id === 'string' && food.id.startsWith('db-')) {
        listingId = parseInt(food.id.replace('db-', ''), 10);
      } else if (typeof food.id === 'number') {
        listingId = food.id;
      }

      // 1. Call persistent PostgreSQL reservation endpoint with atomic row lock
      const dbRes = await apiCreateReservation({
        listing_id: listingId,
        quantity: quantity,
        payment_method: 'simulated_upi'
      });

      // 2. Format order from database response
      const order = {
        id: `ORD-${dbRes.id}`,
        dbId: dbRes.id,
        foodName: dbRes.food_title,
        restaurantName: dbRes.restaurant_name,
        restaurantAddress: dbRes.restaurant_address,
        pickupCode: dbRes.pickup_code,
        pickupWindow: dbRes.pickup_window,
        pricePaid: dbRes.total_price,
        originalValue: dbRes.original_value,
        quantity: dbRes.quantity,
        status: 'READY_FOR_PICKUP',
        date: 'Today',
        co2SavedKg: (1.8 * quantity).toFixed(1)
      };

      setCreatedOrder(order);
      setReservedSuccess(true);
      if (onReserve) {
        onReserve(order, food.id, quantity);
      }
    } catch (err) {
      setReserveError(err.message || 'Reservation failed. Please sign in as a customer or check stock.');
    } finally {
      setReserving(false);
    }
  };

  const handleClose = () => {
    setReservedSuccess(false);
    setQuantity(1);
    setCreatedOrder(null);
    setReserveError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={reservedSuccess ? 'Reservation Confirmed' : 'Surplus Meal Details'}
      subtitle={food.restaurantName}
      maxWidth="620px"
    >
      {reservedSuccess && createdOrder ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-subtle)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 className="text-h2" style={{ marginBottom: 'var(--space-2)' }}>
            You're all set to pick up!
          </h3>
          <p className="text-body-muted" style={{ maxWidth: '420px', margin: '0 auto var(--space-6)' }}>
            Present your pickup code at {food.restaurantName} during your allotted pickup window.
          </p>

          {/* Solid Receipt Card */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: 'var(--space-5)',
              textAlign: 'left',
              maxWidth: '440px',
              margin: '0 auto var(--space-6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span className="text-small">Pickup Code</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-primary-accent)' }}>
                {createdOrder.pickupCode}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span className="text-small">Meal Item</span>
              <span className="font-semibold text-small">{quantity}x {food.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span className="text-small">Pickup Window</span>
              <span className="font-medium text-small">{food.pickupWindow}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span className="text-small">Address</span>
              <span className="text-small" style={{ color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                {food.restaurantAddress}
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}
            >
              <span className="font-semibold">Total Paid</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{totalDiscounted}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <Button variant="primary" onClick={handleClose}>
              View in My Reservations
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Large Solid Food Image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              marginBottom: 'var(--space-5)',
              backgroundColor: 'var(--color-bg-surface-secondary)'
            }}
          >
            <img
              src={food.image}
              alt={food.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <span
                style={{
                  backgroundColor: 'var(--color-food-accent)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  padding: '6px 12px',
                  borderRadius: '8px'
                }}
              >
                Save {food.discountPercent}%
              </span>
            </div>
          </div>

          {/* Food Details & Badges */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
              {food.dietary && food.dietary.map((tag, idx) => (
                <Badge key={idx} variant="neutral">{tag}</Badge>
              ))}
              <Badge variant="success">Surplus Certified</Badge>
            </div>

            <h2 className="text-h2" style={{ marginBottom: 'var(--space-2)' }}>
              {food.name}
            </h2>

            <p className="text-body-muted" style={{ lineHeight: 1.6 }}>
              {food.description}
            </p>
          </div>

          {/* Restaurant & Location Box */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface-secondary)',
              borderRadius: 'var(--radius-input)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} style={{ color: 'var(--color-primary-accent)', flexShrink: 0 }} />
              <div>
                <span className="font-semibold text-small">{food.restaurantName}</span>
                <span className="text-small" style={{ color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                  • {food.restaurantAddress} ({food.distance})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--color-food-accent)', flexShrink: 0 }} />
              <div>
                <span className="font-semibold text-small">Pickup Today:</span>
                <span className="text-small" style={{ marginLeft: '6px', color: 'var(--color-text-primary)' }}>
                  {food.pickupWindow}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Savings Breakdown */}
          <div
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              borderBottom: '1px solid var(--color-border-subtle)',
              padding: 'var(--space-4) 0',
              marginBottom: 'var(--space-5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                Unit Price
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  ₹{food.discountedPrice}
                </span>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-text-tertiary)', fontSize: '0.9375rem' }}>
                  ₹{food.originalPrice}
                </span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '6px', textAlign: 'right' }}>
                {food.quantityAvailable} available
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-input)',
                  padding: '3px'
                }}
              >
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="btn btn-ghost"
                  style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 600, fontSize: '0.9375rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= food.quantityAvailable}
                  className="btn btn-ghost"
                  style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px' }}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {reserveError && (
            <div style={{ marginBottom: 'var(--space-4)', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--color-error-subtle)', color: 'var(--color-error)', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{reserveError}</span>
            </div>
          )}

          {/* Action Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)'
            }}
          >
            <div>
              <span className="text-micro" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                Total (Saved ₹{totalSavings})
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                ₹{totalDiscounted}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirmReservation}
                disabled={reserving || food.quantityAvailable <= 0}
              >
                {reserving ? 'Reserving (Row-Lock)...' : 'Reserve & Pay (Simulated)'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
