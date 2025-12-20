import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';
import toast from 'react-hot-toast';

// ============================================
// Query Key Factory
// ============================================
export const reportKeys = {
  all: ['reports'],
  myReports: (filters) => [...reportKeys.all, 'my', { ...filters }],
};

// ============================================
// User Reports Hooks
// ============================================

/**
 * Create a new report
 */
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['reports', 'create'],
    mutationFn: reportsApi.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      toast.success('Report submitted successfully. Thank you for helping keep our community safe.');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to submit report';
      toast.error(message);
    },
  });
};

/**
 * Fetch user's own reports
 * @param {Object} params - Filter params (status, page, limit)
 */
export const useMyReports = (params = {}) => {
  return useQuery({
    queryKey: reportKeys.myReports(params),
    queryFn: () => reportsApi.getMyReports(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
