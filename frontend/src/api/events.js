import { api } from './api';

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
    // Note: If sending files, headers need 'multipart/form-data'
    // But if handling JSON data with image URLs, this is fine.
    // Adjust based on actual backend expectation for file upload.
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
};
