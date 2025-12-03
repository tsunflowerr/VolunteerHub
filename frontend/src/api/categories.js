import api from './api';

export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const getCategoryBySlug = async (slug) => {
  const response = await api.get(`/categories/slug/${slug}`);
  return response.data;
};
