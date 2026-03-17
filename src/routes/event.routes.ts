import { Router } from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller.js';
import { authenticate } from '../lib/auth.middleware.js';

const router = Router();

router.get('/', getEvents);
router.post('/', authenticate, createEvent);
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

export default router;
