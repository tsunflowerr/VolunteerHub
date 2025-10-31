import express from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controller/user/userAuthController.js';
import { registerSchema, loginSchema } from '../validators/userValidator.js';
import { validate } from '../middleware/validate.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ====== Authentication Routes ======
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser); 
router.get('/me', authMiddleware, getCurrentUser); 

export default router;
