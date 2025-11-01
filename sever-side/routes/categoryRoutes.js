import express from 'express';
import { validate } from '../middleware/validate.js';
import { objectIdSchema } from '../validators/eventValidator.js';
import { getAllCategories, getCategoryById, getCategoryBySlug } from '../controller/public/categoryController.js';
import { categorySlugSchema } from '../validators/categoryValidator.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ====== Public Category Routes ======
// Áp dụng rate limiting cho public API
router.get('/', apiLimiter, getAllCategories); // Also supports ?slug=abc query
router.get('/slug/:slug', apiLimiter, validate(categorySlugSchema, 'params'), getCategoryBySlug); 
router.get('/:id', apiLimiter, validate(objectIdSchema, 'params'), getCategoryById);

export default router;
