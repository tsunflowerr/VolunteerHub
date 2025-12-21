import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/search';

export const searchKeys = {
  all: ['search'],
  advanced: (params) => [...searchKeys.all, 'advanced', params],
};

export const useAdvancedSearch = (params = {}) => {
  return useQuery({
    queryKey: searchKeys.advanced(params),
    queryFn: () => searchApi.advancedSearch(params),
    enabled: !!params.q, // Only run if keyword is present
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
