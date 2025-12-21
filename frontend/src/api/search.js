import api from './api';

export const searchApi = {
  advancedSearch: async (params = {}) => {
    // params: { q, type, page, limit }
    const response = await api.get('/search/advanced', { params });
    return response.data;
  },
};
