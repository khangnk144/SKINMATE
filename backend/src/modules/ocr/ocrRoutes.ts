import { Router } from 'express';
import multer from 'multer';
import { extractIngredientsController } from './ocrController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post('/ingredients', (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Image file is too large', ingredients: '' });
      }
      return res.status(400).json({ error: 'Invalid image upload', ingredients: '' });
    }
    return next();
  });
}, extractIngredientsController as any);

export default router;
