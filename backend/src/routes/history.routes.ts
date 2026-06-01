import { Router } from 'express';
import { getHistory, deleteHistory, deleteAllHistory } from '../controllers/history.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// History luu raw INCI theo tung user, nen moi thao tac deu phai qua authMiddleware.
router.get('/', authMiddleware, getHistory);
router.delete('/:id', authMiddleware, deleteHistory);
router.delete('/', authMiddleware, deleteAllHistory);

export default router;
