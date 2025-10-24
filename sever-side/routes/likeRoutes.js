import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { likeEvent, likePost, likeComment 
} from '../controller/public/likeController.js';

const router = express.Router();

// Apply authMiddleware to all like routes (protected)
router.use(authMiddleware);

// ====== Like Routes ======
router.post('/events/:eventId/like', likeEvent);
router.post('/posts/:postId/like', likePost);
router.post('/comments/:commentId/like', likeComment);

export default router;
