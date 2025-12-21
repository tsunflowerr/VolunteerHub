import api from './api';

export const managerApi = {
  getAllRegistrations: async (params = {}) => {
    const response = await api.get('/manager/registrations', { params });
    return response.data;
  },
  createEvent: async (eventData) => {
    const isFormData = eventData instanceof FormData;
    const response = await api.post('/manager/events', eventData, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {});
    return response.data;
  },

  updateEvent: async ({ id, data }) => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/manager/events/${id}`, data, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {});
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/manager/events/${id}`);
    return response.data;
  },

  completeEventEarly: async (id) => {
    const response = await api.patch(`/manager/events/${id}/complete`);
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

  deleteRegistration: async (registrationId) => {
    const response = await api.delete(`/manager/registrations/${registrationId}`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },
};
