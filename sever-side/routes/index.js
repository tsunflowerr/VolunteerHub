import express from 'express';
import adminRoutes from './adminRoutes.js';
import managerRoutes from './managerRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import eventRoutes from './eventRoutes.js';
import postRoutes from './postRoutes.js';
import commentRoutes from './commentRoutes.js';
import likeRoutes from './likeRoutes.js';
import registrationRoutes from './registrationRoutes.js';

const router = express.Router();

// ====== API Routes ======
router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/events', eventRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/registrations', registrationRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'VolunteerHub API is running',
        timestamp: new Date().toISOString()
    });
});

export default router;
