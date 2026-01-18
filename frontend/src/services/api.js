import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (() => {
    let url = import.meta.env.VITE_API_BASE_URL;
    if (!url) return 'http://localhost:5000/api';
    
    // Fix for Render internal hostname issue
    if (url.includes('agri-rental-backend') && !url.includes('.onrender.com')) {
      url = 'https://agri-rental-backend.onrender.com';
    }

    // Add protocol if missing
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    // Add /api suffix if missing
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    
    console.log('API Base URL:', url); // Debugging log
    return url;
  })(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
