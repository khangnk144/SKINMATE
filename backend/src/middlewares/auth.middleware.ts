import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    skinType: string | null;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      skinType: decoded.skinType,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
