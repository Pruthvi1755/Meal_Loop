import React, { useState, useEffect } from 'react';
import { User, Store, Shield, Lock, Mail, Phone, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { apiLogin, apiGoogleAuth, apiRegisterCustomer, apiRegisterPartner } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  initialRole = 'customer',
  initialTab,
  initialMode = 'login',
  onAuthSuccess
}) {
  // Main Role Selector: 'customer' | 'partner' | 'admin'
  const [selectedRole, setSelectedRole] = useState(initialTab || initialRole || 'customer');
  
  // Sub-modes:
  // For Customer: 'login' | 'register'
  // For Partner: 'login' | 'register'
  const [partnerMode, setPartnerMode] = useState(initialMode || 'login'); // 'login' | 'register'
  const [customerMode, setCustomerMode] = useState('login'); // 'login' | 'register'

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const targetRole = initialTab === 'partner' || initialRole === 'partner' || initialTab === 'register_partner' ? 'partner'
        : initialTab === 'admin' || initialRole === 'admin' ? 'admin'
        : 'customer';
      setSelectedRole(targetRole);
      if (initialMode === 'register' || initialTab === 'register_partner') {
        setPartnerMode('register');
      } else {
        setPartnerMode('login');
      }
      setErrorMsg(null);
      setSuccessNotice(null);
    }
  }, [isOpen, initialRole, initialTab, initialMode]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Customer Sign-up fields
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Partner Hotel/Restaurant Registration Fields
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [locality, setLocality] = useState('Indiranagar');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');

  // Quick-fill credentials helper
  const fillCredentials = (userEmail, userPass, role, pMode = 'login') => {
    setSelectedRole(role);
    if (role === 'partner') setPartnerMode(pMode);
    if (role === 'customer') setCustomerMode('login');
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMsg(null);
    setSuccessNotice(null);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiLogin(email, password);
      // Validate role expectation
      if (selectedRole === 'admin' && res.user.role !== 'admin') {
        throw new Error('This account is not authorized for administrative access.');
      }
      if (selectedRole === 'partner' && res.user.role !== 'restaurant_partner') {
        throw new Error('This account is not registered as a restaurant/hotel partner.');
      }

      if (onAuthSuccess) onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiRegisterCustomer(custName, email, custPhone, password);
      if (onAuthSuccess) onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const partnerData = {
        owner_name: ownerName,
        business_name: businessName,
        business_type: businessType,
        locality: locality,
        address: address,
        email: email,
        phone: phone,
        password: password,
        opening_time: openingTime,
        closing_time: closingTime
      };
      const res = await apiRegisterPartner(partnerData);
      setSuccessNotice(`Registration submitted! Your hotel/restaurant '${businessName}' is pending admin approval.`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Partner registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Prompt user or use default simulated Google identity
      const simulatedGoogleEmail = selectedRole === 'partner' 
        ? (email || 'partner.google@bangalorehotels.com')
        : (email || 'diner.google@gmail.com');
      const simulatedName = selectedRole === 'partner' ? 'Chef Anirudh' : 'Siddharth Rao';

      const res = await apiGoogleAuth(simulatedGoogleEmail, simulatedName, selectedRole === 'partner' ? 'restaurant_partner' : 'customer');
      
      if (res.needs_registration) {
        // Switch to partner registration with prefilled google email
        setPartnerMode('register');
        setEmail(res.email);
        setOwnerName(res.name);
        setErrorMsg('Please complete your hotel/restaurant details to finish onboarding.');
        return;
      }

      if (onAuthSuccess) onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        selectedRole === 'customer'
          ? (customerMode === 'login' ? 'Customer Sign In' : 'Create Diner Account')
          : selectedRole === 'partner'
          ? (partnerMode === 'login' ? 'Restaurant / Hotel Sign In' : 'Register New Restaurant or Hotel')
          : 'MealLoop Platform Administration'
      }
      subtitle="Apple-inspired solid security & role-based authentication"
      maxWidth={selectedRole === 'partner' && partnerMode === 'register' ? '620px' : '480px'}
    >
      <div>
        {/* Top Role Selector: Customer vs. Restaurant vs. Admin */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div className="segmented-control" style={{ width: '100%', display: 'flex' }}>
            <button
              type="button"
              className={`segmented-option ${selectedRole === 'customer' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => { setSelectedRole('customer'); setErrorMsg(null); }}
            >
              Customer (Diner)
            </button>
            <button
              type="button"
              className={`segmented-option ${selectedRole === 'partner' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => { setSelectedRole('partner'); setErrorMsg(null); }}
            >
              Restaurant / Hotel
            </button>
            <button
              type="button"
              className={`segmented-option ${selectedRole === 'admin' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => { setSelectedRole('admin'); setErrorMsg(null); }}
            >
              Admin Portal
            </button>
          </div>
        </div>

        {/* Quick-Fill Seeded Credentials Bar */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: 'var(--space-4)',
            fontSize: '0.75rem'
          }}
        >
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Quick-Fill Seeded Credentials:
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin@mealloop.in', 'Admin@12345', 'admin')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--color-primary-accent)'
              }}
            >
              Admin: admin@mealloop.in
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('partner@bangalorebaking.com', 'Partner@12345', 'partner', 'login')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--color-food-accent)'
              }}
            >
              Demo Partner: The Bangalore Baking Co.
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('customer@mealloop.in', 'Customer@12345', 'customer')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--color-success)'
              }}
            >
              Demo Customer: Aditi Rao
            </button>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-error-subtle)',
              color: 'var(--color-error)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-input)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successNotice && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-success-subtle)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-input)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ========================================================
            SECTION 1: CUSTOMER AUTHENTICATION
            ======================================================== */}
        {selectedRole === 'customer' && (
          <div>
            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                width: '100%',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: 'var(--space-3)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 'var(--space-3) 0', color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
              <span>or with email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
            </div>

            {/* Toggle Sign In vs Create Account */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
              <button
                type="button"
                onClick={() => setCustomerMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: customerMode === 'login' ? 700 : 500,
                  color: customerMode === 'login' ? 'var(--color-primary-accent)' : 'var(--color-text-secondary)',
                  fontSize: '0.8125rem'
                }}
              >
                Sign In
              </button>
              <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
              <button
                type="button"
                onClick={() => setCustomerMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: customerMode === 'register' ? 700 : 500,
                  color: customerMode === 'register' ? 'var(--color-primary-accent)' : 'var(--color-text-secondary)',
                  fontSize: '0.8125rem'
                }}
              >
                Create Account
              </button>
            </div>

            {customerMode === 'login' ? (
              <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  required
                  placeholder="e.g. aditi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="primary" size="lg" type="submit" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
                  {loading ? 'Signing In...' : 'Sign In as Diner'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCustomerRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Input
                  label="Full Name"
                  type="text"
                  icon={User}
                  required
                  placeholder="e.g. Aditi Rao"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  required
                  placeholder="e.g. aditi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  icon={Phone}
                  required
                  placeholder="+91 98765 43210"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="primary" size="lg" type="submit" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
                  {loading ? 'Creating Account...' : 'Register as Diner'}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================
            SECTION 2: RESTAURANT / HOTEL PARTNER AUTHENTICATION
            ======================================================== */}
        {selectedRole === 'partner' && (
          <div>
            {/* Google Sign-In Option for Partners */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                width: '100%',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: 'var(--space-3)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google (Partner Account)</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 'var(--space-3) 0', color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
              <span>or manage your partner account</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
            </div>

            {/* Sub-selector: Sign In vs Register New Hotel */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: 'var(--space-4)' }}>
              <button
                type="button"
                onClick={() => setPartnerMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: partnerMode === 'login' ? 700 : 500,
                  color: partnerMode === 'login' ? 'var(--color-food-accent)' : 'var(--color-text-secondary)',
                  fontSize: '0.875rem'
                }}
              >
                Sign In (Existing Hotel / Partner)
              </button>
              <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
              <button
                type="button"
                onClick={() => setPartnerMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: partnerMode === 'register' ? 700 : 500,
                  color: partnerMode === 'register' ? 'var(--color-food-accent)' : 'var(--color-text-secondary)',
                  fontSize: '0.875rem'
                }}
              >
                Register New Hotel / Restaurant
              </button>
            </div>

            {/* PARTNER SIGN IN */}
            {partnerMode === 'login' ? (
              <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Input
                  label="Registered Partner Email"
                  type="email"
                  icon={Mail}
                  required
                  placeholder="e.g. partner@bangalorebaking.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  💡 Once your hotel has been approved by admin, you can log in with your registered email to upload dishes to the menu.
                </div>

                <Button variant="food" size="lg" type="submit" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
                  {loading ? 'Authenticating...' : 'Sign In to Partner Portal'}
                </Button>
              </form>
            ) : (
              /* PARTNER HOTEL / RESTAURANT REGISTRATION */
              <form onSubmit={handlePartnerRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <Input
                    label="Hotel / Restaurant Name"
                    type="text"
                    required
                    placeholder="e.g. The Oberoi Bengaluru / Glen's Bakehouse"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                  <Input
                    label="Owner / General Manager Name"
                    type="text"
                    required
                    placeholder="e.g. Chef Vikram Sengupta"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div className="input-group">
                    <label className="input-label">Establishment Type</label>
                    <select
                      className="input-field"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    >
                      <option value="Restaurant">Fine Dining / Casual Restaurant</option>
                      <option value="Hotel Buffet">Hotel / Buffet Kitchen</option>
                      <option value="Bakery & Cafe">Bakery & Cafe</option>
                      <option value="Pizzeria">Pizzeria</option>
                      <option value="Biryani House">Biryani & Meals</option>
                      <option value="Cloud Kitchen">Cloud Kitchen</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Bengaluru Locality</label>
                    <select
                      className="input-field"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    >
                      <option value="Indiranagar">Indiranagar & Domlur</option>
                      <option value="Koramangala">Koramangala</option>
                      <option value="Church Street">Church Street & CBD</option>
                      <option value="Lavelle Road">Lavelle Road</option>
                      <option value="HSR Layout">HSR Layout</option>
                      <option value="Whitefield">Whitefield & Marathahalli</option>
                      <option value="Malleshwaram">Malleshwaram</option>
                      <option value="Jayanagar">Jayanagar & JP Nagar</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Complete Street Address"
                  type="text"
                  required
                  placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <Input
                    label="Business Email (Used for Login)"
                    type="email"
                    required
                    placeholder="e.g. reservations@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="Direct Contact Phone"
                    type="tel"
                    required
                    placeholder="+91 98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <Input
                    label="Daily Opening Time"
                    type="time"
                    required
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                  />
                  <Input
                    label="Daily Closing Time"
                    type="time"
                    required
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                  />
                </div>

                <Input
                  label="Create Account Password (min 6 characters)"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div
                  style={{
                    backgroundColor: 'var(--color-warning-subtle)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    color: 'var(--color-warning)',
                    lineHeight: 1.5
                  }}
                >
                  🔒 <strong>Approval Workflow:</strong> Once registered, your hotel will be reviewed by admin. After approval, you can log in with this same email to upload your daily surplus menu!
                </div>

                <Button variant="food" size="lg" type="submit" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
                  {loading ? 'Submitting Application...' : 'Submit Hotel Application for Admin Approval'}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================
            SECTION 3: PLATFORM ADMINISTRATION AUTHENTICATION
            ======================================================== */}
        {selectedRole === 'admin' && (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div
              style={{
                backgroundColor: 'var(--color-primary-accent-subtle)',
                border: '1px solid var(--color-primary-accent)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.75rem',
                color: 'var(--color-primary-accent)',
                lineHeight: 1.5
              }}
            >
              🛡️ <strong>Platform Administration:</strong> For platform compliance officers only. Allows verifying new hotel applications and monitoring Bengaluru food waste diversion metrics.
            </div>

            <Input
              label="Dedicated Administrator Email"
              type="email"
              icon={Mail}
              required
              placeholder="admin@mealloop.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Administrator Password"
              type="password"
              icon={Lock}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="primary" size="lg" type="submit" disabled={loading}>
              {loading ? 'Authenticating Admin...' : 'Sign In as Platform Admin'}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
