import api from './api';

export const adminApi = {
  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleLockUser: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/lock`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Events
  getPendingEvents: async () => {
    const response = await api.get('/admin/events/pending');
    return response.data;
  },

  getAllEvents: async (params = {}) => {
    const response = await api.get('/admin/events', { params });
    return response.data;
  },

  getEventById: async (eventId) => {
    const response = await api.get(`/admin/events/${eventId}`);
    return response.data;
  },

  updateEventStatus: async ({ eventId, status }) => {
    const response = await api.patch(`/admin/events/${eventId}/status`, {
      status,
    });
    return response.data;
  },

  updateEvent: async ({ eventId, data }) => {
    const response = await api.put(`/admin/events/${eventId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/admin/events/${eventId}`);
    return response.data;
  },

  // Comments
  deleteComment: async (commentId) => {
    const response = await api.delete(`/admin/comments/${commentId}`);
    return response.data;
  },

  // Categories
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async ({ id, data }) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Reports
  getReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  getReportById: async (reportId) => {
    const response = await api.get(`/admin/reports/${reportId}`);
    return response.data;
  },

  getReportStats: async () => {
    const response = await api.get('/admin/reports/stats');
    return response.data;
  },

  reviewReport: async ({ reportId, data }) => {
    const response = await api.patch(`/admin/reports/${reportId}/review`, data);
    return response.data;
  },

  deleteReport: async (reportId) => {
    const response = await api.delete(`/admin/reports/${reportId}`);
    return response.data;
  },

  // Export
  exportUsers: async () => {
    const response = await api.get('/admin/export/users', {
      responseType: 'blob',
    });
    return response.data;
  },

  exportEvents: async () => {
    const response = await api.get('/admin/export/events', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};
