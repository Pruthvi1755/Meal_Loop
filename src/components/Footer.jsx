import React from 'react';
import { Heart, ShieldCheck, Leaf } from 'lucide-react';

/**
 * Apple-inspired Minimal Footer
 */
export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-8) 0 var(--space-6)',
        marginTop: 'var(--space-8)',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
      }}
    >
      <div className="container">
        {/* Value Proposition Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-5)',
            paddingBottom: 'var(--space-6)',
            borderBottom: '1px solid var(--color-border-subtle)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-accent)',
                flexShrink: 0
              }}
            >
              <Leaf size={18} />
            </div>
            <div>
              <h5 className="font-semibold text-small" style={{ marginBottom: '2px' }}>
                Zero Food Waste
              </h5>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Connecting conscious eaters directly with premium surplus from local bakeries and kitchens.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-food-accent)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h5 className="font-semibold text-small" style={{ marginBottom: '2px' }}>
                Verified Fresh Quality
              </h5>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Every meal is prepared same-day and subject to verified merchant quality standards.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)',
                flexShrink: 0
              }}
            >
              <Heart size={18} />
            </div>
            <div>
              <h5 className="font-semibold text-small" style={{ marginBottom: '2px' }}>
                Local Impact
              </h5>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Over 28,000+ meals salvaged and ₹58,00,000+ saved for Bengaluru communities.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Links & Copyright */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            <span>MealLoop Platform</span>
            <span>•</span>
            <a href="#how-it-works">How It Works</a>
            <span>•</span>
            <a href="#for-restaurants">For Businesses</a>
            <span>•</span>
            <a href="#sustainability">Impact Report</a>
            <span>•</span>
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-tertiary)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <p>© {new Date().getFullYear()} MealLoop Technologies, Inc. All rights reserved. Apple-inspired Solid UI.</p>
            <p>Designed with restraint: Solid surfaces, zero glassmorphism, zero artificial 3D.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
