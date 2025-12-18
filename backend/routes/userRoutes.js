import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  updateUserProfile as updateUserProfileSchema,
  changePasswordSchema,
} from '../validators/userValidator.js';
import { objectIdSchema } from '../validators/eventValidator.js';
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  changePassword,
  getUserById,
  getUserBookMarks,
  savePushSubscription,
  deletePushSubscription,
} from '../controller/user/userProfileController.js';
import {
  passwordResetLimiter,
  updateLimiter,
  deleteLimiter,
} from '../middleware/rateLimiter.js';
import upload from '../middleware/uploadMiddleware.js';
import { pushSubscriptionSchema } from '../validators/userValidator.js';

const router = express.Router();

// Helper to map file path to body for validation
const mapFileToBody = (req, res, next) => {
    if (req.file) {
        req.body.avatar = req.file.path;
    } else if (typeof req.body.avatar === 'object' && req.body.avatar !== null) {
        // Sanitize: If avatar is an object (e.g. {}), remove it so Joi ignores it
        delete req.body.avatar;
    }
    next();
};

// Apply authMiddleware to all user routes (protected)
router.use(authMiddleware);

// ====== User Profile Routes ======

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phone_number
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *               location:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 100
 *               about:
 *                 type: string
 *                 maxLength: 500
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/profile',
  updateLimiter,
  upload.single('avatar'),
  mapFileToBody,
  validate(updateUserProfileSchema),
  updateUserProfile
);

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.delete('/profile', deleteLimiter, deleteUser);

/**
 * @swagger
 * /api/users/profile/password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
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
 *               - current_password
 *               - new_password
 *               - confirm_new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 example: oldpassword123
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newpassword123
 *               confirm_new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Current password is incorrect or passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/profile/password',
  passwordResetLimiter,
  validate(changePasswordSchema),
  changePassword
);

// ====== User Bookmarks Routes ======

/**
 * @swagger
 * /api/users/bookmarks:
 *   get:
 *     summary: Get user's bookmarked events
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarked events
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
 */
router.get('/bookmarks', getUserBookMarks);

// ====== Push Notification Routes ======

/**
 * @swagger
 * /api/users/push-subscription:
 *   post:
 *     summary: Save web push subscription
 *     tags: [Users]
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
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       200:
 *         description: Subscription saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/push-subscription',
  validate(pushSubscriptionSchema),
  savePushSubscription
);

/**
 * @swagger
 * /api/users/push-subscription:
 *   delete:
 *     summary: Remove web push subscription
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription removed successfully
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
 */
router.delete('/push-subscription', deletePushSubscription);

// ====== Public User Info ======

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (public info)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User public information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate(objectIdSchema, 'params'), getUserById);

export default router;
