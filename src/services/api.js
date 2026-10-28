/**
 * MealLoop Centralized API Client
 * Manages communication between React and the FastAPI backend.
 */

// Supports direct custom backend URL (e.g. Render) or relative proxy route (Vercel rewrite / Vite proxy)
const rawBase = import.meta.env.VITE_API_URL || '';
const API_BASE = rawBase ? `${rawBase.replace(/\/+$/, '')}/api/v1` : '/api/v1';

/**
 * Retrieves the stored JWT authentication token from localStorage.
 */
export function getAuthToken() {
  return localStorage.getItem('mealloop_token');
}

/**
 * Stores the JWT authentication token in localStorage.
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('mealloop_token', token);
  } else {
    localStorage.removeItem('mealloop_token');
  }
}

/**
 * Base fetch wrapper with error handling and automatic Bearer token injection.
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred while connecting to the server.';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Health check endpoint ping.
 */
export async function getHealthStatus() {
  return request('/health');
}

/**
 * Authentication API calls
 */
export async function apiLogin(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.access_token) {
    setAuthToken(res.access_token);
  }
  return res;
}

export async function apiGoogleAuth(email, name, role = 'customer') {
  const res = await request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ email, name, role })
  });
  if (res.access_token) {
    setAuthToken(res.access_token);
  }
  return res;
}

export async function apiRegisterCustomer(fullName, email, phone, password) {
  const res = await request('/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email,
      phone,
      password
    })
  });
  if (res.access_token) {
    setAuthToken(res.access_token);
  }
  return res;
}

export async function apiRegisterPartner(partnerData) {
  const res = await request('/auth/register/partner', {
    method: 'POST',
    body: JSON.stringify(partnerData)
  });
  if (res.access_token) {
    setAuthToken(res.access_token);
  }
  return res;
}

export async function apiGetCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    return await request('/auth/me');
  } catch (err) {
    setAuthToken(null);
    return null;
  }
}

export function apiLogout() {
  setAuthToken(null);
}

/**
 * Restaurant Management & Discovery APIs
 */
export async function apiGetMyRestaurant() {
  return request('/restaurants/me');
}

export async function apiUpdateMyRestaurant(updateData) {
  return request('/restaurants/me', {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
}

export async function apiGetPartnerDashboard() {
  return request('/restaurants/me/dashboard');
}

export async function apiGetApprovedRestaurants(locality = '') {
  const query = locality ? `?locality=${encodeURIComponent(locality)}` : '';
  return request(`/restaurants${query}`);
}

/**
 * Admin Operations APIs
 */
export async function apiGetAdminRestaurants(statusFilter = '') {
  const query = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter.toLowerCase()}` : '';
  return request(`/admin/restaurants${query}`);
}

export async function apiUpdateRestaurantApproval(restaurantId, statusValue, notes = '') {
  return request(`/admin/restaurants/${restaurantId}/approval`, {
    method: 'PATCH',
    body: JSON.stringify({ status: statusValue, admin_notes: notes })
  });
}

export async function apiGetAdminStats() {
  return request('/admin/stats');
}

/**
 * Food Listings APIs (PostgreSQL backed)
 */
export async function apiCreateListing(listingData) {
  return request('/listings', {
    method: 'POST',
    body: JSON.stringify(listingData)
  });
}

export async function apiGetListings(category = 'all', locality = '', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (locality) params.append('locality', locality);
  if (search) params.append('search', search);

  const qs = params.toString() ? `?${params.toString()}` : '';
  return request(`/listings${qs}`);
}

export async function apiGetMyListings() {
  return request('/listings/my-listings');
}

/**
 * Reservations & Orders APIs (PostgreSQL backed with Row Locks)
 */
export async function apiCreateReservation(reservationData) {
  return request('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData)
  });
}

export async function apiGetMyReservations() {
  return request('/reservations/my-reservations');
}

export async function apiGetRestaurantReservations() {
  return request('/reservations/restaurant');
}

export async function apiVerifyPickup(pickupCode) {
  return request('/reservations/verify-pickup', {
    method: 'POST',
    body: JSON.stringify({ pickup_code: pickupCode })
  });
}

export async function apiCancelReservation(reservationId) {
  return request(`/reservations/${reservationId}/cancel`, {
    method: 'PATCH'
  });
}

/**
 * Generic HTTP method helpers
 */
export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
