import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { registerEvent, unregisterEvent } from '../controller/public/registrationsController.js';

const router = express.Router();

// Apply authMiddleware to all registration routes (protected)
router.use(authMiddleware);

// ====== Registration Routes ======
router.post('/events/:eventId/register', registerEvent);
router.delete('/events/:eventId/unregister', unregisterEvent);

export default router;
