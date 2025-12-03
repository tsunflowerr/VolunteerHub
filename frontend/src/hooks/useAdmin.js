import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import toast from 'react-hot-toast';

// ============================================
// Query Key Factory
// ============================================
export const adminKeys = {
  all: ['admin'],

  // Users
  users: () => [...adminKeys.all, 'users'],
  usersList: (filters) => [...adminKeys.users(), 'list', { ...filters }],

  // Events
  events: () => [...adminKeys.all, 'events'],
  pendingEvents: () => [...adminKeys.events(), 'pending'],

  // Categories
  categories: () => [...adminKeys.all, 'categories'],

  // Dashboard
  dashboard: () => [...adminKeys.all, 'dashboard'],

  // Mutation keys
  mutations: {
    toggleLockUser: () => [...adminKeys.users(), 'toggle-lock'],
    createUser: () => [...adminKeys.users(), 'create'],
    updateEventStatus: () => [...adminKeys.events(), 'update-status'],
    deleteEvent: () => [...adminKeys.events(), 'delete'],
    createCategory: () => [...adminKeys.categories(), 'create'],
    updateCategory: () => [...adminKeys.categories(), 'update'],
    exportUsers: () => [...adminKeys.users(), 'export'],
    exportEvents: () => [...adminKeys.events(), 'export'],
  },
};

// ============================================
// Users Hooks
// ============================================

/**
 * Fetch all users for admin
 * @param {Object} params - Filter params (role, search, page, limit)
 */
export const useAdminUsers = (params = {}) => {
  return useQuery({
    queryKey: adminKeys.usersList(params),
    queryFn: () => adminApi.getUsers(params),
    staleTime: 1000 * 60, // 1 minute
    select: (data) => {
      // Map API response to consistent format
      const users = (data.data || data.users || []).map((user) => ({
        _id: user._id,
        username: user.username || user.fullName,
        email: user.email,
        phone: user.phoneNumber || user.phone,
        role: user.role || 'user',
        isLocked: user.isLocked || user.status === 'locked',
        createdAt: user.createdAt,
        avatar: user.avatar,
      }));
      return { users, pagination: data.pagination };
    },
  });
};

/**
 * Toggle lock/unlock user account
 */
export const useToggleLockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: adminKeys.mutations.toggleLockUser(),
    mutationFn: adminApi.toggleLockUser,
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminKeys.users() });

      // Snapshot current data for rollback
      const previousData = queryClient.getQueriesData({
        queryKey: adminKeys.users(),
      });

      // Optimistic update
      queryClient.setQueriesData({ queryKey: adminKeys.users() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.map((user) =>
            user._id === userId ? { ...user, isLocked: !user.isLocked } : user
          ),
        };
      });

      return { previousData };
    },
    onError: (error, userId, context) => {
      // Rollback on error
      context?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(
        error.response?.data?.message || 'Failed to update user status'
      );
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User status updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
};

/**
 * Create new user (admin)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: adminKeys.mutations.createUser(),
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });
};

// ============================================
// Events Hooks
// ============================================

/**
 * Fetch pending events for approval
 */
export const useAdminPendingEvents = () => {
  return useQuery({
    queryKey: adminKeys.pendingEvents(),
    queryFn: adminApi.getPendingEvents,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Update event status (approve/reject)
 */
export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: adminKeys.mutations.updateEventStatus(),
    mutationFn: adminApi.updateEventStatus,
    onSuccess: (data, { status }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingEvents() });
      queryClient.invalidateQueries({ queryKey: ['events'] }); // Also invalidate events list
      toast.success(`Event ${status} successfully`);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to update event status'
      );
    },
  });
};

/**
 * Delete event (admin)
 */
export const useAdminDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: adminKeys.mutations.deleteEvent(),
    mutationFn: adminApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.events() });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    },
  });
};

// ============================================
// Categories Hooks
// ============================================

/**
 * Fetch all categories
 */
export const useAdminCategories = (params = {}) => {
  return useQuery({
    queryKey: ['categories', params], // Use simple key or add to adminKeys
    queryFn: () => adminApi.getCategories(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
       // Map if necessary, or return raw
       return (data.data || data.categories || []).map(cat => ({
         _id: cat._id,
         name: cat.name,
         slug: cat.slug,
         description: cat.description,
         color: cat.color || '#667eea',
         eventCount: cat.eventCount || 0,
         createdAt: cat.createdAt
       }));
    }
  });
};

/**
 * Create new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: adminKeys.mutations.createCategory(),
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    },
  });
};

/**
 * Update category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: adminKeys.mutations.updateCategory(),
    mutationFn: adminApi.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });
};

/**
 * Delete category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['categories', 'delete'],
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });
};

// ============================================
// Dashboard Hook
// ============================================

/**
 * Fetch admin dashboard data
 */
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: adminApi.getDashboard,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ============================================
// Export Hooks
// ============================================

/**
 * Export users to CSV
 */
export const useExportUsers = () => {
  return useMutation({
    mutationKey: adminKeys.mutations.exportUsers(),
    mutationFn: adminApi.exportUsers,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to export users');
    },
  });
};

/**
 * Export events to CSV
 */
export const useExportEvents = () => {
  return useMutation({
    mutationKey: adminKeys.mutations.exportEvents(),
    mutationFn: adminApi.exportEvents,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Events exported successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to export events');
    },
  });
};
