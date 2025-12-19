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
  dashboard: () => [...managerKeys.all, 'dashboard'],
};

export const useManagerEvents = (params = {}) => {
  return useQuery({
    queryKey: managerKeys.events(),
    queryFn: () => managerApi.getMyEvents(params),
    staleTime: 1000 * 60,
  });
};

export const useManagerDashboard = () => {
  return useQuery({
    queryKey: managerKeys.dashboard(),
    queryFn: managerApi.getDashboard,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
      // Invalidate manager registrations list (UI for ManagerRegistrations)
      queryClient.invalidateQueries({
        queryKey: managerKeys.registrations(),
      });

      // Invalidate specific volunteer list and event details
      if (data?.registration?.eventId) {
        // Handle both populated object and direct ID
        const eventId = data.registration.eventId._id || data.registration.eventId;
        
        // Invalidate the specific event's volunteer list
        queryClient.invalidateQueries({ 
          queryKey: managerKeys.volunteers(eventId) 
        });
        
        // Invalidate event details (for counts)
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
        queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      }

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
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: managerKeys.events() });
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
