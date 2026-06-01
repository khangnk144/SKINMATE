import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  // Sau khi JWT hop le, middleware gan user vao req de controller/service biet ai dang goi API.
  user?: {
    userId: string;
    role: string;
    skinType: string | null;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Backend yeu cau header dang "Authorization: Bearer <jwt>" cho cac route can dang nhap.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

  try {
    // Token payload duoc tao trong auth.service.ts; chi lay nhung field can cho request hien tai.
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      skinType: decoded.skinType,
    };
    next();
  } catch (error) {
    // Token het han, sai secret hoac bi sua deu di vao nhanh nay.
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
