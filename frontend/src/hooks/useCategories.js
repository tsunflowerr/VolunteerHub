import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories';

export const categoryKeys = {
  all: ['categories'],
  detail: (id) => ['categories', 'detail', id],
  slug: (slug) => ['categories', 'slug', slug],
};

export const useCategories = () => {
  const query = useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoriesApi.getAll,
    staleTime: 1000 * 60 * 10, // 10 minutes - categories rarely change
  });

  return {
    ...query,
    categories: query.data?.categories ?? [],
  };
};

export const useCategory = (id) => {
  const query = useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });

  return {
    ...query,
    category: query.data?.category ?? null,
  };
};

export const useCategoryBySlug = (slug) => {
  const query = useQuery({
    queryKey: categoryKeys.slug(slug),
    queryFn: () => categoriesApi.getBySlug(slug),
    enabled: !!slug,
  });

  return {
    ...query,
    category: query.data?.category ?? null,
  };
};
