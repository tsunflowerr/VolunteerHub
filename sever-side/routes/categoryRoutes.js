import express from 'express';
import { validate } from '../middleware/validate.js';
import { objectIdSchema } from '../validators/eventValidator.js';
import { getAllCategories, getCategoryById, getCategoryBySlug } from '../controller/public/categoryController.js';
import { categorySlugSchema } from '../validators/categoryValidator.js';

const router = express.Router();

// ====== Public Category Routes ======
router.get('/', getAllCategories); // Also supports ?slug=abc query
router.get('/slug/:slug', validate(categorySlugSchema, 'params'), getCategoryBySlug); 
router.get('/:id', validate(objectIdSchema, 'params'), getCategoryById);

export default router;
