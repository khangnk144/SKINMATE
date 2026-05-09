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

// Require auth for all report routes
router.use(authMiddleware);

// User routes
router.post('/', createReport);
router.post('/vote', voteReport);
router.get('/pending', getPendingReports);
router.get('/vote/:reportId', getUserVote);

// Admin routes
router.post('/resolve', adminMiddleware, resolveReport);

export default router;
