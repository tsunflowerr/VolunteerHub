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
// Áp dụng rate limiting cho dashboard queries
router.get('/manager', authMiddleware, managerMiddleware, apiLimiter, getManagerDashboard);
router.get('/admin', authMiddleware, adminMiddleware, apiLimiter, getAdminDashboard);

export default router;
