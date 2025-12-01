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

    // Prevent infinite loops if the login endpoint itself fails with 401
    if (error.response?.status === 401 && !originalRequest._retry && !window.location.pathname.includes('/login')) {
      originalRequest._retry = true;
      
      // Optional: Clear storage if you are relying on localStorage token
      // localStorage.removeItem('token');
      // localStorage.removeItem('currentUser');
      
      // Redirect logic could go here, but usually better handled by the UI layer (e.g., AuthContext)
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;