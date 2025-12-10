import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsApi } from '../api/registrations';
import toast from 'react-hot-toast';

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
    queryFn: () => registrationsApi.getMyRegistrations(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useRegistration = (registrationId) => {
  return useQuery({
    queryKey: registrationKeys.detail(registrationId),
    queryFn: () => registrationsApi.getRegistration(registrationId),
    enabled: !!registrationId,
  });
};

export const useRegisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: registrationKeys.mutations.register(),
    mutationFn: (eventId) => registrationsApi.register(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
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
    mutationFn: (eventId) => registrationsApi.unregister(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      toast.success('Successfully unregistered from event');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister from event');
    },
  });
};