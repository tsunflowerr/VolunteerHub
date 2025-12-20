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
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Snapshot previous values
      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old) => {
        if (!old) return old;
        if (old.notifications) {
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n._id === notificationId ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
          };
        }
        return old;
      });

      return { previousData };
    },
    onError: (error, notificationId, context) => {
      // Rollback on error
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(error.response?.data?.message || 'Failed to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });

      // Optimistically mark all as read
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old) => {
        if (!old) return old;
        if (old.notifications) {
          return {
            ...old,
            notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
          };
        }
        return old;
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications marked as read');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.delete,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });

      // Optimistically remove the notification
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old) => {
        if (!old) return old;
        if (old.notifications) {
          const notificationToDelete = old.notifications.find((n) => n._id === notificationId);
          return {
            ...old,
            notifications: old.notifications.filter((n) => n._id !== notificationId),
            unreadCount: notificationToDelete && !notificationToDelete.isRead 
              ? Math.max(0, (old.unreadCount || 0) - 1) 
              : old.unreadCount,
          };
        }
        return old;
      });

      return { previousData };
    },
    onError: (error, notificationId, context) => {
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('Notification deleted');
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.deleteAll,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all });

      // Optimistically clear all notifications
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: [],
          unreadCount: 0,
        };
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(error.response?.data?.message || 'Failed to delete all notifications');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('All notifications deleted');
    },
  });
};
