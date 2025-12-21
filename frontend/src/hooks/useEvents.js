import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../api/events';
import toast from 'react-hot-toast';
import { notificationKeys } from './useNotifications';

export const eventKeys = {
  all: ['events'],
  lists: () => [...eventKeys.all, 'list'],
  list: (filters) => [...eventKeys.lists(), { ...filters }],
  details: () => [...eventKeys.all, 'detail'],
  detail: (id) => [...eventKeys.details(), id],
};

export const useEvents = (params = {}) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventApi.getAll(params),
    keepPreviousData: true, // Great for pagination
    staleTime: 0, // Always fetch fresh data for approved events
    refetchInterval: 1000 * 45, // Auto-refetch every 45 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useTrendingEvents = (params = {}) => {
  return useQuery({
    queryKey: ['events', 'trending', params],
    queryFn: () => eventApi.getTrending(params),
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventApi.getById(id),
    enabled: !!id, // Only fetch if id exists
    staleTime: 0, // Always fetch fresh data when query is invalidated
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Example of using 'select' to limit rerenders if you only need specific data
export const useEventNames = () => {
  return useQuery({
    queryKey: eventKeys.list({ limit: 100 }), // Adjust params as needed
    queryFn: () => eventApi.getAll(),
    select: (data) =>
      data.data.map((event) => ({ id: event._id, name: event.name })),
    staleTime: 1000 * 60 * 10,
  });
};

export const registrationKeys = {
  all: ['registrations'],
  lists: () => [...registrationKeys.all, 'list'],
  list: (params) => [...registrationKeys.lists(), { ...params }],
  details: () => [...registrationKeys.all, 'detail'],
  detail: (id) => [...registrationKeys.details(), id],
  mutations: {
    register: () => [...registrationKeys.all, 'register'],
    unregister: () => [...registrationKeys.all, 'unregister'],
  },
};

export const useMyRegistrations = (params = {}) => {
  return useQuery({
    queryKey: registrationKeys.list(params),
    queryFn: () => eventApi.getMyRegistrations(params),
    staleTime: 0, // ✅ CRITICAL: Always fetch fresh data - fixes "must F5 to see updates" issue
    refetchOnWindowFocus: true, // ✅ IMPORTANT: Auto-refetch when user returns to tab
    // Optional: Uncomment for auto-polling (trades bandwidth for real-time feel)
    // refetchInterval: 15000, // Auto-refresh every 15s when viewing registration list
  });
};

export const useRegistration = (registrationId) => {
  return useQuery({
    queryKey: registrationKeys.detail(registrationId),
    queryFn: () => eventApi.getRegistration(registrationId),
    enabled: !!registrationId,
  });
};

export const useRegisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: registrationKeys.mutations.register(),
    mutationFn: (eventId) => eventApi.register(eventId),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register for event');
    },
    onSuccess: (data, eventId) => {
      toast.success('Successfully registered for event!');
      // Invalidate all related queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useUnregisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: registrationKeys.mutations.unregister(),
    mutationFn: (eventId) => eventApi.unregister(eventId),
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister from event');
    },
    onSuccess: (data, eventId) => {
      toast.success('Successfully unregistered from event');
      // Invalidate all related queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
};

export const useEventsByManager = (managerId, params = {}) => {
  return useQuery({
    queryKey: [...eventKeys.lists(), 'manager', managerId, params],
    queryFn: () => eventApi.getEventsByManager(managerId, params),
    enabled: !!managerId,
    staleTime: 1000 * 60,
  });
};

export const useUserRegistrations = (userId, params = {}) => {
  return useQuery({
    queryKey: [...registrationKeys.lists(), 'user', userId, params],
    queryFn: () => eventApi.getUserRegistrations(userId, params),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};