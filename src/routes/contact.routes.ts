import { Router } from 'express';
import { createContact, getContacts, deleteContact } from '../controllers/contact.controller.js';
import { authenticateQuery } from '../lib/auth.js';

const router = Router();

router.post('/', createContact);
router.get('/', authenticateQuery, getContacts);
router.delete('/:id', authenticateQuery, deleteContact);

export default router;
