import { Router } from 'express';
import multer from 'multer';
import { extractIngredientsController } from './ocrController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/ingredients', upload.single('file'), extractIngredientsController as any);

export default router;
