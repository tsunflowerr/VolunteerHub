import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { validate } from '../middleware/validate.js';
import { eventSearchSchema, userSearchSchema, postSearchSchema, advancedSearchSchema } from '../validators/searchValidator.js';
import { searchEvents, searchUsers, searchPosts, advancedSearch } from '../controller/public/searchController.js';
import { objectIdSchema } from '../validators/eventValidator.js';

const router = express.Router();

// ====== Public Search Routes ======
router.get('/events', validate(eventSearchSchema, 'query'), searchEvents);
router.get('/users', authMiddleware, adminMiddleware, validate(userSearchSchema, 'query'), searchUsers);
router.get('/events/:eventId/posts', validate(objectIdSchema, 'params'), validate(postSearchSchema, 'query'), searchPosts);
router.get('/advanced', validate(advancedSearchSchema, 'query'), advancedSearch);

export default router;
