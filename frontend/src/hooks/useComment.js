import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/comments';
import { postKeys } from './usePosts';
import { notificationKeys } from './useNotifications';
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

// Helper function to find and update a comment recursively in nested structure
const findAndUpdateComment = (comments, commentId, updateFn) => {
  return comments.map(comment => {
    if (comment._id === commentId) {
      return updateFn(comment);
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: findAndUpdateComment(comment.replies, commentId, updateFn)
      };
    }
    return comment;
  });
};

// Helper function to find a comment recursively and add a reply to it
const findAndAddReply = (comments, parentId, newReply) => {
  return comments.map(comment => {
    if (comment._id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply]
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: findAndAddReply(comment.replies, parentId, newReply)
      };
    }
    return comment;
  });
};

// Helper function to delete a comment recursively
const findAndDeleteComment = (comments, commentId) => {
  return comments
    .filter(comment => comment._id !== commentId)
    .map(comment => {
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: findAndDeleteComment(comment.replies, commentId)
        };
      }
      return comment;
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
            username: 'You',
            avatar: '',
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
      // Invalidate notifications for the post author to see new comment notification
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      if (!error) toast.success('Comment added');
    },
  });
};

export const useReplyComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.replyComment,
    onMutate: async (variables) => {
      const { postId, commentId, content } = variables;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.byPost(postId) });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(commentKeys.byPost(postId));

      // Optimistically update
      queryClient.setQueryData(commentKeys.byPost(postId), (old) => {
        if (!old) return old;
        
        const optimisticReply = {
          _id: 'temp-reply-' + Date.now(),
          content: content,
          author: {
            username: 'You',
            avatar: '',
          },
          likesCount: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          replies: [],
          parentComment: commentId
        };

        return {
          ...old,
          comments: findAndAddReply(old.comments || [], commentId, optimisticReply)
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(commentKeys.byPost(variables.postId), context.previousComments);
      toast.error(err.response?.data?.message || 'Failed to reply');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
      // Invalidate notifications for the comment author to see reply notification
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      if (!error) toast.success('Reply added');
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.updateComment,
    onMutate: async (variables) => {
      const { postId, commentId, content } = variables;
      
      await queryClient.cancelQueries({ queryKey: commentKeys.byPost(postId) });
      const previousComments = queryClient.getQueryData(commentKeys.byPost(postId));

      // Optimistically update the comment content
      queryClient.setQueryData(commentKeys.byPost(postId), (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: findAndUpdateComment(old.comments || [], commentId, (comment) => ({
            ...comment,
            content: content
          }))
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(commentKeys.byPost(variables.postId), context.previousComments);
      toast.error(err.response?.data?.message || 'Failed to update comment');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
      if (!error) toast.success('Comment updated');
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.deleteComment,
    onMutate: async (variables) => {
      const { postId, commentId } = variables;
      
      await queryClient.cancelQueries({ queryKey: commentKeys.byPost(postId) });
      const previousComments = queryClient.getQueryData(commentKeys.byPost(postId));

      // Optimistically remove the comment
      queryClient.setQueryData(commentKeys.byPost(postId), (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: findAndDeleteComment(old.comments || [], commentId)
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(commentKeys.byPost(variables.postId), context.previousComments);
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.byEvent(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
      if (!error) toast.success('Comment deleted');
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.likeComment,
    onMutate: async (variables) => {
      const { postId, commentId } = variables;
      
      await queryClient.cancelQueries({ queryKey: commentKeys.byPost(postId) });
      const previousComments = queryClient.getQueryData(commentKeys.byPost(postId));

      // Optimistically toggle like status
      queryClient.setQueryData(commentKeys.byPost(postId), (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: findAndUpdateComment(old.comments || [], commentId, (comment) => ({
            ...comment,
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked 
              ? Math.max(0, (comment.likesCount || 0) - 1)
              : (comment.likesCount || 0) + 1
          }))
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(commentKeys.byPost(variables.postId), context.previousComments);
      toast.error(err.response?.data?.message || 'Failed to like comment');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) });
    },
  });
};
