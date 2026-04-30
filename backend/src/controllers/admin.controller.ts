import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { SkinType, SafetyEffect } from '@prisma/client';

export const adminController = {
  getIngredients: async (req: Request, res: Response): Promise<void> => {
    try {
      const ingredients = await adminService.getIngredients();
      res.json(ingredients);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
  },

  createIngredient: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Ingredient name is required' });
        return;
      }
      
      const ingredient = await adminService.createIngredient(name, description);
      res.status(201).json(ingredient);
    } catch (error: any) {
      if (error.message === 'Ingredient already exists') {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to create ingredient' });
    }
  },

  updateIngredient: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, description } = req.body;
      
      if (isNaN(id) || !name) {
        res.status(400).json({ error: 'Invalid ID or name missing' });
        return;
      }

      const ingredient = await adminService.updateIngredient(id, name, description);
      res.json(ingredient);
    } catch (error: any) {
      if (error.message === 'Another ingredient with this name already exists') {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to update ingredient' });
    }
  },

  deleteIngredient: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }

      await adminService.deleteIngredient(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete ingredient' });
    }
  },

  deleteAllIngredients: async (req: Request, res: Response): Promise<void> => {
    try {
      await adminService.deleteAllIngredients();
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete all ingredients' });
    }
  },

  createRule: async (req: Request, res: Response): Promise<void> => {
    try {
      const { ingredientId, skinType, effect } = req.body;
      
      if (!ingredientId || !skinType || !effect) {
        res.status(400).json({ error: 'ingredientId, skinType, and effect are required' });
        return;
      }

      if (!Object.values(SkinType).includes(skinType as SkinType)) {
        res.status(400).json({ error: 'Invalid SkinType' });
        return;
      }

      if (!Object.values(SafetyEffect).includes(effect as SafetyEffect)) {
        res.status(400).json({ error: 'Invalid SafetyEffect' });
        return;
      }

      const rule = await adminService.createOrUpdateRule(ingredientId, skinType as SkinType, effect as SafetyEffect);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create rule' });
    }
  },

  getRules: async (req: Request, res: Response): Promise<void> => {
    try {
      const rules = await adminService.getRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch rules' });
    }
  },

  deleteRule: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
      }
      await adminService.deleteRule(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete rule' });
    }
  },

  deleteAllRules: async (req: Request, res: Response): Promise<void> => {
    try {
      await adminService.deleteAllRules();
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete all rules' });
    }
  },

  createProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, brand, imageUrl, ingredientNames } = req.body;
      
      if (!name || !brand) {
        res.status(400).json({ error: 'Name and brand are required' });
        return;
      }

      const product = await adminService.createProduct(name, brand, imageUrl, ingredientNames);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  getProducts: async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await adminService.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  updateProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const { name, brand, imageUrl, ingredientNames } = req.body;
      
      if (!name || !brand) {
        res.status(400).json({ error: 'Name and brand are required' });
        return;
      }

      const product = await adminService.updateProduct(id, name, brand, imageUrl, ingredientNames);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  deleteProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      await adminService.deleteProduct(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  deleteAllProducts: async (req: Request, res: Response): Promise<void> => {
    try {
      await adminService.deleteAllProducts();
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete all products' });
    }
  },

  getUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await adminService.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  toggleUserStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const user = await adminService.toggleUserStatus(id);
      res.json(user);
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to toggle user status' });
    }
  },

  deleteUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      await adminService.deleteUser(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  getReports: async (req: Request, res: Response): Promise<void> => {
    try {
      const reports = await adminService.getReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }
};
