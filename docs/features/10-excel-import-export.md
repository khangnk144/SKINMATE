# Feature 10 - Excel Import And Export

> Last verified against code: June 1, 2026

## Files

- `backend/src/controllers/excel.controller.ts`
- `backend/src/services/excel.service.ts`
- `backend/src/routes/admin.routes.ts`
- `frontend/src/app/admin/import-export/page.tsx`

## Backend Endpoints

All endpoints require admin.

Exports:

- `GET /api/v1/admin/export/ingredients`
- `GET /api/v1/admin/export/rules`
- `GET /api/v1/admin/export/products`

Imports:

- `POST /api/v1/admin/import/ingredients`
- `POST /api/v1/admin/import/rules`
- `POST /api/v1/admin/import/products`

Upload field name is `file`; upload limit is 10 MB.

## Implementation

The service currently uses `xlsx` to read and write workbooks. The backend package also includes `exceljs`, but this service does not use it.

## Import Rules

Ingredients:

- Required column: `name`.
- Optional column: `description`.
- Existing ingredients are updated only when description changes.

Rules:

- Accepts `ingredient_name` or `ingredient_id`.
- Requires `skin_type` and `effect`.
- Supports English enum values and several Vietnamese labels as coded in the mapping table.
- Creates or updates the unique `(ingredientId, skinType)` rule.

Products:

- Required columns: `name`, `brand`.
- Optional: `image_url`, `ingredients_inci`.
- Existing product match is `name + brand`.
- Existing product ingredients are replaced.

## Response

Imports return:

```json
{
  "success": true,
  "result": {
    "created": 0,
    "updated": 0,
    "skipped": 0,
    "errors": []
  }
}
```
