import { Router } from 'express';
import {
  createReport,
  voteReport,
  getPendingReports,
  getUserVote,
  resolveReport,
} from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// Report la dong gop cua user ve viec phan loai thanh phan, nen tat ca route can dang nhap.
router.use(authMiddleware);

// User routes: tao report, vote report, xem danh sach dang cho duyet.
router.post('/', createReport);
router.post('/vote', voteReport);
router.get('/pending', getPendingReports);
router.get('/vote/:reportId', getUserVote);

// Admin routes: resolve report co the cap nhat IngredientRule nen can them adminMiddleware.
router.post('/resolve', adminMiddleware, resolveReport);

export default router;
