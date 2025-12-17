import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { postApi } from '../api/posts';
import toast from 'react-hot-toast';

export const postKeys = {
  all: ['posts'],
  byEvent: (eventId) => [...postKeys.all, 'event', eventId],
  detail: (postId) => [...postKeys.all, 'detail', postId],
  media: (eventId) => [...postKeys.all, 'media', eventId],
  comments: (postId) => [...postKeys.all, 'comments', postId],
};

// --- Posts Hooks ---

export const useEventPosts = (eventId) => {
  return useInfiniteQuery({
    queryKey: postKeys.byEvent(eventId),
    queryFn: ({ pageParam }) => postApi.getPostsByEvent(eventId, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    enabled: !!eventId,
  });
};

export const usePost = (eventId, postId) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postApi.getPost({ eventId, postId }),
    enabled: !!eventId && !!postId,
  });
};

export const useEventMedia = (eventId) => {
  return useQuery({
    queryKey: postKeys.media(eventId),
    queryFn: () => postApi.getEventMedia(eventId),
    enabled: !!eventId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.createPost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: postKeys.media(variables.eventId) });
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
      queryClient.invalidateQueries({ queryKey: postKeys.media(variables.eventId) });
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
      queryClient.invalidateQueries({ queryKey: postKeys.media(variables.eventId) });
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
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like post');
    },
  });
};
