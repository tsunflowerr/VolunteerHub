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
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useTrendingEvents = (params = {}) => {
  return useQuery({
    queryKey: ['events', 'trending', params],
    queryFn: () => eventApi.getTrending(params),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    onMutate: async (eventId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: registrationKeys.lists() });
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) });

      // Snapshot previous values
      const previousRegistrations = queryClient.getQueryData(registrationKeys.lists());
      const previousEvent = queryClient.getQueryData(eventKeys.detail(eventId));

      // Optimistically update event registrations count
      queryClient.setQueryData(eventKeys.detail(eventId), (old) => {
        if (!old || !old.event) return old;
        return {
          ...old,
          event: {
            ...old.event,
            registrationsCount: (old.event.registrationsCount || 0) + 1,
          },
        };
      });

      return { previousRegistrations, previousEvent, eventId };
    },
    onError: (error, eventId, context) => {
      // Rollback on error
      if (context?.previousRegistrations) {
        queryClient.setQueryData(registrationKeys.lists(), context.previousRegistrations);
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(eventId), context.previousEvent);
      }
      toast.error(error.response?.data?.message || 'Failed to register for event');
    },
    onSuccess: (data, variables) => {
      toast.success('Successfully registered for event!');
    },
    onSettled: (data, error, eventId) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      // Invalidate notifications to show new notification immediately
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useUnregisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: registrationKeys.mutations.unregister(),
    mutationFn: (eventId) => eventApi.unregister(eventId),
    onMutate: async (eventId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: registrationKeys.lists() });
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) });

      // Snapshot previous values
      const previousRegistrations = queryClient.getQueryData(registrationKeys.lists());
      const previousEvent = queryClient.getQueryData(eventKeys.detail(eventId));

      // Optimistically update event registrations count
      queryClient.setQueryData(eventKeys.detail(eventId), (old) => {
        if (!old || !old.event) return old;
        return {
          ...old,
          event: {
            ...old.event,
            registrationsCount: Math.max(0, (old.event.registrationsCount || 0) - 1),
          },
        };
      });

      // Optimistically remove from registrations list
      queryClient.setQueriesData({ queryKey: registrationKeys.lists() }, (old) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter((r) => (r.eventId._id || r.eventId) !== eventId),
        };
      });

      return { previousRegistrations, previousEvent, eventId };
    },
    onError: (error, eventId, context) => {
      // Rollback on error
      if (context?.previousRegistrations) {
        queryClient.setQueryData(registrationKeys.lists(), context.previousRegistrations);
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(eventId), context.previousEvent);
      }
      toast.error(error.response?.data?.message || 'Failed to unregister from event');
    },
    onSuccess: () => {
      toast.success('Successfully unregistered from event');
    },
    onSettled: (data, error, eventId) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
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