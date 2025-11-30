import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
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

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (optional: auto-logout)
    if (error.response && error.response.status === 401) {
       // Only redirect if we are not already on the login page to avoid loops
       if (window.location.pathname !== '/login') {
          // Clear local storage or trigger a logout action
          // localStorage.removeItem('token');
          // localStorage.removeItem('currentUser');
          // window.location.href = '/login';
       }
    }
    return Promise.reject(error);
  }
);

export default api;
