# Feature 06 - Admin CRUD

> Last verified against code: June 1, 2026

## Backend

Files:

- `backend/src/routes/admin.routes.ts`
- `backend/src/controllers/admin.controller.ts`
- `backend/src/services/admin.service.ts`

All admin routes use router-level `authMiddleware` and `adminMiddleware`.

## Ingredients

Endpoints:

- `GET /api/v1/admin/ingredients`
- `POST /api/v1/admin/ingredients`
- `PUT /api/v1/admin/ingredients/:id`
- `DELETE /api/v1/admin/ingredients/all`
- `DELETE /api/v1/admin/ingredients/:id`

Names are normalized with `trim().toLowerCase()`. Duplicate names return conflict behavior in the controller.

## Rules

Endpoints:

- `GET /api/v1/admin/rules`
- `POST /api/v1/admin/rules`
- `DELETE /api/v1/admin/rules/all`
- `DELETE /api/v1/admin/rules/:id`

`POST /rules` validates `SkinType` and `SafetyEffect`, then creates or updates the unique `(ingredientId, skinType)` rule.

## Products

Endpoints:

- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/:id`
- `DELETE /api/v1/admin/products/all`
- `DELETE /api/v1/admin/products/:id`

Product create/update accepts `name`, `brand`, optional `imageUrl`, and optional `ingredientNames`. Unknown ingredients are auto-created. Updating a product replaces all `ProductIngredient` links.

## Pagination/Search

Ingredients, rules, products, and users support optional `page`, `limit`, and `search`.

If any list query param is present, response shape is `{ items, total, page, limit }`. Otherwise the legacy array response is returned.

## Frontend

Pages:

- `/admin/ingredients`
- `/admin/rules`
- `/admin/products`

## Tests

Relevant backend test:

- `backend/src/tests/admin.routes.test.ts`
