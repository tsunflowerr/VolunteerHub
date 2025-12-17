import api from './api';

export const postApi = {
  // Posts
  getPostsByEvent: async (eventId) => {
    const response = await api.get(`/events/${eventId}/posts`);
    return response.data;
  },

  createPost: async ({ eventId, data }) => {
    // data: { title, content, image: [] }
    const response = await api.post(`/events/${eventId}/posts`, data);
    return response.data;
  },

  updatePost: async ({ eventId, postId, data }) => {
    const response = await api.put(`/events/${eventId}/posts/${postId}`, data);
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

  // Comments
  getCommentsByPost: async ({ eventId, postId }) => {
    const response = await api.get(`/events/${eventId}/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async ({ eventId, postId, content }) => {
    const response = await api.post(`/events/${eventId}/posts/${postId}/comments`, { content });
    return response.data;
  },

  replyComment: async ({ eventId, postId, commentId, content }) => {
    const response = await api.post(`/events/${eventId}/posts/${postId}/comments/${commentId}/reply`, { content });
    return response.data;
  },

  updateComment: async ({ eventId, postId, commentId, content }) => {
    const response = await api.put(`/events/${eventId}/posts/${postId}/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async ({ eventId, postId, commentId }) => {
    const response = await api.delete(`/events/${eventId}/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  likeComment: async ({ eventId, postId, commentId }) => {
    const response = await api.post(`/events/${eventId}/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  },
};
