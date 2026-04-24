import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

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

export default router;
