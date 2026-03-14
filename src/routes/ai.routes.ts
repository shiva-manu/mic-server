import { Router } from 'express';
import { chatWithAI } from '../controllers/ai.controller.js';

const router = Router();

router.post('/chat', chatWithAI);

export default router;
