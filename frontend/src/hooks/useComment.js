import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/comments';
import { postKeys } from './usePosts';
import toast from 'react-hot-toast';

export const commentKeys = {
  byPost: (postId) => [...postKeys.all, 'comments', postId],
};

export const usePostComments = (eventId, postId) => {
  return useQuery({
    queryKey: commentKeys.byPost(postId),
    queryFn: () => commentApi.getCommentsByPost({ eventId, postId }),
    enabled: !!eventId && !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.addComment,
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: commentKeys.byPost(newComment.postId) });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(commentKeys.byPost(newComment.postId));

      // Optimistically update to the new value
      queryClient.setQueryData(commentKeys.byPost(newComment.postId), (old) => {
        if (!old) return old;
        // Create a fake optimistic comment
        const optimisticComment = {
          _id: 'temp-' + Date.now(),
          content: newComment.content,
          author: {
            username: 'You', // Or get from AuthContext if available, but 'You' is fine for now
            avatar: '', // Fallback will handle it
          },
          likesCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          replies: []
        };
        return {
          ...old,
          comments: [optimisticComment, ...(old.comments || [])],
        };
      });

      // Return a context object with the snapshotted value
      return { previousComments };
    },
    onError: (err, newComment, context) => {
      queryClient.setQueryData(commentKeys.byPost(newComment.postId), context.previousComments);
      toast.error(err.response?.data?.message || 'Failed to add comment');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
      if (!error) toast.success('Comment added');
    },
  });
};

export const useReplyComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.replyComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
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
    mutationFn: commentApi.updateComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
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
    mutationFn: commentApi.deleteComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
      // Invalidate posts to update comment count
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
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
    mutationFn: commentApi.likeComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like comment');
    },
  });
};
