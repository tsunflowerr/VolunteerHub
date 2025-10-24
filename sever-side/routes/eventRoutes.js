import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllEvents, getEventById, getTrendingEvents, getEventsByCategorySlug, getUpcommingEvents, getUserEvents, addRemoveBookMark, getUserBookMarks } from '../controller/public/eventController.js';

const router = express.Router();

// ====== Public Event Routes ======
router.get('/', getAllEvents);
router.get('/trending', getTrendingEvents);
router.get('/upcoming', getUpcommingEvents);
router.get('/category/:slug', getEventsByCategorySlug);
router.get('/:id', getEventById);

// ====== User Event Routes (Requires Authentication) ======
router.get('/user/events', authMiddleware, getUserEvents);
router.post('/:eventId/bookmark', authMiddleware, addRemoveBookMark);
router.get('/user/bookmarks', authMiddleware, getUserBookMarks);

export default router;
