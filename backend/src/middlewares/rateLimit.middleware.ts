import rateLimit from 'express-rate-limit';
import { AuthRequest } from './auth.middleware';

export const analysisRateLimiter = rateLimit({
  // Gioi han rieng cho API phan tich vi day la flow co the ton chi phi/AI/DB.
  windowMs: 24 * 60 * 60 * 1000, // 24h window.
  skip: (req: AuthRequest) => {
    // Không giới hạn lượt call cho admin
    return req.user?.role === 'ADMIN';
  },
  max: async (req: AuthRequest) => {
    // Limit duoc tinh dong theo role de sau nay co the them goi Pro.
    if (req.user && req.user.role === 'PRO') {
      return 100;
    }
    return 25;
  },
  keyGenerator: (req: AuthRequest) => {
    // Neu da dang nhap thi dem theo userId, khong phu thuoc vao IP/dia diem mang.
    if (req.user && req.user.userId) {
      return req.user.userId;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  message: {
    error: 'Bạn đã đạt giới hạn phân tích trong ngày. Vui lòng thử lại sau, hoặc nâng cấp tài khoản Pro để có nhiều lượt hơn!',
  },
  standardHeaders: true, // Tra ve thong tin limit trong header RateLimit-*.
  legacyHeaders: false, // Tat header X-RateLimit-* cu.
});
