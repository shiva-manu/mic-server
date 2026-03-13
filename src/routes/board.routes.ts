import { Router } from 'express';
import { getBoardMembers, createBoardMember, deleteBoardMember } from '../controllers/board.controller.js';
import { authenticate } from '../lib/auth.middleware.js';

const router = Router();

router.get('/', getBoardMembers);
router.post('/', authenticate, createBoardMember);
router.delete('/:id', authenticate, deleteBoardMember);

export default router;
