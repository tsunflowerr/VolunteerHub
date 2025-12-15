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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useToggleBookmark = (eventId) => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  const isBookmarked = user?.bookmarks?.includes(eventId);

  const mutation = useMutation({
    mutationFn: () => {
      if (isBookmarked) {
        return eventApi.removeBookmark(eventId);
      } else {
        return eventApi.addBookmark(eventId);
      }
    },
    onSuccess: () => {
      // Manually update AuthContext state
      if (user) {
        const updatedBookmarks = isBookmarked
          ? user.bookmarks.filter((id) => id !== eventId)
          : [...(user.bookmarks || []), eventId];
        updateUser({ bookmarks: updatedBookmarks });
      }

      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success(
        isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks'
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update bookmark');
    },
  });

  return {
    isBookmarked,
    toggleBookmark: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
