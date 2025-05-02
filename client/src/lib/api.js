// src/lib/api.js
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration or invalidation
    if (error.response && error.response.status === 401) {
      // Clear stored tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Log API errors for debugging
    console.error('API Error:', error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

// Auth API methods
api.auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify')
};

// Voter API methods
api.voters = {
  profile: () => api.get('/voters/profile'),
  registerFace: (faceData) => {
    const formData = new FormData();
    formData.append('face', faceData);
    return api.post('/voters/register-face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  verifyFace: (faceData) => {
    const formData = new FormData();
    formData.append('face', faceData);
    return api.post('/voters/verify-face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;