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
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// Orders API
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  createPaymentIntent: (orderId: string) => api.post(`/orders/${orderId}/payment-intent`),
};

// Tickets API
export const ticketsApi = {
  getMyTickets: () => api.get('/tickets/my'),
  checkIn: (ticketNumber: string) => api.post(`/tickets/${ticketNumber}/checkin`),
};

export default api;