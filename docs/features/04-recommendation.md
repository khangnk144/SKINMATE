# Feature 04 - Product Recommendations

> Last verified against code: June 1, 2026

## Backend

Files:

- `backend/src/routes/product.routes.ts`
- `backend/src/controllers/product.controller.ts`
- `backend/src/services/product.service.ts`

Endpoint:

- `GET /api/v1/products/recommendations`

The route requires auth. The controller reads the user's skin type from `req.user`, parses optional query `ingredients`, and passes both to the service.

Current service logic:

1. Fetch all products with ingredients and matching rules for the user's skin type.
2. Exclude any product with at least one `BAD` ingredient rule.
3. Score safe products by number of `GOOD` ingredient rules.
4. Sort by score.
5. Keep the top 6.
6. Shuffle that pool.
7. Return 3 products with `id`, `name`, `brand`, and `imageUrl`.

`contextIngredients` exists as a parameter but is not used in ranking yet.

## Frontend

Files:

- `frontend/src/app/analysis/page.tsx`
- `frontend/src/components/ProductCard.tsx`

Recommendations are shown as product cards after analysis flow.

## Tests

Relevant backend test:

- `backend/src/tests/product.service.test.ts`
