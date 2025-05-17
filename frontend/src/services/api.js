import axios from 'axios';

// Determine if we're in production
const isProduction = window.location.hostname !== 'localhost';

// Set the base URL based on environment
const baseURL = isProduction 
  ? 'https://babyresell-62jr6.ondigitalocean.app/api' // Production API URL
  : 'http://localhost:5000/api';             // Development API URL

console.log('API is using baseURL:', baseURL);

// Create axios instance with base URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for sessions/cookies if you use them
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    // Log any error for debugging
    console.error('API Error:', error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      url: error.config.url
    } : error.message);
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/me', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  // Test endpoint to verify API connectivity
  testConnection: () => api.get('/health'),
};

// Pins/Items endpoints
export const itemsAPI = {
  // Baby Items
  getAllItems: (params) => api.get('/baby-items', { params }),
  getItem: (id) => api.get(`/baby-items/${id}`),
  createItem: (data) => api.post('/baby-items', data),
  updateItem: (id, data) => api.put(`/baby-items/${id}`, data),
  deleteItem: (id) => api.delete(`/baby-items/${id}`),
  likeItem: (id) => api.post(`/baby-items/${id}/like`),
  unlikeItem: (id) => api.post(`/baby-items/${id}/unlike`),
  saveItem: (id) => api.post(`/baby-items/${id}/save`),
  unsaveItem: (id) => api.post(`/baby-items/${id}/unsave`),
  getCategories: () => api.get('/baby-items/categories'),
  getAgeGroups: () => api.get('/baby-items/age-groups'),

  // Search
  searchItems: (query) => api.get('/baby-items', { params: { search: query } }),
};

// Upload endpoints
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  uploadMultiple: (formData) => api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteImage: (imageUrl) => api.delete('/upload/image', { data: { imageUrl } }),
};

// Theme endpoints
export const themeAPI = {
  getCurrentTheme: () => api.get('/themes/current'),
  getAllThemes: () => api.get('/themes'),
  getThemeSchedule: () => api.get('/themes/schedule'),
};

// Transaction endpoints
export const transactionAPI = {
  createTransaction: (data) => api.post('/transactions', data),
  getUserTransactions: (params) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
};

// Messages endpoints
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages'),
  getConversation: (userId) => api.get(`/messages/${userId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

// User endpoints
export const userAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.post(`/users/${id}/unfollow`),
};

export default api;