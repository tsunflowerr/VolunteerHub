import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { managerMiddleware } from '../middleware/managerMiddleware.js';
import { createEvent, updateEvent, deleteEvent, getEventsByManager, getTotalConfirmedVolunteers } from '../controller/manager/managerEventController.js';
import { updateRegistrationStatus, getVolunteersForEvent, getRegistrationsByStatus } from '../controller/manager/managerRegistrationController.js';
import { createAndUpdateEventSchema, objectIdSchema, eventIdSchema } from '../validators/eventValidator.js';
import { 
    getRegistrationDetailSchema, 
    updateRegistrationStatusSchema, 
    getRegistrationsByStatusSchema 
} from '../validators/registrationValidator.js';
import { validate } from '../middleware/validate.js';
import { createLimiter, updateLimiter, deleteLimiter } from '../middleware/rateLimiter.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Helper to map file path to body for validation
const mapFileToBody = (req, res, next) => {
    if (req.file) {
        req.body.thumbnail = req.file.path;
    } else if (typeof req.body.thumbnail === 'object' && req.body.thumbnail !== null) {
         // Sanitize: If thumbnail is an object (e.g. {}), remove it so Joi ignores it
        delete req.body.thumbnail;
    }
    next();
};

// Apply authMiddleware and managerMiddleware to all routes
router.use(authMiddleware, managerMiddleware);

// ====== Event Management Routes ======

/**
 * @swagger
 * /api/manager/events:
 *   post:
 *     summary: Create a new event (Manager only)
 *     tags: [Manager]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - location
 *               - startDate
 *               - endDate
 *               - categories
 *               - capacity
 *               - thumbnail
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               activities:
 *                 type: string
 *               prepare:
 *                 type: string
 *               capacity:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager role required
 */
// Áp dụng rate limiting cho event creation
router.post('/events', createLimiter, upload.single('thumbnail'), mapFileToBody, validate(createAndUpdateEventSchema), createEvent);
router.get('/events', getEventsByManager);

/**
 * @swagger
 * /api/manager/events/{id}:
 *   put:
 *     summary: Update an event (Manager only)
 *     tags: [Manager]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               capacity:
 *                 type: number
 *               categories:
 *                 type: array
 *               activities:
 *                 type: string
 *               prepare:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Not authorized to update this event
 *       404:
 *         description: Event not found
 */
router.put('/events/:id', updateLimiter, validate(objectIdSchema, 'params'), upload.single('thumbnail'), mapFileToBody, validate(createAndUpdateEventSchema), updateEvent);

router.delete('/events/:id', deleteLimiter, validate(objectIdSchema, 'params'), deleteEvent);

/**
 * @swagger
 * /api/manager/stats/volunteers:
 *   get:
 *     summary: Get total confirmed volunteers for manager's events
 *     tags: [Manager]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total confirmed volunteers statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalConfirmedVolunteers:
 *                       type: number
 */
router.get('/stats/volunteers', getTotalConfirmedVolunteers); 

// ====== Registration Management Routes ======

/**
 * @swagger
 * /api/manager/registrations/{registrationId}/status:
 *   patch:
 *     summary: Update registration status (Manager only)
 *     tags: [Manager]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, completed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Registration status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not authorized to update this registration
 *       404:
 *         description: Registration not found
 */
router.patch('/registrations/:registrationId/status', updateLimiter, validate(getRegistrationDetailSchema, 'params'), validate(updateRegistrationStatusSchema), updateRegistrationStatus);

/**
 * @swagger
 * /api/manager/events/{eventId}/volunteers:
 *   get:
 *     summary: Get all volunteers for a specific event (Manager only)
 *     tags: [Manager]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of volunteers registered for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Registration'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             $ref: '#/components/schemas/User'
 *       403:
 *         description: Not authorized to view this event's volunteers
 *       404:
 *         description: Event not found
 */
router.get('/events/:eventId/volunteers', validate(eventIdSchema, 'params'), getVolunteersForEvent);

/**
 * @swagger
 * /api/manager/registrations:
 *   get:
 *     summary: Get registrations by status for manager's events
 *     tags: [Manager]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter by registration status
 *         example: pending
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of registrations filtered by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Registration'
 *                 pagination:
 *                   type: object
 */
router.get('/registrations', validate(getRegistrationsByStatusSchema, 'query'), getRegistrationsByStatus); 

export default router;
