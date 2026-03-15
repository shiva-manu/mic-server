import { Router } from 'express';
import { createContact, getContacts, deleteContact } from '../controllers/contact.controller.js';
import { authenticate } from '../lib/auth.middleware.js';

const router = Router();

router.post('/', createContact);
router.get('/', authenticate, getContacts);
router.delete('/:id', authenticate, deleteContact);

export default router;
