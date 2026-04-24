import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as productService from '../services/product.service';
import { SkinType } from '@prisma/client';

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const skinType = req.user?.skinType;

    if (!skinType) {
      res.status(400).json({ error: 'Skin type is not defined for this user. Please update your profile.' });
      return;
    }

    const ingredients = req.query.ingredients
      ? (req.query.ingredients as string).split(',').map((i) => i.trim())
      : [];

    const products = await productService.getSafeRecommendations(skinType as SkinType, ingredients);

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
