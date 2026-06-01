import { Router } from 'express';
import multer from 'multer';
import { extractIngredientsController } from './ocrController';

const router = Router();

// Multer doc anh upload vao RAM vi file chi can gui sang OCR API, khong luu tren server.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post('/ingredients', (req, res, next) => {
  // Bat loi upload o day de frontend luon nhan JSON thong nhat thay vi HTML error cua Express.
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
