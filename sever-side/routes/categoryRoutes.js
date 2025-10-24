import express from 'express';
import { getAllCategories, getCategoryById, getCategoryBySlug } from '../controller/public/categoryController.js';

const router = express.Router();

// ====== Public Category Routes ======
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

export default router;
