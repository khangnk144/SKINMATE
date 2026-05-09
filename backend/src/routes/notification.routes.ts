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

// All routes below require authentication
router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

// Admin only route to send messages
router.post('/send', adminMiddleware, sendAdminMessage);

export default router;
