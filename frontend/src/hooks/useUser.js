import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users';
import { eventApi } from '../api/events';
import useAuth from './useAuth';

export const userKeys = {
  all: ['users'],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  profile: () => [...userKeys.all, 'profile'],
};

export const useUserProfile = (id) => {
  return useQuery({
    queryKey: id ? userKeys.detail(id) : userKeys.profile(),
    queryFn: () => (id ? usersApi.getUserById(id) : usersApi.getProfile()),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (response) => {
      const updatedUser = response.user || response;
      // Update AuthContext state (immediately updates navbar)
      updateUser(updatedUser);
      // Update React Query cache
      queryClient.setQueryData(userKeys.profile(), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: usersApi.deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      logout();
      toast.success('Account deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    },
  });
};

export const useBookmarkedEvents = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: usersApi.getBookmarkedEvents,
  });
};

export const useToggleBookmark = (eventId) => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  const isBookmarked = eventId
    ? user?.bookmarks?.some((b) => {
        const bId = typeof b === 'string' ? b : b?._id;
        return bId === eventId;
      })
    : false;

  const mutation = useMutation({
    mutationFn: ({ action }) => {
      // Guard against undefined eventId
      if (!eventId) {
        return Promise.reject(new Error('Event ID is required'));
      }
      console.log('Toggle Bookmark Mutation:', { eventId, action });
      
      if (action === 'remove') {
        return eventApi.removeBookmark(eventId);
      } else {
        return eventApi.addBookmark(eventId);
      }
    },
    onMutate: async ({ action }) => {
      // Don't run if no eventId
      if (!eventId) return {};
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });

      // Snapshot previous bookmarks
      const previousBookmarks = user?.bookmarks || [];

      // Optimistically update bookmarks in AuthContext
      if (user) {
        const updatedBookmarks = action === 'remove'
          ? previousBookmarks.filter((b) => {
              const bId = typeof b === 'string' ? b : b?._id;
              return bId !== eventId;
            })
          : [...previousBookmarks, eventId];
        updateUser({ bookmarks: updatedBookmarks });
      }

      return { previousBookmarks };
    },
    onError: (error, variables, context) => {
      const { action } = variables;
      // Handle specific error cases where state is already what we want
      const status = error.response?.status;
      const message = error.response?.data?.message;

      // Case 1: Tried to remove, but backend says "Bookmark not found" (404)
      if (action === 'remove' && status === 404) {
         toast.success('Removed from bookmarks');
         return;
      }

      // Case 2: Tried to add, but backend says "Already bookmarked" (400)
      if (action === 'add' && status === 400) {
        toast.success('Added to bookmarks');
        return;
      }

      // Default: Rollback on other errors
      if (context?.previousBookmarks && user) {
        updateUser({ bookmarks: context.previousBookmarks });
      }
      toast.error(message || 'Failed to update bookmark');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.action === 'remove' ? 'Removed from bookmarks' : 'Added to bookmarks'
      );
    },
  });

  // Provide a safe toggleBookmark function that prevents calls without eventId
  const toggleBookmark = () => {
    if (!eventId) {
      console.warn('Cannot toggle bookmark: Event ID is missing');
      return;
    }
    // Determine action at the moment of click
    const action = isBookmarked ? 'remove' : 'add';
    mutation.mutate({ action });
  };

  return {
    isBookmarked,
    toggleBookmark,
    isLoading: mutation.isPending,
  };
};
