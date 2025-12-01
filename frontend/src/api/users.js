import api from './api';

export const usersApi = {
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data.user;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/users/profile/password', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  },
};
