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

  // Events
  getPendingEvents: async () => {
    const response = await api.get('/admin/events/pending');
    return response.data;
  },

  updateEventStatus: async ({ eventId, status }) => {
    const response = await api.patch(`/admin/events/${eventId}/status`, {
      status,
    });
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/admin/events/${eventId}`);
    return response.data;
  },

  // Categories
  createCategory: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async ({ id, data }) => {
    const response = await api.put(`/admin/categories/${id}`, data);
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
