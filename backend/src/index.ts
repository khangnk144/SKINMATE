import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';

// Entry point cua backend Express.
// File nay chi khoi tao app, middleware chung va gan route vao prefix API.

// Load bien moi truong truoc khi import/ket noi cac service can process.env.
dotenv.config();

const app = express();
// Khi deploy sau proxy (Render/Vercel), Express can tin proxy dau tien
// de rate limiter doc dung IP nguoi dung thay vi IP cua proxy.
app.set('trust proxy', 1);
const port = process.env.PORT || 5000;

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import analysisRoutes from './routes/analysis.routes';
import productRoutes from './routes/product.routes';
import historyRoutes from './routes/history.routes';
import adminRoutes from './routes/admin.routes';
import reportRoutes from './routes/report.routes';
import ingredientRoutes from './routes/ingredient.routes';
import ocrRoutes from './modules/ocr/ocrRoutes';
import notificationRoutes from './routes/notification.routes';

// Middleware dung chung cho moi request:
// CORS cho frontend goi API, compression nen response, json parser gioi han payload.
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// Gom route theo domain nghiep vu. Frontend goi chu yeu qua /api/v1/*,
// rieng OCR dung /api/ocr vi module upload anh duoc tach rieng.
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ingredients', ingredientRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Root endpoint dung de kiem tra nhanh backend co chay hay khong.
app.get('/', (req: Request, res: Response) => {
  res.send('SKINMATE Backend API is running! Access /api/v1/health for status.');
});

// Health check cho frontend/devops. Khong can auth vi chi tra ve trang thai he thong.
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello World! Backend is up and running.',
    timestamp: new Date().toISOString(),
  });
});

// Start server sau khi toan bo middleware va route da duoc dang ky.
app.listen(port, () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
});
