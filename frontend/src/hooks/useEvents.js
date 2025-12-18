import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../api/events';
import toast from 'react-hot-toast';

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
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventApi.getById(id),
    enabled: !!id, // Only fetch if id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    staleTime: 1000 * 60, // 1 minute
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success('Successfully registered for event!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register for event');
    },
  });
};

export const useUnregisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: registrationKeys.mutations.unregister(),
    mutationFn: (eventId) => eventApi.unregister(eventId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success('Successfully unregistered from event');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister from event');
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