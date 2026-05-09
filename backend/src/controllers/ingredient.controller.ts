import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const searchIngredientByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = req.query.name as string;
    if (!name) {
      res.status(400).json({ error: 'Name query parameter is required' });
      return;
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { name: name.trim().toLowerCase() },
      select: { id: true, name: true }
    });

    if (!ingredient) {
      res.status(404).json({ error: 'Ingredient not found' });
      return;
    }

    res.status(200).json(ingredient);
  } catch (error) {
    console.error('Search ingredient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
