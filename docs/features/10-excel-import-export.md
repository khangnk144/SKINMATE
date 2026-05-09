# Feature 10: Excel Import/Export & Bulk Data Management

> **Status: ✅ Implemented**

## 1. Overview

Administrators can bulk-manage the ingredient database by exporting data to Excel files and importing data from Excel files. This feature also provides "Delete All" functionality for each entity type.

## 2. Backend Implementation (`/backend`)

**Files:** `excel.controller.ts`, `excel.service.ts`

**Export Endpoints (`GET /api/v1/admin/export/{entity}`):**

| Entity | Endpoint | Columns |
|--------|----------|---------|
| Ingredients | `/export/ingredients` | ID, Name, Description |
| Rules | `/export/rules` | ID, Ingredient Name, Skin Type, Effect |
| Products | `/export/products` | ID, Name, Brand, Image URL, INCI String |

- Returns `.xlsx` files with proper column widths via `exceljs`.
- Uses `Content-Disposition: attachment` header for browser download.

**Import Endpoints (`POST /api/v1/admin/import/{entity}`):**

| Entity | Endpoint | Upsert Key |
|--------|----------|------------|
| Ingredients | `/import/ingredients` | Name (lowercase) |
| Rules | `/import/rules` | (Ingredient Name + Skin Type) |
| Products | `/import/products` | (Name + Brand) |

- File upload via `multer` (`multipart/form-data`, max 10 MB).
- Uses `xlsx` library for reading uploaded files.
- Upsert logic: creates new records, updates existing ones.
- Supports Vietnamese column values for rules (e.g., "DA DẦU" → OILY, "TỐT" → GOOD).
- Response: `{ created, updated, skipped, errors[] }`.

**Bulk Delete Endpoints (`DELETE /api/v1/admin/{entity}/all`):**
- `/ingredients/all` — cascades to rules and product-ingredient links.
- `/rules/all` — removes all safety rules.
- `/products/all` — cascades to product-ingredient links.

## 3. Frontend Implementation (`/frontend`)

**Page:** `/admin/import-export`

Three sections:
1. **Export:** One-click download cards for each entity type.
2. **Import:** Drag-and-drop file upload with progress indicator, result stats (created/updated/skipped), and collapsible error details.
3. **Danger Zone:** "Delete All" buttons with confirmation prompts for each entity type.

## 4. Dependencies

| Package | Purpose |
|---------|---------|
| `xlsx` | Reading uploaded `.xlsx` files |
| `exceljs` | Writing/generating `.xlsx` files with formatting |
| `multer` | Handling `multipart/form-data` file uploads |
