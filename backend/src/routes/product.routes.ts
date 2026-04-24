import { Router } from 'express';
import { getRecommendations } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/recommendations', authMiddleware, getRecommendations);

export default router;
