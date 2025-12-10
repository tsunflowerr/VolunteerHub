import api from './api';

export const usersApi = {
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data.user;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/profile/password', passwordData);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  },

  getBookmarkedEvents: async () => {
    const response = await api.get('/users/bookmarks');
    return response.data;
  },
};
