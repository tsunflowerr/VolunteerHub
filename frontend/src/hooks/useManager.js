import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerApi } from '../api/manager';
import { eventKeys } from './useEvents'; // Reuse keys if possible, or define separate manager keys
import toast from 'react-hot-toast';

export const managerKeys = {
  all: ['manager'],
  events: () => [...managerKeys.all, 'events'],
  volunteers: (eventId) => [...managerKeys.all, 'volunteers', eventId],
  registrations: () => [...managerKeys.all, 'registrations'],
  registrationList: (params) => [...managerKeys.registrations(), { ...params }],
};

export const useManagerEvents = (params = {}) => {
  return useQuery({
    queryKey: managerKeys.events(),
    queryFn: () => managerApi.getMyEvents(params),
    staleTime: 1000 * 60,
  });
};

// Get all event registrations for current manager
export const useManagerRegistrations = (params = {}) => {
  return useQuery({
    queryKey: managerKeys.registrationList(params),
    queryFn: () => managerApi.getAllRegistrations(params),
    staleTime: 1000 * 60,
  });
};

export const useEventVolunteers = (eventId) => {
  return useQuery({
    queryKey: managerKeys.volunteers(eventId),
    queryFn: () => managerApi.getEventVolunteers(eventId),
    enabled: !!eventId,
  });
};

export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateRegistrationStatus'],
    mutationFn: managerApi.updateStatus,
    onSuccess: (data, variables) => {
      // Invalidate specific volunteer list if eventId was known,
      // but since variables is { registrationId, status }, we might not know eventId directly.
      // However, we can invalidate all 'volunteers' queries under manager.
      queryClient.invalidateQueries({ queryKey: ['manager', 'volunteers'] });
      toast.success('Volunteer status updated successfully');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to update volunteer status'
      );
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createEvent'],
    mutationFn: managerApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: managerKeys.events() });
      toast.success('Event created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateEvent'],
    mutationFn: managerApi.updateEvent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: managerKeys.events() });
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.id),
      });
      toast.success('Event updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update event');
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteEvent'],
    mutationFn: managerApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: managerKeys.events() });
      toast.success('Event deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    },
  });
};
