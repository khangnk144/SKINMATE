import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendAdminMessage
} from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// Notification gan voi tung user, nen route ben duoi deu can auth.
router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

// Admin co the gui thong bao truc tiep den user.
router.post('/send', adminMiddleware, sendAdminMessage);

export default router;
