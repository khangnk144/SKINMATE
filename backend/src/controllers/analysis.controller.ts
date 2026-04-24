import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { analyzeIngredients } from '../services/analysis.service';
import { SkinType } from '@prisma/client';
import prisma from '../utils/prisma';

export const checkAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inciString } = req.body;

    if (!inciString || typeof inciString !== 'string') {
      res.status(400).json({ error: 'inciString is required and must be a non-empty string' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Refresh skinType from DB to ensure it's up to date
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const skinType = user.skinType as SkinType | null;

    const results = await analyzeIngredients(inciString, skinType);
    
    // Optional: save to history
    await prisma.analysisHistory.create({
      data: {
        userId: user.id,
        rawInput: inciString,
      }
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
