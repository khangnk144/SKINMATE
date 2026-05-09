import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render/Vercel) for rate limiting IP
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

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('SKINMATE Backend API is running! Access /api/v1/health for status.');
});

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Hello World! Backend is up and running.',
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
});
