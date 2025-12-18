import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notifications';
import toast from 'react-hot-toast';

export const notificationKeys = {
  all: ['notifications'],
  list: (filters) => [...notificationKeys.all, 'list', { ...filters }],
  unreadCount: () => [...notificationKeys.all, 'unreadCount'],
};

export const useNotifications = (params = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationApi.getAll(params),
    keepPreviousData: true,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark notification as read');
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete all notifications');
    },
  });
};
