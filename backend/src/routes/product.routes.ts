import { Router } from 'express';
import { getRecommendations } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Recommendation can skinType cua user trong JWT, nen route nay bat buoc dang nhap.
router.get('/recommendations', authMiddleware, getRecommendations);

export default router;
