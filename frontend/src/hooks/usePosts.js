import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../api/posts';
import toast from 'react-hot-toast';

export const postKeys = {
  all: ['posts'],
  byEvent: (eventId) => [...postKeys.all, 'event', eventId],
  comments: (postId) => [...postKeys.all, 'comments', postId],
};

// --- Posts Hooks ---

export const useEventPosts = (eventId) => {
  return useQuery({
    queryKey: postKeys.byEvent(eventId),
    queryFn: () => postApi.getPostsByEvent(eventId),
    enabled: !!eventId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.createPost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      toast.success('Post created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.updatePost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update post');
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.deletePost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.likePost,
    onSuccess: (data, variables) => {
      // Invalidate posts list to reflect like count/status
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like post');
    },
  });
};

// --- Comments Hooks ---

export const usePostComments = (eventId, postId) => {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () => postApi.getCommentsByPost({ eventId, postId }),
    enabled: !!eventId && !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.addComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      // Also invalidate posts list if comment count is displayed there
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });
};

export const useReplyComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.replyComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      toast.success('Reply added');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reply');
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.updateComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      toast.success('Comment updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.deleteComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      // Invalidate posts to update comment count
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.likeComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like comment');
    },
  });
};
