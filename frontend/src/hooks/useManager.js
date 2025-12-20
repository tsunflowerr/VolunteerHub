import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerApi } from '../api/manager';
import { eventKeys } from './useEvents'; // Reuse keys if possible, or define separate manager keys
import { notificationKeys } from './useNotifications';
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
    staleTime: 0, // Always consider data stale for fresh updates
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always fetch on component mount
  });
};

export const useManagerDashboard = () => {
  return useQuery({
    queryKey: managerKeys.dashboard(),
    queryFn: managerApi.getDashboard,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 1000 * 60, // Auto-refetch every 60 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always fetch on component mount
  });
};

// Get all event registrations for current manager
export const useManagerRegistrations = (params = {}) => {
  return useQuery({
    queryKey: managerKeys.registrationList(params),
    queryFn: () => managerApi.getAllRegistrations(params),
    staleTime: 1000 * 30, // 30 seconds - reduced for fresher data
    refetchInterval: 1000 * 60, // Auto-refetch every 60 seconds for new registrations
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always fetch on component mount
  });
};

export const useEventVolunteers = (eventId) => {
  return useQuery({
    queryKey: managerKeys.volunteers(eventId),
    queryFn: () => managerApi.getEventVolunteers(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Auto-refetch every 60 seconds
    refetchOnWindowFocus: true,
  });
};

export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateRegistrationStatus'],
    mutationFn: managerApi.updateStatus,
    onMutate: async (variables) => {
      const { registrationId, status } = variables;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: managerKeys.registrations() });

      // Snapshot previous data
      const previousData = queryClient.getQueriesData({ queryKey: managerKeys.registrations() });

      // Optimistically update the registration status
      queryClient.setQueriesData({ queryKey: managerKeys.registrations() }, (old) => {
        if (!old) return old;
        
        // Handle different response structures
        if (old.registrations) {
          return {
            ...old,
            registrations: old.registrations.map((reg) =>
              reg._id === registrationId ? { ...reg, status } : reg
            ),
          };
        }
        if (old.data) {
          return {
            ...old,
            data: old.data.map((reg) =>
              reg._id === registrationId ? { ...reg, status } : reg
            ),
          };
        }
        return old;
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(
        error.response?.data?.message || 'Failed to update volunteer status'
      );
    },
    onSuccess: (data, variables) => {
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
    onSettled: () => {
      // Invalidate manager registrations list (UI for ManagerRegistrations)
      queryClient.invalidateQueries({
        queryKey: managerKeys.registrations(),
      });
      // Invalidate notifications so the volunteer sees status update notification
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
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

export const useCompleteEventEarly = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['completeEventEarly'],
    mutationFn: managerApi.completeEventEarly,
    onSuccess: (data, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: managerKeys.events() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      toast.success(data.message || 'Event completed successfully! You can now mark volunteers as completed.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete event');
    },
  });
};
