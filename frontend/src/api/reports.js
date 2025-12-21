import api from './api';

export const reportsApi = {
  // Create a new report
  createReport: async (data) => {
    const response = await api.post('/users/reports', data);
    return response.data;
  },

  // Get my reports
  getMyReports: async (params = {}) => {
    const response = await api.get('/users/reports', { params });
    return response.data;
  },
};
