import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getUserProfile, updateUserProfile, deleteUser, changePassword, getUserById, getUserBookMarks, addRemoveBookMark } from '../controller/user/userProfileController.js';

const router = express.Router();

// Apply authMiddleware to all user routes (protected)
router.use(authMiddleware);

// ====== User Profile Routes ======
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/profile', deleteUser);
router.put('/profile/password', changePassword);

// ====== User Bookmarks Routes ======
router.get('/bookmarks', getUserBookMarks);
router.post('/bookmarks', addRemoveBookMark);

// ====== Public User Info ======
router.get('/:id', getUserById);

export default router;
