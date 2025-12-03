import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controller/admin/adminCategoryController.js';
import {
  getPendingEvents,
  updateStatusEvent,
  deleteEvent,
} from '../controller/admin/adminEventController.js';
import {
  exportUsersData,
  exportEvents,
} from '../controller/admin/adminExportController.js';
import {
  getAllUsersAndManagers,
  toggleUserLockStatus,
  createUser,
} from '../controller/admin/adminUserController.js';
import { categorySchema } from '../validators/categoryValidator.js';
import {
  objectIdSchema,
  updateEventStatusSchema,
} from '../validators/eventValidator.js';
import {
  userIdSchema,
  adminCreateUserSchema,
} from '../validators/userValidator.js';
import { validate } from '../middleware/validate.js';
import {
  createLimiter,
  uploadLimiter,
  updateLimiter,
  deleteLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply authMiddleware and adminMiddleware to all routes
router.use(authMiddleware, adminMiddleware);

// ====== Category Routes ======

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Environment"
 *               slug:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9]+$'
 *                 example: "environment"
 *               description:
 *                 type: string
 *                 example: "Environmental protection and conservation activities"
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post(
  '/categories',
  createLimiter,
  validate(categorySchema),
  createCategory
);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Environmental Protection"
 *               slug:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9]+$'
 *                 example: "environmentalprotection"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Category not found
 */
router.put(
  '/categories/:id',
  updateLimiter,
  validate(objectIdSchema, 'params'),
  validate(categorySchema),
  updateCategory
);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Category not found
 */
router.delete(
  '/categories/:id',
  deleteLimiter,
  validate(objectIdSchema, 'params'),
  deleteCategory
);

// ====== Event Routes ======

/**
 * @swagger
 * /api/admin/events/pending:
 *   get:
 *     summary: Get all pending events for approval (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending events
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
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/events/pending', getPendingEvents);

/**
 * @swagger
 * /api/admin/events/{id}/status:
 *   patch:
 *     summary: Update event status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, cancelled, completed]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Event status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Event not found
 */
router.patch(
  '/events/:id/status',
  updateLimiter,
  validate(objectIdSchema, 'params'),
  validate(updateEventStatusSchema),
  updateStatusEvent
);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   delete:
 *     summary: Delete an event (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Event not found
 */
router.delete(
  '/events/:id',
  deleteLimiter,
  validate(objectIdSchema, 'params'),
  deleteEvent
);

// ====== Export Routes ======

/**
 * @swagger
 * /api/admin/export/users:
 *   get:
 *     summary: Export all users data to CSV (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file with users data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       403:
 *         description: Forbidden - Admin role required
 */
// Áp dụng rate limiting cho export operations
router.get('/export/users', uploadLimiter, exportUsersData);

/**
 * @swagger
 * /api/admin/export/events:
 *   get:
 *     summary: Export all events data to CSV (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file with events data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/export/events', uploadLimiter, exportEvents);

// ====== User Management Routes ======

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users and managers (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/users', getAllUsersAndManagers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user with specified role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phoneNumber
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0123456789"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [user, manager]
 *                 example: "manager"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email or phone number already in use
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post(
  '/users',
  createLimiter,
  validate(adminCreateUserSchema),
  createUser
);

/**
 * @swagger
 * /api/admin/users/{userId}/lock:
 *   patch:
 *     summary: Lock/Unlock user account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to lock/unlock
 *     responses:
 *       200:
 *         description: User lock status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "User account locked successfully"
 *       404:
 *         description: User not found
 */
router.patch(
  '/users/:userId/lock',
  updateLimiter,
  validate(userIdSchema, 'params'),
  toggleUserLockStatus
);

export default router;
