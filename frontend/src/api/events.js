import api from './api';

export const eventApi = {
  getAll: async (params = {}) => {
    // params: { page, limit, category, keyword, etc. }
    const response = await api.get('/search/events', {
      params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach((val) => searchParams.append(key, val));
          } else if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        return searchParams.toString();
      },
    });
    return response.data;
  },

  getTrending: async (params = {}) => {
    const response = await api.get('/events/trending', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  addBookmark: async (eventId) => {
    const response = await api.post(`/events/${eventId}/bookmarks`);
    return response.data;
  },

  removeBookmark: async (eventId) => {
    const response = await api.delete(`/events/${eventId}/bookmarks`);
    return response.data;
  },

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

  // Get events hosted by a manager (public)
  getEventsByManager: async (managerId, params = {}) => {
    const response = await api.get('/events', { 
      params: { ...params, managerId } 
    });
    return response.data;
  },

  // Get completed registrations for a specific user (public)
  getUserRegistrations: async (userId, params = {}) => {
    const response = await api.get(`/events/registrations/user/${userId}`, { params });
    return response.data;
  },
};
