import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { managerMiddleware } from '../middleware/managerMiddleware.js';
import { 
    getManagerDashboard, 
    getAdminDashboard 
} from '../controller/public/dashboardController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ====== Dashboard Routes ======

/**
 * @swagger
 * /api/dashboard/manager:
 *   get:
 *     summary: Get manager dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Manager dashboard data
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
 *                     totalEvents:
 *                       type: number
 *                     totalRegistrations:
 *                       type: number
 *                     pendingEvents:
 *                       type: number
 *                     recentEvents:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager role required
 */
// Áp dụng rate limiting cho dashboard queries
router.get('/manager', authMiddleware, managerMiddleware, apiLimiter, getManagerDashboard);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
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
 *                     userStatistics:
 *                       type: object
 *                       properties:
 *                         growth:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               week:
 *                                 type: number
 *                               year:
 *                                 type: number
 *                               count:
 *                                 type: number
 *                     eventStatistics:
 *                       type: object
 *                       properties:
 *                         byStatus:
 *                           type: object
 *                         byCategory:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               count:
 *                                 type: number
 *                         growth:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               week:
 *                                 type: number
 *                               year:
 *                                 type: number
 *                               count:
 *                                 type: number
 *                     registrationStatistics:
 *                       type: object
 *                     activityStatistics:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/admin', authMiddleware, adminMiddleware, apiLimiter, getAdminDashboard);

export default router;
