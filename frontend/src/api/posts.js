import api from './api';

export const postApi = {
  // Posts
  getPostsByEvent: async (eventId, { pageParam = 1 } = {}) => {
    const response = await api.get(`/events/${eventId}/posts`, {
      params: { page: pageParam, limit: 10 },
    });
    return response.data;
  },

  getPost: async ({ eventId, postId }) => {
    const response = await api.get(`/events/${eventId}/posts/${postId}`);
    return response.data;
  },

  getEventMedia: async (eventId) => {
    const response = await api.get(`/events/${eventId}/media`);
    return response.data;
  },

  createPost: async ({ eventId, data }) => {
    // data: { title, content, image: [] } or FormData
    const isFormData = data instanceof FormData;
    const response = await api.post(
      `/events/${eventId}/posts`,
      data,
      isFormData
        ? {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        : {}
    );
    return response.data;
  },

  updatePost: async ({ eventId, postId, data }) => {
    const isFormData = data instanceof FormData;
    const response = await api.put(
      `/events/${eventId}/posts/${postId}`,
      data,
      isFormData
        ? {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        : {}
    );
    return response.data;
  },

  deletePost: async ({ eventId, postId }) => {
    const response = await api.delete(`/events/${eventId}/posts/${postId}`);
    return response.data;
  },

  likePost: async ({ eventId, postId }) => {
    const response = await api.post(`/events/${eventId}/posts/${postId}/like`);
    return response.data;
  },
};
