import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  getUserGamificationProfile,
  getAllAchievements,
  getAllLevels,
  getLeaderboard,
  getPointHistory,
  updateFeaturedAchievements,
  checkEventEligibility
} from '../controller/public/gamificationController.js';
import { updateFeaturedAchievementsSchema } from '../validators/gamificationValidator.js';
import { objectIdSchema, userIdSchema } from '../validators/eventValidator.js';

const router = express.Router();

// ====== Public Routes (with optional auth for personalized data) ======

/**
 * @swagger
 * /api/gamification/achievements:
 *   get:
 *     summary: Get all achievements
 *     tags: [Gamification]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [participation, milestone, special, category_master, streak]
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *           enum: [common, uncommon, rare, epic, legendary]
 *     responses:
 *       200:
 *         description: List of achievements
 */
router.get('/achievements', optionalAuthMiddleware, getAllAchievements);

/**
 * @swagger
 * /api/gamification/levels:
 *   get:
 *     summary: Get all levels
 *     tags: [Gamification]
 *     responses:
 *       200:
 *         description: List of levels
 */
router.get('/levels', getAllLevels);

/**
 * @swagger
 * /api/gamification/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Gamification]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [points, level, events]
 *           default: points
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', getLeaderboard);

// ====== Protected Routes (require authentication) ======

/**
 * @swagger
 * /api/gamification/profile:
 *   get:
 *     summary: Get current user's gamification profile
 *     tags: [Gamification]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's gamification profile
 */
router.get('/profile', authMiddleware, getUserGamificationProfile);

/**
 * @swagger
 * /api/gamification/profile/{userId}:
 *   get:
 *     summary: Get a user's gamification profile by ID
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's gamification profile
 */
router.get('/profile/:userId', validate(userIdSchema, 'params'), getUserGamificationProfile);

/**
 * @swagger
 * /api/gamification/history:
 *   get:
 *     summary: Get current user's point history
 *     tags: [Gamification]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
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
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [event_completed, achievement_earned, level_bonus, event_hosted, streak_bonus, admin_adjustment]
 *     responses:
 *       200:
 *         description: Point history
 */
router.get('/history', authMiddleware, getPointHistory);

/**
 * @swagger
 * /api/gamification/history/{userId}:
 *   get:
 *     summary: Get a user's point history by ID
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Point history
 */
router.get('/history/:userId', validate(userIdSchema, 'params'), getPointHistory);

/**
 * @swagger
 * /api/gamification/featured:
 *   put:
 *     summary: Update featured achievements on profile
 *     tags: [Gamification]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               achievementIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Featured achievements updated
 */
router.put(
  '/featured',
  authMiddleware,
  validate(updateFeaturedAchievementsSchema),
  updateFeaturedAchievements
);

/**
 * @swagger
 * /api/gamification/eligibility/{eventId}:
 *   get:
 *     summary: Check if user is eligible to register for an event
 *     tags: [Gamification]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Eligibility check result
 */
router.get(
  '/eligibility/:eventId',
  authMiddleware,
  checkEventEligibility
);

export default router;
