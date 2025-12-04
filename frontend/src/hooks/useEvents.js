import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../api/events';
import toast from 'react-hot-toast';

export const eventKeys = {
  all: ['events'],
  lists: () => [...eventKeys.all, 'list'],
  list: (filters) => [...eventKeys.lists(), { ...filters }],
  details: () => [...eventKeys.all, 'detail'],
  detail: (id) => [...eventKeys.details(), id],
  managerEvents: () => [...eventKeys.all, 'manager'],
  mutations: {
    create: () => [...eventKeys.all, 'create'],
    update: () => [...eventKeys.all, 'update'],
    delete: () => [...eventKeys.all, 'delete'],
  },
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

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: eventKeys.mutations.create(),
    mutationFn: eventApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.managerEvents() });
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
    mutationKey: eventKeys.mutations.update(),
    mutationFn: eventApi.update,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.managerEvents() });
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
    mutationKey: eventKeys.mutations.delete(),
    mutationFn: eventApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.managerEvents() });
      toast.success('Event deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    },
  });
};

export const useManagerEvents = (params = {}) => {
  return useQuery({
    queryKey: eventKeys.managerEvents(),
    queryFn: () => eventApi.getMyEvents(params),
    staleTime: 1000 * 60,
  });
};
