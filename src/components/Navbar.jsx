import React, { useState, useEffect } from 'react';
import { Sun, Moon, ShoppingBag, Store, Shield, Compass, Menu, X, User, LogOut } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
import { getHealthStatus } from '../services/api';

/**
 * Apple-inspired Solid Navigation Bar with Real Auth Integration
 */
export default function Navbar({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  activeOrderCount = 0,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'connected' | 'error'

  useEffect(() => {
    let isMounted = true;
    getHealthStatus()
      .then(res => {
        if (isMounted && res.status === 'ok') setApiStatus('connected');
      })
      .catch(() => {
        if (isMounted) setApiStatus('error');
      });

    return () => { isMounted = false; };
  }, []);

  const navLinks = [
    { id: 'marketplace', label: 'Discover Food', icon: Compass },
    { id: 'customer', label: 'My Orders', icon: ShoppingBag, count: activeOrderCount },
    { id: 'business', label: 'Business Portal', icon: Store, roleRequired: 'restaurant_partner' },
    { id: 'admin', label: 'Platform Ops', icon: Shield, roleRequired: 'admin' }
  ];

  const handleNavClick = (link) => {
    // If route requires a role and user is not logged in with that role, prompt auth modal
    if (link.roleRequired) {
      if (!currentUser) {
        onOpenAuth('login');
        return;
      }
      if (currentUser.role !== link.roleRequired) {
        alert(`Access Restricted: This view requires the '${link.roleRequired}' role. You are currently logged in as a '${currentUser.role}'.`);
        return;
      }
    }
    onNavigate(link.id);
    setMobileMenuOpen(false);
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'admin') return 'primary';
    if (role === 'restaurant_partner') return 'food';
    return 'neutral';
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'restaurant_partner') return 'Partner';
    return 'Diner';
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
      }}
    >
      <div
        className="container"
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate('marketplace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: 'var(--color-primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <span
              style={{
                fontSize: '1.1875rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)'
              }}
            >
              Meal<span style={{ color: 'var(--color-primary-accent)' }}>Loop</span>
            </span>
          </div>
        </div>

        {/* Desktop Navigation Items */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px'
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary-accent)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-primary-accent-subtle)' : 'transparent',
                  borderRadius: '9px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {link.count > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--color-food-accent)',
                      color: '#FFFFFF',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {link.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons: Auth State + API Health + Theme Toggle + Mobile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live API Health Status Badge */}
          <div
            title={apiStatus === 'connected' ? 'FastAPI & Database Connected' : 'FastAPI Offline'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: apiStatus === 'connected' ? 'var(--color-success-subtle)' : 'var(--color-warning-subtle)',
              color: apiStatus === 'connected' ? 'var(--color-success)' : 'var(--color-warning)',
              border: `1px solid ${apiStatus === 'connected' ? 'var(--color-success)' : 'var(--color-warning)'}`,
              userSelect: 'none'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: apiStatus === 'connected' ? 'var(--color-success)' : 'var(--color-warning)'
              }}
            />
            <span className="api-badge-text">
              {apiStatus === 'connected' ? 'API Live' : apiStatus === 'checking' ? 'Connecting...' : 'API Offline'}
            </span>
          </div>

          {/* User Auth Profile / Sign In Button */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-surface-secondary)',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                <User size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <span className="text-small font-semibold" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.full_name.split(' ')[0]}
                </span>
                <Badge variant={getRoleBadgeVariant(currentUser.role)}>
                  {getRoleLabel(currentUser.role)}
                </Badge>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="btn btn-ghost btn-sm"
                title="Log Out"
                aria-label="Log Out"
                style={{ padding: '6px', height: '32px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={Store}
                onClick={() => onOpenAuth('partner', 'register')}
                className="desktop-only-btn"
                style={{ height: '32px', fontSize: '0.8125rem' }}
              >
                List Hotel / Restaurant
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth('customer', 'login')}
                style={{ height: '32px', fontSize: '0.8125rem' }}
              >
                Sign In
              </Button>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '9px' }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-toggle btn btn-secondary btn-sm"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '9px' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderTop: '1px solid var(--color-border)',
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '9px',
                  fontSize: '0.9375rem',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'var(--color-primary-accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-primary-accent)' : 'var(--color-text-primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <span>{link.label}</span>
                </div>
                {link.count > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--color-food-accent)',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {link.count}
                  </span>
                )}
              </button>
            );
          })}

          {!currentUser && (
            <button
              type="button"
              onClick={() => {
                onOpenAuth('partner', 'register');
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '9px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                backgroundColor: 'var(--color-bg-surface-secondary)',
                color: 'var(--color-primary-accent)',
                border: '1px solid var(--color-border)',
                marginTop: '4px'
              }}
            >
              <Store size={18} />
              <span>List Hotel / Restaurant</span>
            </button>
          )}
        </div>
      )}

      {/* Responsive Inline CSS helper for desktop nav */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 700px) {
          .desktop-only-btn {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .api-badge-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
