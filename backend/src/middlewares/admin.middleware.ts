import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Middleware nay phai chay sau authMiddleware vi no doc req.user.
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }

  // Chi ADMIN moi duoc vao khu vuc quan tri: CRUD du lieu nen, user, import/export.
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }

  next();
};
