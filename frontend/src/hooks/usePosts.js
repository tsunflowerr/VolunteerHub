import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { postApi } from '../api/posts';
import { notificationKeys } from './useNotifications';
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
    onMutate: async (variables) => {
      const { eventId, postId } = variables;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.byEvent(eventId) });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(postKeys.byEvent(eventId));

      // Optimistically remove the post from list
      queryClient.setQueryData(postKeys.byEvent(eventId), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((post) => post._id !== postId),
          })),
        };
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.byEvent(variables.eventId), context.previousPosts);
      }
      toast.error(err.response?.data?.message || 'Failed to delete post');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: postKeys.media(variables.eventId) });
      if (!error) toast.success('Post deleted successfully');
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.likePost,
    onMutate: async (variables) => {
      const { eventId, postId } = variables;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.byEvent(eventId) });
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot previous values
      const previousPosts = queryClient.getQueryData(postKeys.byEvent(eventId));
      const previousPost = queryClient.getQueryData(postKeys.detail(postId));

      // Optimistically update posts list (for infinite query)
      queryClient.setQueryData(postKeys.byEvent(eventId), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likesCount: post.isLiked
                      ? Math.max(0, (post.likesCount || 0) - 1)
                      : (post.likesCount || 0) + 1,
                  }
                : post
            ),
          })),
        };
      });

      // Optimistically update post detail
      queryClient.setQueryData(postKeys.detail(postId), (old) => {
        if (!old || !old.post) return old;
        return {
          ...old,
          post: {
            ...old.post,
            isLiked: !old.post.isLiked,
            likesCount: old.post.isLiked
              ? Math.max(0, (old.post.likesCount || 0) - 1)
              : (old.post.likesCount || 0) + 1,
          },
        };
      });

      return { previousPosts, previousPost };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.byEvent(variables.eventId), context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(variables.postId), context.previousPost);
      }
      toast.error(err.response?.data?.message || 'Failed to like post');
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
      // Invalidate notifications for the post author to see like notification
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
