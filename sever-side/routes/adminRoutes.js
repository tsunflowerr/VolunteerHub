import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { createCategory,  updateCategory } from '../controller/admin/adminCategoryController.js';
import { getPendingEvents, updateStatusEvent, deleteEvent } from '../controller/admin/adminEventController.js';
import { exportUsersData, exportEvents } from '../controller/admin/adminExportController.js';
import { getAllUsersAndManagers, toggleUserLockStatus } from '../controller/admin/adminUserController.js';
import { categorySchema } from '../validators/categoryValidator.js';
import { objectIdSchema, updateEventStatusSchema } from '../validators/eventValidator.js';
import { userIdSchema } from '../validators/userValidator.js';
import { validate } from '../middleware/validate.js';
import { createLimiter, uploadLimiter, updateLimiter, deleteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply authMiddleware and adminMiddleware to all routes
router.use(authMiddleware, adminMiddleware);

// ====== Category Routes ======
router.post('/categories', createLimiter, validate(categorySchema), createCategory);
router.put('/categories/:id', updateLimiter, validate(objectIdSchema, 'params'), validate(categorySchema), updateCategory);

// ====== Event Routes ======
router.get('/events/pending', getPendingEvents);
router.patch('/events/:id/status', updateLimiter, validate(objectIdSchema, 'params'), validate(updateEventStatusSchema), updateStatusEvent);
router.delete('/events/:id', deleteLimiter, validate(objectIdSchema, 'params'), deleteEvent);

// ====== Export Routes ======
// Áp dụng rate limiting cho export operations
router.get('/export/users', uploadLimiter, exportUsersData);
router.get('/export/events', uploadLimiter, exportEvents);

// ====== User Management Routes ======
router.get('/users', getAllUsersAndManagers);
router.patch('/users/:userId/lock', updateLimiter, validate(userIdSchema, 'params'), toggleUserLockStatus);

export default router;
