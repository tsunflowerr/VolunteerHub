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
