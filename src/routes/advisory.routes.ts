import { Router } from 'express';
import { getAdvisoryMembers, createAdvisoryMember, deleteAdvisoryMember } from '../controllers/advisory.controller.js';
import { authenticate } from '../lib/auth.middleware.js';

const router = Router();

router.get('/', getAdvisoryMembers);
router.post('/', authenticate, createAdvisoryMember);
router.delete('/:id', authenticate, deleteAdvisoryMember);

export default router;
