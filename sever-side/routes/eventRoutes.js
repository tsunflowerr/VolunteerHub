import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { 
    paginationSchema, 
    objectIdSchema, 
    eventIdSchema, 
    categorySlugSchema,
    userEventsQuerySchema 
} from '../validators/eventValidator.js';
import { createandUpdatePostSchema, eventPostParamsSchema } from '../validators/postValidator.js';
import { createAndUpdateCommentSchema, eventPostCommentParamsSchema } from '../validators/commentValidator.js';
import { getAllEvents, getEventById, getTrendingEvents, getEventsByCategorySlug, getUpcomingEvents, addBookMark, removeBookMark } from '../controller/public/eventController.js';
import { createPost, getAllPosts, updatePost, deletePost } from '../controller/public/postController.js';
import { addComment, replyComment, getCommentsByPost, updateComment, deleteComment } from '../controller/public/commentController.js';
import { likeEvent, likeComment, likePost } from '../controller/public/likeController.js';
import { registerEvent, unregisterEvent, getMyRegistrations, getRegistrationDetail } from '../controller/public/registrationsController.js';
import { 
    registerEventSchema, 
    unregisterEventSchema, 
    getMyRegistrationsSchema, 
    getRegistrationDetailSchema 
} from '../validators/registrationValidator.js';
const router = express.Router();

// ====== Public Event Routes ======
router.get('/', validate(paginationSchema, 'query'), getAllEvents);
router.get('/trending', validate(paginationSchema, 'query'), getTrendingEvents);
router.get('/upcoming', validate(paginationSchema, 'query'), getUpcomingEvents);
router.get('/category/:slug', validate(categorySlugSchema, 'params'), getEventsByCategorySlug);
router.get('/:id', validate(objectIdSchema, 'params'), getEventById);

// ====== User Event Routes (Requires Authentication) ======
// Note: These routes should ideally be in userRoutes, but kept here for event-related operations

router.post('/:eventId/bookmarks', authMiddleware, validate(eventIdSchema, 'params'), addBookMark);
router.delete('/:eventId/bookmarks', authMiddleware, validate(eventIdSchema, 'params'), removeBookMark);


// ====== Post Routes for Events ======
router.get('/:eventId/posts', validate(eventIdSchema, 'params'), getAllPosts);
router.post('/:eventId/posts', authMiddleware, validate(eventIdSchema, 'params'), validate(createandUpdatePostSchema), createPost);
router.put('/:eventId/posts/:postId', authMiddleware, validate(eventPostParamsSchema, 'params'), validate(createandUpdatePostSchema), updatePost);
router.delete('/:eventId/posts/:postId', authMiddleware, validate(eventPostParamsSchema, 'params'), deletePost);

// ====== Comment Routes for Posts ======
router.get('/:eventId/posts/:postId/comments', validate(eventPostParamsSchema, 'params'), getCommentsByPost);
router.post('/:eventId/posts/:postId/comments', authMiddleware, validate(eventPostParamsSchema, 'params'), validate(createAndUpdateCommentSchema), addComment);
router.post('/:eventId/posts/:postId/comments/:commentId/reply', authMiddleware, validate(eventPostCommentParamsSchema, 'params'), validate(createAndUpdateCommentSchema), replyComment);
router.put('/:eventId/posts/:postId/comments/:commentId', authMiddleware, validate(eventPostCommentParamsSchema, 'params'), validate(createAndUpdateCommentSchema), updateComment);
router.delete('/:eventId/posts/:postId/comments/:commentId', authMiddleware, validate(eventPostCommentParamsSchema, 'params'), deleteComment);

// ====== Like Routes for Events ======
router.post('/:eventId/like', authMiddleware, validate(eventIdSchema, 'params'), likeEvent);
router.post('/:eventId/posts/:postId/like', authMiddleware, validate(eventPostParamsSchema, 'params'), likePost);
router.post('/:eventId/posts/:postId/comments/:commentId/like', authMiddleware, validate(eventPostCommentParamsSchema, 'params'), likeComment);

// ====== Registration Routes for Events ======
router.post('/:eventId/register', authMiddleware, validate(registerEventSchema, 'params'), registerEvent);
router.delete('/:eventId/unregister', authMiddleware, validate(unregisterEventSchema, 'params'), unregisterEvent);

// ====== User Registration Management Routes ======
router.get('/registrations/my', authMiddleware, validate(getMyRegistrationsSchema, 'query'), getMyRegistrations);
router.get('/registrations/:registrationId', authMiddleware, validate(getRegistrationDetailSchema, 'params'), getRegistrationDetail);

export default router;
