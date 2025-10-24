import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addComment, replyComment, getCommentsByPost, updateComment, deleteComment } from '../controller/public/commentController.js';
import { validateComment } from '../validators/commentValidator.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// ====== Comment Routes ======
// Public: Get comments for a post
router.get('/events/:eventId/posts/:postId/comments', getCommentsByPost);

// Protected: Add, reply, update, delete comments (requires authentication)
router.post('/events/:eventId/posts/:postId/comments', authMiddleware, validateComment, validate, addComment);
router.post('/events/:eventId/posts/:postId/comments/:commentId/reply', authMiddleware, validateComment, validate, replyComment);
router.put('/comments/:commentId', authMiddleware, validateComment, validate, updateComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);

export default router;
