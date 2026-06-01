import { Router } from 'express';
import { searchIngredientByName } from '../controllers/ingredient.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Route tim ingredient theo ten phuc vu flow user bao cao phan loai sai.
router.use(authMiddleware);

router.get('/search', searchIngredientByName);

export default router;
