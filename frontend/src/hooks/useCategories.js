import { useQuery } from '@tanstack/react-query';
import { getAllCategories, getCategoryById, getCategoryBySlug } from '../api/categories';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data,
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

export const useCategoryBySlug = (slug) => {
  return useQuery({
    queryKey: ['category', 'slug', slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
    select: (data) => data.data,
  });
};
