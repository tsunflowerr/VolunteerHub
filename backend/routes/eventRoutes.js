import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { 
    paginationSchema, 
    objectIdSchema, 
    eventIdSchema, 
    userEventsQuerySchema 
} from '../validators/eventValidator.js';
import { createandUpdatePostSchema, eventPostParamsSchema } from '../validators/postValidator.js';
import { createAndUpdateCommentSchema, eventPostCommentParamsSchema } from '../validators/commentValidator.js';
import { getAllEvents, getEventById, getTrendingEvents, getEventsByCategorySlug, getUpcomingEvents, addBookMark, removeBookMark } from '../controller/public/eventController.js';
import { createPost, getAllPosts, updatePost, deletePost, getSpecificPost, getAllMediaFromPost } from '../controller/public/postController.js';
import { addComment, replyComment, getCommentsByPost, updateComment, deleteComment } from '../controller/public/commentController.js';
import { likeEvent, likeComment, likePost } from '../controller/public/likeController.js';
import { registerEvent, unregisterEvent, getMyRegistrations, getRegistrationDetail } from '../controller/public/registrationsController.js';
import { 
    registerEventSchema, 
    unregisterEventSchema, 
    getMyRegistrationsSchema, 
    getRegistrationDetailSchema 
} from '../validators/registrationValidator.js';
import { categorySlugSchema } from '../validators/categoryValidator.js';
import { createLimiter, likeLimiter, bookmarkLimiter, registrationActionLimiter, updateLimiter, deleteLimiter } from '../middleware/rateLimiter.js';
import upload from '../middleware/uploadMiddleware.js';
const router = express.Router();

// Helper to map files to body for validation
const mapFilesToBody = (req, res, next) => {
    let images = [];
    
    // Handle existing images passed as text (could be string or array of strings)
    if (req.body.image) {
        if (Array.isArray(req.body.image)) {
            images = [...req.body.image];
        } else {
            images = [req.body.image];
        }
    }

    // Append new uploaded files
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.path);
        images = [...images, ...newImages];
    }

    // Update req.body.image only if we have images or if we need to clear it (empty array)
    // Note: If no images at all, we might want to set it to [] if the intent is to clear, 
    // or undefined if we want to ignore (but Joi might require it).
    // For update, if we send explicit empty array, it clears.
    // For create, it defaults to [].
    if (images.length > 0 || req.body.image !== undefined) {
         req.body.image = images;
    } else {
        // If nothing sent, default to [] for Create, but for Update we might want to skip?
        // But the validator expects an array if present.
        // Let's default to [] to be safe for Create. 
        // For Update, if undefined, the controller ignores it.
        // But mapFilesToBody runs before controller.
        // If we set it to [], updatePost will clear images.
        // So we should only set it if req.files existed or req.body.image existed.
        if (req.method === 'POST') {
             req.body.image = [];
        }
    }
    
    next();
};

// ====== Public Event Routes ======

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with pagination
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 */
router.get('/', validate(paginationSchema, 'query'), getAllEvents);

/**
 * @swagger
 * /api/events/trending:
 *   get:
 *     summary: Get trending events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of trending events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/trending', validate(paginationSchema, 'query'), getTrendingEvents);

/**
 * @swagger
 * /api/events/upcoming:
 *   get:
 *     summary: Get upcoming events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of upcoming events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/upcoming', validate(paginationSchema, 'query'), getUpcomingEvents);

/**
 * @swagger
 * /api/events/category/{slug}:
 *   get:
 *     summary: Get events by category slug
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: List of events in category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/category/:slug', validate(categorySlugSchema, 'params'), getEventsByCategorySlug);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate(objectIdSchema, 'params'), getEventById);

// ====== User Event Routes (Requires Authentication) ======
// Note: These routes should ideally be in userRoutes, but kept here for event-related operations

/**
 * @swagger
 * /api/events/{eventId}/bookmarks:
 *   post:
 *     summary: Add event to bookmarks
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event bookmarked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Remove event from bookmarks
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Bookmark removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/:eventId/bookmarks', authMiddleware, bookmarkLimiter, validate(eventIdSchema, 'params'), addBookMark);
router.delete('/:eventId/bookmarks', authMiddleware, bookmarkLimiter, validate(eventIdSchema, 'params'), removeBookMark);


// ====== Post Routes for Events ======

/**
 * @swagger
 * /api/events/{eventId}/posts:
 *   get:
 *     summary: Get all posts for an event
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *   post:
 *     summary: Create a new post for an event
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My volunteer experience"
 *               content:
 *                 type: string
 *                 example: "Today was an amazing day helping the community..."
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:eventId/posts', optionalAuthMiddleware, validate(eventIdSchema, 'params'), getAllPosts);
// Get specific post
router.get('/:eventId/posts/:postId', optionalAuthMiddleware, validate(eventPostParamsSchema, 'params'), getSpecificPost);
// Get all media from event posts
router.get('/:eventId/media', optionalAuthMiddleware, validate(eventIdSchema, 'params'), getAllMediaFromPost);
// Áp dụng rate limiting cho create, update và delete operations
router.post('/:eventId/posts', authMiddleware, createLimiter, validate(eventIdSchema, 'params'), upload.array('image', 5), mapFilesToBody, validate(createandUpdatePostSchema), createPost);

/**
 * @swagger
 * /api/events/{eventId}/posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated post title"
 *               content:
 *                 type: string
 *                 example: "Updated content..."
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/image1.jpg"]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this post
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this post
 */
router.put('/:eventId/posts/:postId', authMiddleware, updateLimiter, validate(eventPostParamsSchema, 'params'), upload.array('image', 5), mapFilesToBody, validate(createandUpdatePostSchema), updatePost);
router.delete('/:eventId/posts/:postId', authMiddleware, deleteLimiter, validate(eventPostParamsSchema, 'params'), deletePost);

// ====== Comment Routes for Posts ======

/**
 * @swagger
 * /api/events/{eventId}/posts/{postId}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       content:
 *                         type: string
 *                       author:
 *                         type: object
 *                       post:
 *                         type: string
 *                       parentComment:
 *                         type: string
 *                       likesCount:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Great post! Thanks for sharing."
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/:eventId/posts/:postId/comments', optionalAuthMiddleware, validate(eventPostParamsSchema, 'params'), getCommentsByPost);
// Áp dụng rate limiting cho comment operations
router.post('/:eventId/posts/:postId/comments', authMiddleware, createLimiter, validate(eventPostParamsSchema, 'params'), validate(createAndUpdateCommentSchema), addComment);

/**
 * @swagger
 * /api/events/{eventId}/posts/{postId}/comments/{commentId}/reply:
 *   post:
 *     summary: Reply to a comment
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent comment ID to reply to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "I agree with you!"
 *     responses:
 *       201:
 *         description: Reply added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.post('/:eventId/posts/:postId/comments/:commentId/reply', authMiddleware, createLimiter, validate(eventPostCommentParamsSchema, 'params'), validate(createAndUpdateCommentSchema), replyComment);

/**
 * @swagger
 * /api/events/{eventId}/posts/{postId}/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment text"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not authorized to update this comment
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not authorized to delete this comment
 */
router.put('/:eventId/posts/:postId/comments/:commentId', authMiddleware, updateLimiter, validate(eventPostCommentParamsSchema, 'params'), validate(createAndUpdateCommentSchema), updateComment);
router.delete('/:eventId/posts/:postId/comments/:commentId', authMiddleware, deleteLimiter, validate(eventPostCommentParamsSchema, 'params'), deleteComment);

// ====== Like Routes for Events ======

/**
 * @swagger
 * /api/events/{eventId}/like:
 *   post:
 *     summary: Like/Unlike an event
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to like
 *     responses:
 *       200:
 *         description: Event liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Event liked successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                       description: Whether the event is now liked
 *       401:
 *         description: Unauthorized
 */
router.post('/:eventId/like', authMiddleware, likeLimiter, validate(eventIdSchema, 'params'), likeEvent);

/**
 * @swagger
 * /api/events/{eventId}/posts/{postId}/like:
 *   post:
 *     summary: Like/Unlike a post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID to like
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 */
router.post('/:eventId/posts/:postId/like', authMiddleware, likeLimiter, validate(eventPostParamsSchema, 'params'), likePost);

/**
 * @swagger
 * /api/events/{eventId}/posts/{postId}/comments/{commentId}/like:
 *   post:
 *     summary: Like/Unlike a comment
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID to like
 *     responses:
 *       200:
 *         description: Comment liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 */
router.post('/:eventId/posts/:postId/comments/:commentId/like', authMiddleware, likeLimiter, validate(eventPostCommentParamsSchema, 'params'), likeComment);

// ====== Registration Routes for Events ======

/**
 * @swagger
 * /api/events/{eventId}/register:
 *   post:
 *     summary: Register for an event
 *     tags: [Registrations]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to register for
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Already registered or event is full
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:eventId/register', authMiddleware, registrationActionLimiter, validate(registerEventSchema, 'params'), registerEvent);

/**
 * @swagger
 * /api/events/{eventId}/unregister:
 *   delete:
 *     summary: Unregister from an event
 *     tags: [Registrations]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to unregister from
 *     responses:
 *       200:
 *         description: Unregistered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Registration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:eventId/unregister', authMiddleware, registrationActionLimiter, validate(unregisterEventSchema, 'params'), unregisterEvent);

// ====== User Registration Management Routes ======

/**
 * @swagger
 * /api/events/registrations/my:
 *   get:
 *     summary: Get current user's event registrations
 *     tags: [Registrations]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter by registration status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of user's registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Registration'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/registrations/my', authMiddleware, validate(getMyRegistrationsSchema, 'query'), getMyRegistrations);

/**
 * @swagger
 * /api/events/registrations/{registrationId}:
 *   get:
 *     summary: Get registration details by ID
 *     tags: [Registrations]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Registration'
 *       404:
 *         description: Registration not found
 */
router.get('/registrations/:registrationId', authMiddleware, validate(getRegistrationDetailSchema, 'params'), getRegistrationDetail);

export default router;
