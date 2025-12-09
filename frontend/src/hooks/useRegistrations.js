import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationApi } from '../api/registrations';
import toast from 'react-hot-toast';

export const registrationKeys = {
  all: ['registrations'],
  byEvent: (eventId) => [...registrationKeys.all, 'event', eventId],
};

export const useEventVolunteers = (eventId) => {
  return useQuery({
    queryKey: registrationKeys.byEvent(eventId),
    queryFn: () => registrationApi.getEventVolunteers(eventId),
    enabled: !!eventId,
    select: (data) => data.data, // Extract the data array from the response
  });
};

export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateRegistrationStatus'],
    mutationFn: registrationApi.updateStatus,
    onSuccess: (_, variables) => {
      // Invalidate the volunteers list for the specific event if we knew the eventId
      // Since we don't have eventId in variables directly (unless passed), we might invalidate all registrations or refine this.
      // However, usually we can pass eventId in context or invalidating all 'registrations' is safe enough for now.
      // Better: Invalidate all 'registrations' queries.
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      toast.success('Volunteer status updated successfully');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to update volunteer status'
      );
    },
  });
};
