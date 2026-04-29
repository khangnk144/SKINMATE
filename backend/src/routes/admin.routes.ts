import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import {
  exportIngredientsExcel,
  exportRulesExcel,
  exportProductsExcel,
  importIngredientsExcel,
  importRulesExcel,
  importProductsExcel,
  excelUploadMiddleware,
} from '../controllers/excel.controller';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Ingredients
router.get('/ingredients', adminController.getIngredients);
router.post('/ingredients', adminController.createIngredient);
router.put('/ingredients/:id', adminController.updateIngredient);
router.delete('/ingredients/:id', adminController.deleteIngredient);

// Rules
router.get('/rules', adminController.getRules);
router.post('/rules', adminController.createRule);
router.delete('/rules/:id', adminController.deleteRule);

// Products
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Reports
router.get('/reports', adminController.getReports);

// Excel Export
router.get('/export/ingredients', exportIngredientsExcel);
router.get('/export/rules', exportRulesExcel);
router.get('/export/products', exportProductsExcel);

// Excel Import
router.post('/import/ingredients', excelUploadMiddleware, importIngredientsExcel);
router.post('/import/rules', excelUploadMiddleware, importRulesExcel);
router.post('/import/products', excelUploadMiddleware, importProductsExcel);

export default router;
