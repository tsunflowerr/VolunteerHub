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
};