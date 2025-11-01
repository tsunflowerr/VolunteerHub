import express from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controller/user/userAuthController.js';
import { registerSchema, loginSchema } from '../validators/userValidator.js';
import { validate } from '../middleware/validate.js';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { authLimiter, registrationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ====== Authentication Routes ======
// Áp dụng rate limiting nghiêm ngặt cho registration
router.post('/register', registrationLimiter, validate(registerSchema), registerUser);

// Áp dụng rate limiting cho login để chống brute force
router.post('/login', authLimiter, validate(loginSchema), loginUser);

router.post('/logout', logoutUser); 
router.get('/me', authMiddleware, getCurrentUser); 

export default router;
