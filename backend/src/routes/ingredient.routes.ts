import { Router } from 'express';
import { searchIngredientByName } from '../controllers/ingredient.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/search', searchIngredientByName);

export default router;
