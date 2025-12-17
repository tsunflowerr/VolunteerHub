import api from './api';

export const commentApi = {
  // Comments
  getCommentsByPost: async ({ eventId, postId }) => {
    const response = await api.get(
      `/events/${eventId}/posts/${postId}/comments`
    );
    return response.data;
  },

  addComment: async ({ eventId, postId, content }) => {
    const response = await api.post(
      `/events/${eventId}/posts/${postId}/comments`,
      { content }
    );
    return response.data;
  },

  replyComment: async ({ eventId, postId, commentId, content }) => {
    const response = await api.post(
      `/events/${eventId}/posts/${postId}/comments/${commentId}/reply`,
      { content }
    );
    return response.data;
  },

  updateComment: async ({ eventId, postId, commentId, content }) => {
    const response = await api.put(
      `/events/${eventId}/posts/${postId}/comments/${commentId}`,
      { content }
    );
    return response.data;
  },

  deleteComment: async ({ eventId, postId, commentId }) => {
    const response = await api.delete(
      `/events/${eventId}/posts/${postId}/comments/${commentId}`
    );
    return response.data;
  },

  likeComment: async ({ eventId, postId, commentId }) => {
    const response = await api.post(
      `/events/${eventId}/posts/${postId}/comments/${commentId}/like`
    );
    return response.data;
  },
};
