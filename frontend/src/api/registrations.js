import api from './api';

export const registrationApi = {
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
