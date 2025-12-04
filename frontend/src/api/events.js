import api from './api';

export const eventApi = {
  getAll: async (params) => {
    // params: { page, limit, category, etc. }
    const response = await api.get('/events', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (eventData) => {
    const response = await api.post('/manager/events', eventData);
    return response.data;
  },

  update: async ({ id, data }) => {
    const response = await api.put(`/manager/events/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/manager/events/${id}`);
    return response.data;
  },

  // Manager-specific endpoints
  getMyEvents: async (params) => {
    const response = await api.get('/manager/events', { params });
    return response.data;
  },
};
