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
// Áp dụng rate limiting cho search endpoints
router.get('/events', searchLimiter, validate(eventSearchSchema, 'query'), searchEvents);
router.get('/users', searchLimiter, authMiddleware, adminMiddleware, validate(userSearchSchema, 'query'), searchUsers);
router.get('/events/:eventId/posts', searchLimiter, validate(objectIdSchema, 'params'), validate(postSearchSchema, 'query'), searchPosts);
router.get('/advanced', searchLimiter, validate(advancedSearchSchema, 'query'), advancedSearch);

export default router;
