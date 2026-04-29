import { Router } from 'express';
import { checkAnalysis } from '../controllers/analysis.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { analysisRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/check', authMiddleware, analysisRateLimiter, checkAnalysis);

export default router;
