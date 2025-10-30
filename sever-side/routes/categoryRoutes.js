import express from 'express';
import { getAllCategories, getCategoryById, getCategoryBySlug } from '../controller/public/categoryController.js';

const router = express.Router();

// ====== Public Category Routes ======
router.get('/', getAllCategories); // Also supports ?slug=abc query
router.get('/slug/:slug', getCategoryBySlug); // Must be BEFORE /:id to avoid conflict
router.get('/:id', getCategoryById);

export default router;
