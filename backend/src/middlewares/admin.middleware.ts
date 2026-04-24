import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }

  next();
};
