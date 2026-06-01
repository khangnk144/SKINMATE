import { Request, Response } from 'express';
import multer from 'multer';
import {
  exportIngredients,
  exportRules,
  exportProducts,
  importIngredients,
  importRules,
  importProducts,
} from '../services/excel.service';

// Multer luu file Excel vao memory vi service chi can buffer de parse, khong can ghi disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

export const excelUploadMiddleware = upload.single('file');

// EXPORT handlers: service tao workbook buffer, controller set header de browser tai file.

// ─── EXPORT handlers ──────────────────────────────────────────────────────

export const exportIngredientsExcel = async (_req: Request, res: Response): Promise<void> => {
  try {
    const buffer = await exportIngredients();
    const filename = `skinmate_ingredients_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error: unknown) {
    res.status(500).json({ error: 'Failed to export ingredients' });
  }
};

export const exportRulesExcel = async (_req: Request, res: Response): Promise<void> => {
  try {
    const buffer = await exportRules();
    const filename = `skinmate_rules_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error: unknown) {
    res.status(500).json({ error: 'Failed to export rules' });
  }
};

export const exportProductsExcel = async (_req: Request, res: Response): Promise<void> => {
  try {
    const buffer = await exportProducts();
    const filename = `skinmate_products_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error: unknown) {
    res.status(500).json({ error: 'Failed to export products' });
  }
};

// ─── IMPORT handlers ──────────────────────────────────────────────────────

export const importIngredientsExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    // Neu multer khong tim thay field "file", frontend da gui sai FormData.
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const result = await importIngredients(req.file.buffer);
    res.json({ success: true, result });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import ingredients' });
  }
};

export const importRulesExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    // Moi import handler truyen buffer sang service rieng theo entity.
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const result = await importRules(req.file.buffer);
    res.json({ success: true, result });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import rules' });
  }
};

export const importProductsExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ket qua import tra ve created/updated/skipped/errors de UI hien thong ke sau upload.
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const result = await importProducts(req.file.buffer);
    res.json({ success: true, result });
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import products' });
  }
};
