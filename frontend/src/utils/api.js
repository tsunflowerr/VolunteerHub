/**
 * BƯỚC 14: API Helper
 * Tái sử dụng logic gọi API
 */

const API_URL = 'http://localhost:4000/api'

// Helper function để lấy token
const getToken = () => {
  return localStorage.getItem('token')
}

// Helper function để tạo headers
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const config = {
    ...options,
    headers: getHeaders()
  }
  
  const response = await fetch(url, config)
  
  // Xử lý lỗi authentication
  if (response.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Phiên đăng nhập hết hạn')
  }
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Có lỗi xảy ra')
  }
  
  return response.json()
}

// API methods
export const api = {
  // Auth
  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  
  // Events
  getEvents: () => 
    apiRequest('/admin/events'),
  
  approveEvent: (eventId) => 
    apiRequest(`/admin/events/${eventId}/approve`, { method: 'PUT' }),
  
  rejectEvent: (eventId) => 
    apiRequest(`/admin/events/${eventId}/reject`, { method: 'PUT' }),
  
  deleteEvent: (eventId) => 
    apiRequest(`/admin/events/${eventId}`, { method: 'DELETE' }),
  
  // Users
  getUsers: () => 
    apiRequest('/admin/users'),
  
  toggleLockUser: (userId) => 
    apiRequest(`/admin/users/${userId}/toggle-lock`, { method: 'PUT' }),
  
  deleteUser: (userId) => 
    apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),
  
  // Categories
  getCategories: () => 
    apiRequest('/categories'),
  
  createCategory: (data) => 
    apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  updateCategory: (categoryId, data) => 
    apiRequest(`/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  deleteCategory: (categoryId) => 
    apiRequest(`/admin/categories/${categoryId}`, { method: 'DELETE' })
}

export default api
