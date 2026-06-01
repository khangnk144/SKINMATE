import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Moi endpoint trong file nay deu la thao tac tren ho so cua user dang dang nhap.
// Dat authMiddleware o dau router de controller co req.user.userId.
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

export default router;
