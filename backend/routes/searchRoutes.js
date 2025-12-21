import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { eventSearchSchema, userSearchSchema, postSearchSchema, advancedSearchSchema } from '../validators/searchValidator.js';
import { searchEvents, searchUsers, searchPosts, advancedSearch } from '../controller/public/searchController.js';
import { objectIdSchema } from '../validators/eventValidator.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ====== Public Search Routes ======

/**
 * @swagger
 * /api/search/events:
 *   get:
 *     summary: Search for events
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "volunteer"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events starting from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events ending before this date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled, completed]
 *         description: Filter by event status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [relevance, newest, upcoming, popular, trending]
 *           default: newest
 *         description: Sort order (relevance only works with keyword search)
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
 *         description: Search results
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
 */
// Áp dụng rate limiting cho search endpoints
router.get('/events', searchLimiter, validate(eventSearchSchema, 'query'), searchEvents);

/**
 * @swagger
 * /api/search/users:
 *   get:
 *     summary: Search for users (Admin only)
 *     tags: [Search]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for user name or email
 *         example: "john"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, manager, admin]
 *         description: Filter by user role
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
 *         description: User search results
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/users', searchLimiter, authMiddleware, adminMiddleware, validate(userSearchSchema, 'query'), searchUsers);

/**
 * @swagger
 * /api/search/events/{eventId}/posts:
 *   get:
 *     summary: Search posts within an event
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for post title or content
 *         example: "experience"
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
 *         description: Post search results
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
 */
router.get('/events/:eventId/posts', searchLimiter, validate(objectIdSchema, 'params'), validate(postSearchSchema, 'query'), searchPosts);

/**
 * @swagger
 * /api/search/advanced:
 *   get:
 *     summary: Advanced search across multiple resources
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "environment"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [events, posts, users, all]
 *           default: all
 *         description: Type of resources to search
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
 *         description: Advanced search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 */
router.get('/advanced', searchLimiter, validate(advancedSearchSchema, 'query'), advancedSearch);

export default router;
