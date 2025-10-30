import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllEvents, getEventById, getTrendingEvents, getEventsByCategorySlug, getUpcommingEvents, getUserEvents, addBookMark, removeBookMark } from '../controller/public/eventController.js';
import { createPost, getAllPosts, updatePost, deletePost } from '../controller/public/postController.js';
import { addComment, replyComment, getCommentsByPost, updateComment, deleteComment } from '../controller/public/commentController.js';
import { likeEvent, likeComment, likePost } from '../controller/public/likeController.js';
import { registerEvent, unregisterEvent } from '../controller/public/registrationsController.js';
const router = express.Router();

// ====== Public Event Routes ======
router.get('/', getAllEvents);
router.get('/trending', getTrendingEvents);
router.get('/upcoming', getUpcommingEvents);
router.get('/category/:slug', getEventsByCategorySlug);
router.get('/:id', getEventById);

// ====== User Event Routes (Requires Authentication) ======
// Note: These routes should ideally be in userRoutes, but kept here for event-related operations
router.get('/my-events', authMiddleware, getUserEvents); // Changed from /user/events to /my-events
router.post('/:eventId/bookmarks', authMiddleware, addBookMark); // RESTful: resource/id/action
router.delete('/:eventId/bookmarks', authMiddleware, removeBookMark);


// ====== Post Routes for Events ======
router.get('/:eventId/posts', getAllPosts);
router.post('/:eventId/posts', authMiddleware, createPost);
router.put('/:eventId/posts/:postId', authMiddleware, updatePost);
router.delete('/:eventId/posts/:postId', authMiddleware, deletePost);

// ====== Comment Routes for Posts ======
router.get('/:eventId/posts/:postId/comments', getCommentsByPost);
router.post('/:eventId/posts/:postId/comments', authMiddleware, addComment);
router.post('/:eventId/posts/:postId/comments/:commentId/reply', authMiddleware, replyComment);
router.put('/:eventId/posts/:postId/comments/:commentId', authMiddleware, updateComment);
router.delete('/:eventId/posts/:postId/comments/:commentId', authMiddleware, deleteComment);

// ====== Like Routes for Events ======
router.post('/:eventId/like', authMiddleware, likeEvent);
router.post('/:eventId/posts/:postId/like', authMiddleware, likePost);
router.post('/:eventId/posts/:postId/comments/:commentId/like', authMiddleware, likeComment);

// ====== Registration Routes for Events ======
router.post('/:eventId/register', authMiddleware, registerEvent);
router.delete('/:eventId/unregister', authMiddleware, unregisterEvent);

export default router;
