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

const router = express.Router();

// Apply authMiddleware and managerMiddleware to all routes
router.use(authMiddleware, managerMiddleware);

// ====== Event Management Routes ======
// Áp dụng rate limiting cho event creation
router.post('/events', createLimiter, validate(createAndUpdateEventSchema), createEvent);
router.put('/events/:id', updateLimiter, validate(objectIdSchema, 'params'), validate(createAndUpdateEventSchema), updateEvent);
router.delete('/events/:id', deleteLimiter, validate(objectIdSchema, 'params'), deleteEvent);
router.get('/events', getEventsByManager); 
router.get('/stats/volunteers', getTotalConfirmedVolunteers); 

// ====== Registration Management Routes ======
router.patch('/registrations/:registrationId/status', updateLimiter, validate(getRegistrationDetailSchema, 'params'), validate(updateRegistrationStatusSchema), updateRegistrationStatus); 
router.get('/events/:eventId/volunteers', validate(eventIdSchema, 'params'), getVolunteersForEvent); 
router.get('/registrations', validate(getRegistrationsByStatusSchema, 'query'), getRegistrationsByStatus); 

export default router;
