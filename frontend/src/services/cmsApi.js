const requestJson = async (url, options, fallbackMessage) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const payloadMessage = payload && typeof payload === 'object' ? payload.error : '';
    const fallbackByStatus = response.status === 413
      ? 'Total upload is too large. Each image must be 4 MB or smaller — please reduce image sizes and try again.'
      : fallbackMessage;
    const error = new Error(payloadMessage || fallbackByStatus || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return payload || {};
};

export const fetchCms = async () => requestJson('/api/cms', undefined, 'Failed to load CMS data');

export const fetchHomePage = async () => {
  const data = await fetchCms();
  return data.homePage || {};
};

export const fetchGooglePlaceReviews = async (placeId) => {
  const params = new URLSearchParams({ placeId: String(placeId || '').trim() });
  return requestJson(`/api/google-reviews?${params.toString()}`, undefined, 'Failed to fetch Google reviews');
};

const getAdminHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const adminLogin = async (username, password) => {
  return requestJson('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  }, 'Login failed');
};

export const updateCms = async (cmsData, token) => {
  return requestJson('/api/admin/cms', {
    method: 'PUT',
    headers: getAdminHeaders(token),
    body: JSON.stringify(cmsData),
  }, 'Failed to save CMS data');
};

export const seedCms = async (token) => {
  return requestJson('/api/admin/seed', {
    method: 'POST',
    headers: getAdminHeaders(token),
  }, 'Failed to seed CMS');
};

export const fetchAdminBookings = async (token) => {
  return requestJson('/api/admin/bookings', {
    headers: getAdminHeaders(token),
  }, 'Failed to fetch bookings');
};

export const updateBookingStatus = async (bookingId, status, token, options = {}) => {
  return requestJson(`/api/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(token),
    body: JSON.stringify({ status, resendNotifications: Boolean(options.resendNotifications) }),
  }, 'Failed to update booking status');
};

export const updateBooking = async (bookingId, data, token) => {
  return requestJson(`/api/admin/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: getAdminHeaders(token),
    body: JSON.stringify(data),
  }, 'Failed to update booking');
};

export const fetchRoomAvailability = async (resortName = '') => {
  const params = new URLSearchParams();
  if (resortName) params.set('resortName', resortName);
  const query = params.toString();
  const url = query ? `/api/bookings/availability?${query}` : '/api/bookings/availability';
  return requestJson(url, undefined, 'Failed to fetch room availability');
};
