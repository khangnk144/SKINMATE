import { Router } from 'express';
import { checkAnalysis } from '../controllers/analysis.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { analysisRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Flow phan tich: xac thuc user -> kiem tra quota ngay -> controller goi service phan tich INCI.
router.post('/check', authMiddleware, analysisRateLimiter, checkAnalysis);

export default router;
