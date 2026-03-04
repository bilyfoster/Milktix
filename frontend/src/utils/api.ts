import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';

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
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  // For organizer dashboard - get events created by the current user
  getMyEvents: () => api.get('/events/my-events'),
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
  getById: (id: string) => api.get(`/tickets/${id}`),
  // Check in ticket (Organizer/Admin only)
  checkIn: (ticketNumber: string) => api.post(`/tickets/${ticketNumber}/checkin`),
  // Verify ticket (public endpoint for scanning)
  verify: (ticketNumber: string) => api.get(`/tickets/${ticketNumber}/verify`),
};

// Ticket Types API (for managing ticket types on events)
export const ticketTypesApi = {
  // Create a new ticket type for an event
  create: (eventId: string, data: any) => api.post(`/events/${eventId}/ticket-types`, data),
  // Update a ticket type
  update: (eventId: string, ticketTypeId: string, data: any) => 
    api.put(`/events/${eventId}/ticket-types/${ticketTypeId}`, data),
  // Delete a ticket type
  delete: (eventId: string, ticketTypeId: string) => 
    api.delete(`/events/${eventId}/ticket-types/${ticketTypeId}`),
};

// Users API
export const usersApi = {
  // Get saved events for the current user
  getSavedEvents: () => api.get('/users/saved-events'),
  // Save an event
  saveEvent: (eventId: string) => api.post(`/users/saved-events/${eventId}`),
  // Remove a saved event
  removeSavedEvent: (eventId: string) => api.delete(`/users/saved-events/${eventId}`),
  // Get user orders
  getOrders: () => api.get('/users/orders'),
};

// CheckIn API
export const checkInApi = {
  // Verify a ticket before check-in
  verifyTicket: (ticketNumber: string) => api.post('/checkin/verify', { ticketNumber }),
  // Perform check-in
  checkIn: (ticketNumber: string) => api.post('/checkin', { ticketNumber }),
};

export default api;
