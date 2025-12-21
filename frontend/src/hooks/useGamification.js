import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gamificationApi } from '../api/gamification';

// Query keys
export const gamificationKeys = {
  all: ['gamification'],
  achievements: () => [...gamificationKeys.all, 'achievements'],
  achievementsWithParams: (params) => [...gamificationKeys.achievements(), params],
  levels: () => [...gamificationKeys.all, 'levels'],
  leaderboard: (params) => [...gamificationKeys.all, 'leaderboard', params],
  profile: () => [...gamificationKeys.all, 'profile'],
  userProfile: (userId) => [...gamificationKeys.all, 'profile', userId],
  history: (params) => [...gamificationKeys.all, 'history', params],
  userHistory: (userId, params) => [...gamificationKeys.all, 'history', userId, params],
  eligibility: (eventId) => [...gamificationKeys.all, 'eligibility', eventId],
  // Manager keys
  managerAchievements: () => [...gamificationKeys.all, 'manager', 'achievements'],
  // Admin keys
  adminStats: () => [...gamificationKeys.all, 'admin', 'stats'],
  adminAchievements: (params) => [...gamificationKeys.all, 'admin', 'achievements', params],
  adminLevels: () => [...gamificationKeys.all, 'admin', 'levels'],
};

// ====== Public/User Hooks ======

export const useAchievements = (params = {}) => {
  return useQuery({
    queryKey: gamificationKeys.achievementsWithParams(params),
    queryFn: () => gamificationApi.getAllAchievements(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Alias for useAchievements - used in forms
export const useAllAchievements = (params = {}) => useAchievements(params);

export const useLevels = () => {
  return useQuery({
    queryKey: gamificationKeys.levels(),
    queryFn: gamificationApi.getAllLevels,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Alias for useLevels - used in forms
export const useAllLevels = () => useLevels();

export const useLeaderboard = (params = { limit: 10, type: 'points' }) => {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(params),
    queryFn: () => gamificationApi.getLeaderboard(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMyGamificationProfile = (enabled = true) => {
  return useQuery({
    queryKey: gamificationKeys.profile(),
    queryFn: gamificationApi.getMyGamificationProfile,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserGamificationProfile = (userId) => {
  return useQuery({
    queryKey: gamificationKeys.userProfile(userId),
    queryFn: () => gamificationApi.getUserGamificationProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyPointHistory = (params = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: gamificationKeys.history(params),
    queryFn: () => gamificationApi.getMyPointHistory(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUserPointHistory = (userId, params = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: gamificationKeys.userHistory(userId, params),
    queryFn: () => gamificationApi.getUserPointHistory(userId, params),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEventEligibility = (eventId) => {
  return useQuery({
    queryKey: gamificationKeys.eligibility(eventId),
    queryFn: () => gamificationApi.checkEventEligibility(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUpdateFeaturedAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.updateFeaturedAchievements,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.profile() });
      toast.success('Featured achievements updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update featured achievements');
    },
  });
};

// ====== Manager Hooks ======

export const useManagerAchievements = () => {
  return useQuery({
    queryKey: gamificationKeys.managerAchievements(),
    queryFn: gamificationApi.getManagerAchievements,
    staleTime: 1000 * 60 * 10,
  });
};

export const useAwardAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.awardAchievement,
    onSuccess: (data) => {
      toast.success(data.message || 'Achievement awarded successfully!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to award achievement');
    },
  });
};

// ====== Admin Hooks ======

export const useGamificationStats = () => {
  return useQuery({
    queryKey: gamificationKeys.adminStats(),
    queryFn: gamificationApi.getGamificationStats,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSeedDefaultLevels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.seedDefaultLevels,
    onSuccess: (data) => {
      toast.success(data.message || 'Default levels created!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.levels() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminLevels() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to seed levels');
    },
  });
};

export const useSeedDefaultAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.seedDefaultAchievements,
    onSuccess: (data) => {
      toast.success(data.message || 'Default achievements created!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminAchievements({}) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to seed achievements');
    },
  });
};

export const useAdminAchievements = (params = {}) => {
  return useQuery({
    queryKey: gamificationKeys.adminAchievements(params),
    queryFn: () => gamificationApi.getAdminAchievements(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.createAchievement,
    onSuccess: (data) => {
      toast.success(data.message || 'Achievement created!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminAchievements({}) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create achievement');
    },
  });
};

export const useUpdateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => gamificationApi.updateAchievement(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Achievement updated!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminAchievements({}) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update achievement');
    },
  });
};

export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.deleteAchievement,
    onSuccess: (data) => {
      toast.success(data.message || 'Achievement deleted!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.achievements() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminAchievements({}) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete achievement');
    },
  });
};

export const useAdminLevels = () => {
  return useQuery({
    queryKey: gamificationKeys.adminLevels(),
    queryFn: gamificationApi.getAdminLevels,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.createLevel,
    onSuccess: (data) => {
      toast.success(data.message || 'Level created!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.levels() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminLevels() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create level');
    },
  });
};

export const useUpdateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => gamificationApi.updateLevel(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Level updated!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.levels() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminLevels() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update level');
    },
  });
};

export const useDeleteLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.deleteLevel,
    onSuccess: (data) => {
      toast.success(data.message || 'Level deleted!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.levels() });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.adminLevels() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete level');
    },
  });
};

export const useAdjustUserPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.adjustUserPoints,
    onSuccess: (data) => {
      toast.success(data.message || 'Points adjusted!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to adjust points');
    },
  });
};

export const useAdminAwardAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gamificationApi.adminAwardAchievement,
    onSuccess: (data) => {
      toast.success(data.message || 'Achievement awarded!');
      queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to award achievement');
    },
  });
};
