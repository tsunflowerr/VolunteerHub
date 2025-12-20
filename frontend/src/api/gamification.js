import api from './api';

export const gamificationApi = {
  // ====== Public/User Routes ======
  
  // Get all achievements (with user progress if logged in)
  getAllAchievements: async (params = {}) => {
    const response = await api.get('/gamification/achievements', { params });
    return response.data;
  },

  // Get all levels
  getAllLevels: async () => {
    const response = await api.get('/gamification/levels');
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (params = { limit: 10, type: 'points' }) => {
    const response = await api.get('/gamification/leaderboard', { params });
    return response.data;
  },

  // Get current user's gamification profile
  getMyGamificationProfile: async () => {
    const response = await api.get('/gamification/profile');
    return response.data;
  },

  // Get a user's gamification profile by ID
  getUserGamificationProfile: async (userId) => {
    const response = await api.get(`/gamification/profile/${userId}`);
    return response.data;
  },

  // Get current user's point history
  getMyPointHistory: async (params = { page: 1, limit: 20 }) => {
    const response = await api.get('/gamification/history', { params });
    return response.data;
  },

  // Get a user's point history by ID
  getUserPointHistory: async (userId, params = { page: 1, limit: 20 }) => {
    const response = await api.get(`/gamification/history/${userId}`, { params });
    return response.data;
  },

  // Update featured achievements on profile
  updateFeaturedAchievements: async (achievementIds) => {
    const response = await api.put('/gamification/featured', { achievementIds });
    return response.data;
  },

  // Check if user is eligible for an event
  checkEventEligibility: async (eventId) => {
    const response = await api.get(`/gamification/eligibility/${eventId}`);
    return response.data;
  },

  // ====== Manager Routes ======

  // Get available achievements that manager can award
  getManagerAchievements: async () => {
    const response = await api.get('/manager/achievements');
    return response.data;
  },

  // Award achievement to volunteer
  awardAchievement: async (data) => {
    const response = await api.post('/manager/achievements/award', data);
    return response.data;
  },

  // ====== Admin Routes ======

  // Get gamification stats
  getGamificationStats: async () => {
    const response = await api.get('/admin/gamification/stats');
    return response.data;
  },

  // Seed default levels
  seedDefaultLevels: async () => {
    const response = await api.post('/admin/gamification/seed/levels');
    return response.data;
  },

  // Seed default achievements
  seedDefaultAchievements: async () => {
    const response = await api.post('/admin/gamification/seed/achievements');
    return response.data;
  },

  // Get all achievements (admin view)
  getAdminAchievements: async (params = {}) => {
    const response = await api.get('/admin/achievements', { params });
    return response.data;
  },

  // Create achievement
  createAchievement: async (data) => {
    const response = await api.post('/admin/achievements', data);
    return response.data;
  },

  // Update achievement
  updateAchievement: async (id, data) => {
    const response = await api.put(`/admin/achievements/${id}`, data);
    return response.data;
  },

  // Delete achievement
  deleteAchievement: async (id) => {
    const response = await api.delete(`/admin/achievements/${id}`);
    return response.data;
  },

  // Award achievement to user (admin)
  adminAwardAchievement: async (data) => {
    const response = await api.post('/admin/achievements/award', data);
    return response.data;
  },

  // Get all levels (admin view)
  getAdminLevels: async () => {
    const response = await api.get('/admin/levels');
    return response.data;
  },

  // Create level
  createLevel: async (data) => {
    const response = await api.post('/admin/levels', data);
    return response.data;
  },

  // Update level
  updateLevel: async (id, data) => {
    const response = await api.put(`/admin/levels/${id}`, data);
    return response.data;
  },

  // Delete level
  deleteLevel: async (id) => {
    const response = await api.delete(`/admin/levels/${id}`);
    return response.data;
  },

  // Adjust user points
  adjustUserPoints: async (data) => {
    const response = await api.post('/admin/points/adjust', data);
    return response.data;
  }
};

export default gamificationApi;
