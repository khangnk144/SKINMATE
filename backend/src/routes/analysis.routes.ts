import { Router } from 'express';
import { checkAnalysis } from '../controllers/analysis.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/check', authMiddleware, checkAnalysis);

export default router;
