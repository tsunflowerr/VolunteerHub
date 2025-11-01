import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { updateUserProfile as updateUserProfileSchema, changePasswordSchema } from '../validators/userValidator.js';
import { objectIdSchema } from '../validators/eventValidator.js';
import { getUserProfile, updateUserProfile, deleteUser, changePassword, getUserById, getUserBookMarks, } from '../controller/user/userProfileController.js';
import { passwordResetLimiter, updateLimiter, deleteLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();

// Apply authMiddleware to all user routes (protected)
router.use(authMiddleware);

// ====== User Profile Routes ======
router.get('/profile', getUserProfile);
router.put('/profile', updateLimiter, validate(updateUserProfileSchema), updateUserProfile);
router.delete('/profile', deleteLimiter, deleteUser);
router.put('/profile/password', passwordResetLimiter, validate(changePasswordSchema), changePassword);

// ====== User Bookmarks Routes ======
router.get('/bookmarks', getUserBookMarks);

// ====== Public User Info ======
router.get('/:id', validate(objectIdSchema, 'params'), getUserById);

export default router;
