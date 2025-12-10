import api from './api';

export const registrationsApi = {
  // Register for an event
  register: async (eventId) => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  // Unregister from an event
  unregister: async (eventId) => {
    const response = await api.delete(`/events/${eventId}/unregister`);
    return response.data;
  },

  // Get current user's registrations
  getMyRegistrations: async (params = {}) => {
    const response = await api.get('/events/registrations/my', { params });
    return response.data;
  },

  // Get specific registration details
  getRegistration: async (registrationId) => {
    const response = await api.get(`/events/registrations/${registrationId}`);
    return response.data;
  },
};
