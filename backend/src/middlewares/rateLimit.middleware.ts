import rateLimit from 'express-rate-limit';
import { AuthRequest } from './auth.middleware';

export const analysisRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours window, can be changed depending on requirement
  max: async (req: AuthRequest) => {
    // Determine limit dynamically based on user role (for future "Pro" feature)
    if (req.user && req.user.role === 'PRO') {
      return 100; // Pro users get 100 calls
    }
    return 25; // Standard limit: 25 calls per user
  },
  keyGenerator: (req: AuthRequest) => {
    // Group requests by userId if authenticated, else IP address
    if (req.user && req.user.userId) {
      return req.user.userId;
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  message: {
    error: 'Bạn đã đạt giới hạn phân tích trong ngày. Vui lòng thử lại sau, hoặc nâng cấp tài khoản Pro để có nhiều lượt hơn!',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
