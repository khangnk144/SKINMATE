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

// Tat ca route ben duoi la admin API.
// Thu tu middleware quan trong: authMiddleware tao req.user, adminMiddleware moi kiem tra role.
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard stats: so lieu tong quan cho trang /admin.
router.get('/stats', adminController.getDashboardStats);

// Ingredients: CRUD thanh phan INCI nen, dung cho analysis va product.
router.get('/ingredients', adminController.getIngredients);
router.post('/ingredients', adminController.createIngredient);
router.delete('/ingredients/all', adminController.deleteAllIngredients);
router.put('/ingredients/:id', adminController.updateIngredient);
router.delete('/ingredients/:id', adminController.deleteIngredient);

// Rules: map ingredient + skinType -> GOOD/BAD/NEUTRAL.
router.get('/rules', adminController.getRules);
router.post('/rules', adminController.createRule);
router.delete('/rules/all', adminController.deleteAllRules);
router.delete('/rules/:id', adminController.deleteRule);

// AI suggestions: Gemini results wait here until admin approves official DB updates.
router.get('/ai-suggestions', adminController.getAiSuggestions);
router.post('/ai-suggestions/:id/approve', adminController.approveAiSuggestion);
router.post('/ai-suggestions/:id/reject', adminController.rejectAiSuggestion);

// Products: CRUD san pham va danh sach ingredient theo thu tu INCI.
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.delete('/products/all', adminController.deleteAllProducts);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Users: quan ly tai khoan, khoa/mo khoa va xoa user thuong.
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Reports: so lieu thong ke he thong cho trang bao cao admin.
router.get('/reports', adminController.getReports);

// Excel Export: tra file .xlsx de admin sao luu/lam mau import.
router.get('/export/ingredients', exportIngredientsExcel);
router.get('/export/rules', exportRulesExcel);
router.get('/export/products', exportProductsExcel);

// Excel Import: multer doc file vao memory, controller chuyen buffer cho excel.service.
router.post('/import/ingredients', excelUploadMiddleware, importIngredientsExcel);
router.post('/import/rules', excelUploadMiddleware, importRulesExcel);
router.post('/import/products', excelUploadMiddleware, importProductsExcel);

export default router;
