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
  
  me: () => api.get('/auth/me'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  validateResetToken: (token: string) =>
    api.get(`/auth/validate-reset-token?token=${token}`),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// Events API
export const eventsApi = {
  getAll: () => api.get('/events'),
  getMyEvents: () => api.get('/events/my'),
  getAllAdmin: () => api.get('/events/all'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  duplicateEvent: (id: string) => api.post(`/events/${id}/duplicate`),
  updateTicketType: (eventId: string, ticketTypeId: string, data: any) => 
    api.put(`/events/${eventId}/ticket-types/${ticketTypeId}`, data),
  deleteTicketType: (eventId: string, ticketTypeId: string) => 
    api.delete(`/events/${eventId}/ticket-types/${ticketTypeId}`),
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

// Event Templates API
export const templatesApi = {
  getMyTemplates: () => api.get('/templates'),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  generateEvents: (templateId: string, generateUpTo: string) => 
    api.post(`/templates/${templateId}/generate?generateUpTo=${generateUpTo}`),
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
  update: (id: string, data: any) => api.put(`/hosts/${id}`, data),
  delete: (id: string) => api.delete(`/hosts/${id}`),
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
  update: (id: string, data: any) => api.put(`/locations/${id}`, data),
  delete: (id: string) => api.delete(`/locations/${id}`),
};

// Admin API
export const adminApi = {
  // Users
  getUsers: (params?: { 
    role?: string; 
    status?: string; 
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/admin/users', { params }),
  
  updateUserRole: (userId: string, role: string) => 
    api.put(`/admin/users/${userId}/role`, { role }),
  
  updateUserStatus: (userId: string, status: string) => 
    api.put(`/admin/users/${userId}/status`, { status }),
  
  bulkUpdateUsers: (userIds: string[], action: string) => 
    api.post('/admin/users/bulk', { userIds, action }),
  
  // Events Admin
  getAdminEvents: (params?: {
    status?: string;
    host?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/admin/events', { params }),
  
  bulkUpdateEvents: (eventIds: string[], action: string) => 
    api.post('/admin/events/bulk', { eventIds, action }),
  
  exportEvents: (format: 'csv' | 'json' = 'csv') => 
    api.get(`/admin/events/export?format=${format}`, { responseType: 'blob' }),
};

export default api;
