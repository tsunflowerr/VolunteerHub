import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Ensure this matches your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies if used
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Attempt to get token from localStorage
    // (If you switch to HttpOnly cookies entirely, this part can be removed)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle banned/locked user (403 with locked message)
    if (error.response?.status === 403 && error.response?.data?.message?.toLowerCase().includes('locked')) {
      // Clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      
      // Show message and redirect
      if (!window.location.pathname.includes('/login')) {
        alert('Your account has been locked. Please contact support.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Prevent infinite loops if the login endpoint itself fails with 401
    if (error.response?.status === 401 && !originalRequest._retry && !window.location.pathname.includes('/login')) {
      originalRequest._retry = true;
      
      // Clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;