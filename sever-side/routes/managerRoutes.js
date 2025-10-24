import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { managerMiddleware } from '../middleware/managerMiddleware.js';
import { createEvent, updateEvent, deleteEvent, getEventsByManager, getTotalConfirmedVolunteers } from '../controller/manager/managerEventController.js';
import { updateRegistrationStatus, getVolunteersForEvent, getRegistrationsByStatus } from '../controller/manager/managerRegistrationController.js';
import { validateEvent } from '../validators/eventValidator.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Apply authMiddleware and managerMiddleware to all routes
router.use(authMiddleware, managerMiddleware);

// ====== Event Management Routes ======
router.post('/events', validateEvent, validate, createEvent);
router.put('/events/:id', validateEvent, validate, updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/manager/:managerId', getEventsByManager);
router.get('/events/volunteers/total', getTotalConfirmedVolunteers);

// ====== Registration Management Routes ======
router.patch('/registrations/:registrationId/status', updateRegistrationStatus);
router.get('/registrations/event/:eventId/volunteers', getVolunteersForEvent);
router.get('/registrations/status/:status', getRegistrationsByStatus);

export default router;
