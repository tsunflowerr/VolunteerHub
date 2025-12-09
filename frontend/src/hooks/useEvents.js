import { useQuery } from '@tanstack/react-query';
import { eventApi } from '../api/events';

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