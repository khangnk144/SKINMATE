import * as XLSX from 'xlsx';
import prisma from '../utils/prisma';
import { SkinType, SafetyEffect } from '@prisma/client';

// ─── EXPORT ────────────────────────────────────────────────────────────────

export const exportIngredients = async (): Promise<Buffer> => {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' },
  });

  const rows = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 60 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredients');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
};

export const exportRules = async (): Promise<Buffer> => {
  const rules = await prisma.ingredientRule.findMany({
    include: { ingredient: true },
    orderBy: { id: 'asc' },
  });

  const rows = rules.map((r) => ({
    rule_id: r.id,
    ingredient_id: r.ingredientId,
    ingredient_name: r.ingredient.name,
    skin_type: r.skinType,
    effect: r.effect,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 30 }, { wch: 14 }, { wch: 10 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rules');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
};

export const exportProducts = async (): Promise<Buffer> => {
  const products = await prisma.product.findMany({
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    image_url: p.imageUrl ?? '',
    ingredients_inci: p.ingredients.map((pi) => pi.ingredient.name).join(', '),
    created_at: p.createdAt.toISOString(),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 36 }, { wch: 30 }, { wch: 20 }, { wch: 40 }, { wch: 80 }, { wch: 24 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
};

// ─── IMPORT ────────────────────────────────────────────────────────────────

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export const importIngredients = async (fileBuffer: Buffer): Promise<ImportResult> => {
  const wb = XLSX.read(fileBuffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawName = row['name'];

    if (typeof rawName !== 'string' || !rawName.trim()) {
      result.errors.push(`Row ${i + 2}: "name" column is missing or empty.`);
      result.skipped++;
      continue;
    }

    const name = rawName.trim().toLowerCase();
    const description = typeof row['description'] === 'string' ? row['description'].trim() : undefined;

    try {
      const existing = await prisma.ingredient.findUnique({ where: { name } });
      if (existing) {
        // Update description if provided
        if (description !== undefined && description !== existing.description) {
          await prisma.ingredient.update({ where: { name }, data: { description } });
          result.updated++;
        } else {
          result.skipped++;
        }
      } else {
        await prisma.ingredient.create({ data: { name, description } });
        result.created++;
      }
    } catch (err: unknown) {
      result.errors.push(`Row ${i + 2} ("${name}"): ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped++;
    }
  }

  return result;
};

export const importRules = async (fileBuffer: Buffer): Promise<ImportResult> => {
  const wb = XLSX.read(fileBuffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  const validSkinTypes = Object.values(SkinType);
  const validEffects = Object.values(SafetyEffect);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Resolve ingredient — accept either ingredient_name or ingredient_id
    let ingredientId: number | null = null;

    const rawIngName = row['ingredient_name'];
    const rawIngId = row['ingredient_id'];

    if (typeof rawIngName === 'string' && rawIngName.trim()) {
      const normalizedName = rawIngName.trim().toLowerCase();
      const found = await prisma.ingredient.findUnique({ where: { name: normalizedName } });
      if (!found) {
        result.errors.push(`Row ${i + 2}: Ingredient "${normalizedName}" not found in database.`);
        result.skipped++;
        continue;
      }
      ingredientId = found.id;
    } else if (rawIngId !== undefined && !isNaN(Number(rawIngId))) {
      ingredientId = Number(rawIngId);
    } else {
      result.errors.push(`Row ${i + 2}: "ingredient_name" or "ingredient_id" is required.`);
      result.skipped++;
      continue;
    }

    const skinType = String(row['skin_type'] ?? '').trim().toUpperCase();
    const effect = String(row['effect'] ?? '').trim().toUpperCase();

    if (!validSkinTypes.includes(skinType as SkinType)) {
      result.errors.push(`Row ${i + 2}: Invalid skin_type "${skinType}". Must be one of: ${validSkinTypes.join(', ')}.`);
      result.skipped++;
      continue;
    }

    if (!validEffects.includes(effect as SafetyEffect)) {
      result.errors.push(`Row ${i + 2}: Invalid effect "${effect}". Must be one of: ${validEffects.join(', ')}.`);
      result.skipped++;
      continue;
    }

    try {
      const existing = await prisma.ingredientRule.findUnique({
        where: { ingredientId_skinType: { ingredientId, skinType: skinType as SkinType } },
      });

      if (existing) {
        if (existing.effect !== effect) {
          await prisma.ingredientRule.update({ where: { id: existing.id }, data: { effect: effect as SafetyEffect } });
          result.updated++;
        } else {
          result.skipped++;
        }
      } else {
        await prisma.ingredientRule.create({
          data: { ingredientId, skinType: skinType as SkinType, effect: effect as SafetyEffect },
        });
        result.created++;
      }
    } catch (err: unknown) {
      result.errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped++;
    }
  }

  return result;
};

export const importProducts = async (fileBuffer: Buffer): Promise<ImportResult> => {
  const wb = XLSX.read(fileBuffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = typeof row['name'] === 'string' ? row['name'].trim() : '';
    const brand = typeof row['brand'] === 'string' ? row['brand'].trim() : '';
    const imageUrl = typeof row['image_url'] === 'string' ? row['image_url'].trim() : undefined;
    const inciString = typeof row['ingredients_inci'] === 'string' ? row['ingredients_inci'] : '';

    if (!name || !brand) {
      result.errors.push(`Row ${i + 2}: "name" and "brand" columns are required.`);
      result.skipped++;
      continue;
    }

    // Parse ingredient names from INCI string
    const ingredientNames = inciString
      .split(',')
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s.length > 0);

    try {
      // Resolve/create ingredients
      const resolvedIds: number[] = [];
      for (const ingName of ingredientNames) {
        let ing = await prisma.ingredient.findUnique({ where: { name: ingName } });
        if (!ing) {
          ing = await prisma.ingredient.create({ data: { name: ingName } });
        }
        resolvedIds.push(ing.id);
      }

      // Check if product already exists by name + brand
      const existing = await prisma.product.findFirst({ where: { name, brand } });

      if (existing) {
        // Replace ingredients
        await prisma.productIngredient.deleteMany({ where: { productId: existing.id } });
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            imageUrl: imageUrl ?? existing.imageUrl,
            ingredients: {
              create: resolvedIds.map((id, index) => ({ ingredientId: id, position: index + 1 })),
            },
          },
        });
        result.updated++;
      } else {
        await prisma.product.create({
          data: {
            name,
            brand,
            imageUrl,
            ingredients: {
              create: resolvedIds.map((id, index) => ({ ingredientId: id, position: index + 1 })),
            },
          },
        });
        result.created++;
      }
    } catch (err: unknown) {
      result.errors.push(`Row ${i + 2} ("${name}"): ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped++;
    }
  }

  return result;
};
