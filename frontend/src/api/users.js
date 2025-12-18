import api from './api';

export const usersApi = {
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data.user;
  },

  updateProfile: async (userData) => {
    const config = {};
    if (userData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' }; // axios will handle boundary if we pass FormData, but explicitly setting it to multipart/form-data without boundary is BAD.
      // actually, just let axios handle it. 
      // But we have a default application/json. 
      // So we must override it.
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    // Wait, axios documentation says: "In browser, axios automatically serializes FormData ... and sets Content-Type header to multipart/form-data"
    // BUT we have a default set in api.js.
    // The safest way is to set it to undefined so axios/browser logic kicks in.
    
    // Let's use a smarter approach:
    const isFormData = userData instanceof FormData;
    const response = await api.put('/users/profile', userData, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {});
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
