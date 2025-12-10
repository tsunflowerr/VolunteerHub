import api from './api';

export const managerApi = {
  getAllRegistrations: async (params = {}) => {
    const response = await api.get('/manager/registrations', { params });
    return response.data;
  },
  createEvent: async (eventData) => {
    const response = await api.post('/manager/events', eventData);
    return response.data;
  },

  updateEvent: async ({ id, data }) => {
    const response = await api.put(`/manager/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/manager/events/${id}`);
    return response.data;
  },

  getMyEvents: async (params) => {
    const response = await api.get('/manager/events', { params });
    return response.data;
  },

  getEventVolunteers: async (eventId) => {
    const response = await api.get(`/manager/events/${eventId}/volunteers`);
    return response.data;
  },

  updateStatus: async ({ registrationId, status }) => {
    const response = await api.patch(
      `/manager/registrations/${registrationId}/status`,
      { status }
    );
    return response.data;
  },
};
