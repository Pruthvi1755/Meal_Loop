import React from 'react';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

/**
 * Apple-inspired Solid Food Discovery Card
 */
export default function FoodCard({ food, onSelect }) {
  const {
    name,
    restaurantName,
    originalPrice,
    discountedPrice,
    discountPercent,
    quantityAvailable,
    pickupWindow,
    distance,
    image,
    dietary
  } = food;

  const isLowStock = quantityAvailable <= 3;

  return (
    <div
      className="card card-interactive"
      onClick={() => onSelect(food)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-bg-surface)'
      }}
    >
      {/* High-quality Food Image Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '62%', // 16:10 Apple-like aspect ratio
          backgroundColor: 'var(--color-bg-surface-secondary)',
          overflow: 'hidden'
        }}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)'
          }}
        />

        {/* Crisp Discount Badge (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)'
          }}
        >
          <span
            style={{
              backgroundColor: 'var(--color-food-accent)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.75rem',
              padding: '4px 8px',
              borderRadius: '7px',
              letterSpacing: '0.02em',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            -{discountPercent}%
          </span>
        </div>

        {/* Low Quantity Pill (Top Left) */}
        {isLowStock && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-3)',
              left: 'var(--space-3)'
            }}
          >
            <span
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                color: 'var(--color-warning)',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Only {quantityAvailable} left
            </span>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
          gap: 'var(--space-3)'
        }}
      >
        <div>
          {/* Restaurant & Distance */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}
          >
            <span className="text-small" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              {restaurantName}
            </span>
            {distance && (
              <span
                className="text-micro"
                style={{
                  color: 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <MapPin size={11} /> {distance}
              </span>
            )}
          </div>

          {/* Food Item Title */}
          <h4
            className="text-h4"
            style={{
              marginBottom: 'var(--space-2)',
              color: 'var(--color-text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {name}
          </h4>

          {/* Pickup Window Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            <Clock size={13} style={{ color: 'var(--color-primary-accent)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pickupWindow}
            </span>
          </div>
        </div>

        {/* Pricing and Action Row */}
        <div
          style={{
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                ₹{discountedPrice}
              </span>
              <span
                style={{
                  fontSize: '0.8125rem',
                  textDecoration: 'line-through',
                  color: 'var(--color-text-tertiary)'
                }}
              >
                ₹{originalPrice}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(food);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
