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

const router = express.Router();

// Apply authMiddleware and adminMiddleware to all routes
router.use(authMiddleware, adminMiddleware);

// ====== Category Routes ======
router.post('/categories', validate(categorySchema), createCategory);
router.put('/categories/:id', validate(objectIdSchema, 'params'), validate(categorySchema), updateCategory);

// ====== Event Routes ======
router.get('/events/pending', getPendingEvents);
router.patch('/events/:id/status', validate(objectIdSchema, 'params'), validate(updateEventStatusSchema), updateStatusEvent);
router.delete('/events/:id', validate(objectIdSchema, 'params'), deleteEvent);

// ====== Export Routes ======
router.get('/export/users', exportUsersData);
router.get('/export/events', exportEvents);

// ====== User Management Routes ======
router.get('/users', getAllUsersAndManagers);
router.patch('/users/:userId/lock', validate(userIdSchema, 'params'), toggleUserLockStatus);

export default router;
