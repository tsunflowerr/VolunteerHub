import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createPost, getAllPosts, updatePost, deletePost } from '../controller/public/postController.js';
import { validatePost } from '../validators/postValidator.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// ====== Post Routes ======
// Public: Get all posts for an event
router.get('/events/:eventId/posts', getAllPosts);

// Protected: Create, update, delete posts (requires authentication)
router.post('/events/:eventId/posts', authMiddleware, validatePost, validate, createPost);
router.put('/events/:eventId/posts/:postId', authMiddleware, validatePost, validate, updatePost);
router.delete('/events/:eventId/posts/:postId', authMiddleware, deletePost);

export default router;
