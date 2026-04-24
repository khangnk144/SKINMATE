import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId } = req.user;

    const history = await prisma.analysisHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(history);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { userId } = req.user;

    const historyItem = await prisma.analysisHistory.findFirst({
      where: { id, userId },
    });

    if (!historyItem) {
      res.status(404).json({ error: 'History item not found' });
      return;
    }

    await prisma.analysisHistory.delete({
      where: { id },
    });

    res.status(200).json({ message: 'History item deleted' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAllHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId } = req.user;

    await prisma.analysisHistory.deleteMany({
      where: { userId },
    });

    res.status(200).json({ message: 'All history deleted' });
  } catch (error) {
    console.error('Delete all history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};