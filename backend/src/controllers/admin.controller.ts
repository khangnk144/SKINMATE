import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { SkinType, SafetyEffect } from '@prisma/client';

// Chuyen query string page/limit/search thanh object dung chung cho cac list API.
// Neu frontend khong gui query, service tra ve mang cu de giu tuong thich voi code cu/test cu.
const getListQuery = (req: Request) => {
  const hasListQuery = req.query.page || req.query.limit || req.query.search;
  if (!hasListQuery) return undefined;

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  return {
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
  };
};

export const adminController = {
  getIngredients: async (req: Request, res: Response): Promise<void> => {
    try {
      const ingredients = await adminService.getIngredients(getListQuery(req));
      res.json(ingredients);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
  },

  createIngredient: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description } = req.body;
      // name la khoa unique cua Ingredient, service se normalize lowercase truoc khi luu.
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
      
      // id tu URL la string nen phai parse/validate truoc khi goi Prisma.
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
      
      // Rule la quan he ingredient + skinType -> effect, ca 3 field deu bat buoc.
      if (!ingredientId || !skinType || !effect) {
        res.status(400).json({ error: 'ingredientId, skinType, and effect are required' });
        return;
      }

      // Validate enum o controller de service chi nhan du lieu dung schema.
      if (!Object.values(SkinType).includes(skinType as SkinType)) {
        res.status(400).json({ error: 'Invalid SkinType' });
        return;
      }

      if (!Object.values(SafetyEffect).includes(effect as SafetyEffect)) {
        res.status(400).json({ error: 'Invalid SafetyEffect' });
        return;
      }

      // Upsert theo unique ingredientId_skinType: them moi neu chua co, cap nhat neu da ton tai.
      const rule = await adminService.createOrUpdateRule(ingredientId, skinType as SkinType, effect as SafetyEffect);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create rule' });
    }
  },

  getRules: async (req: Request, res: Response): Promise<void> => {
    try {
      const rules = await adminService.getRules(getListQuery(req));
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
      
      // ingredientNames co the rong; service se tu tao Ingredient moi neu ten INCI chua co.
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
      const products = await adminService.getProducts(getListQuery(req));
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

      // Update product thay the toan bo danh sach ProductIngredient de giu dung thu tu INCI moi.
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
      const users = await adminService.getUsers(getListQuery(req));
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  toggleUserStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      // Toggle isActive de khoa/mo khoa dang nhap ma khong xoa du lieu cua user.
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

  getDashboardStats: async (req: Request, res: Response): Promise<void> => {
    try {
      // Tra ve cac count doc lap cho KPI cards tren dashboard admin.
      const stats = await adminService.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
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
