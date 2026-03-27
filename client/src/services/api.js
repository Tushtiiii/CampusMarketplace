import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
  deleteAccount: (passwordData) => api.delete('/auth/account', { data: passwordData }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Listings API calls
export const listingsAPI = {
  getListings: (params) => api.get('/listings', { params }),
  getListing: (id) => api.get(`/listings/${id}`),
  createListing: (formData) => {
    return api.post('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateListing: (id, formData) => {
    return api.put(`/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteListing: (id) => api.delete(`/listings/${id}`),
  toggleFavorite: (id) => api.post(`/listings/${id}/favorite`),
  markAsSold: (id) => api.patch(`/listings/${id}/mark-sold`),
  getMyListings: (status) => api.get('/listings/user/my-listings', { params: { status } }),
  getTrendingListings: () => api.get('/listings/trending'),
};

// Messages API calls
export const messagesAPI = {
  sendMessage: (messageData) => api.post('/messages', messageData),
  getConversations: () => api.get('/messages/conversations'),
  getConversationThread: (threadId) => api.get(`/messages/thread/${threadId}`),
  replyToMessage: (threadId, replyData) => api.post(`/messages/thread/${threadId}/reply`, replyData),
  markAsRead: (messageId) => api.patch(`/messages/${messageId}/read`),
  archiveConversation: (threadId) => api.patch(`/messages/thread/${threadId}/archive`),
  reportSpam: (messageId, reason) => api.post(`/messages/${messageId}/report-spam`, { reason }),
  getMessageStats: () => api.get('/messages/stats'),
};

// Users API calls
export const usersAPI = {
  getUserProfile: (id) => api.get(`/users/${id}/profile`),
  getFavoriteListings: () => api.get('/users/favorites'),
  searchUsers: (params) => api.get('/users/search', { params }),
};

export default api;