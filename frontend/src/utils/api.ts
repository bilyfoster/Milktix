import axios from 'axios';

// Use production API URL if not in local development
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL = isLocalhost 
  ? 'http://localhost:8080/api'
  : 'https://api.milktix.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (usernameOrEmail: string, password: string) =>
    api.post('/auth/login', { usernameOrEmail, password }),
  
  register: (username: string, fullName: string, email: string, password: string) =>
    api.post('/auth/register', { username, fullName, email, password }),
};

// Events API
export const eventsApi = {
  getAll: () => api.get('/events'),
  getMyEvents: () => api.get('/events/my'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// Orders API
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getById: (id: string) => api.get(`/orders/${id}`),
  createPaymentIntent: (orderId: string) => api.post(`/orders/${orderId}/payment-intent`),
};

// Tickets API
export const ticketsApi = {
  getMyTickets: () => api.get('/tickets/my'),
  checkIn: (ticketNumber: string) => api.post(`/tickets/${ticketNumber}/checkin`),
};

// Organizer Request API
export const organizerRequestApi = {
  create: (data: {
    businessName: string;
    businessDescription?: string;
    taxId?: string;
    website?: string;
    phoneNumber?: string;
    businessEmail: string;
  }) => api.post('/organizer-requests', data),
  
  getMyRequest: () => api.get('/organizer-requests/my'),
  
  // Admin only
  getAll: () => api.get('/organizer-requests'),
  getByStatus: (status: 'PENDING' | 'APPROVED' | 'REJECTED') => api.get(`/organizer-requests/status/${status}`),
  review: (id: string, action: 'APPROVED' | 'REJECTED', adminNotes?: string) => 
    api.post(`/organizer-requests/${id}/review`, { action, adminNotes }),
  getPendingCount: () => api.get('/organizer-requests/pending-count'),
};

// Hosts API
export const hostsApi = {
  getAll: () => api.get('/hosts'),
  getMyHosts: () => api.get('/hosts/my'),
  getById: (id: string) => api.get(`/hosts/${id}`),
  create: (data: {
    name: string;
    bio?: string;
    email?: string;
    phone?: string;
    website?: string;
    imageUrl?: string;
  }) => api.post('/hosts', data),
};

// Locations API
export const locationsApi = {
  getAll: () => api.get('/locations'),
  getById: (id: string) => api.get(`/locations/${id}`),
  search: (query: string) => api.get(`/locations/search?q=${encodeURIComponent(query)}`),
  create: (data: {
    name: string;
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    description?: string;
    imageUrl?: string;
    website?: string;
    phone?: string;
    capacity?: number;
  }) => api.post('/locations', data),
};

export default api;
