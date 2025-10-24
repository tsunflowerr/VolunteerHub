import express from 'express';
import { registerUser, loginUser } from '../controller/user/userAuthController.js';
import { validateUser } from '../validators/userValidator.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// ====== Authentication Routes ======
router.post('/register', validateUser, validate, registerUser);
router.post('/login', loginUser);

export default router;
