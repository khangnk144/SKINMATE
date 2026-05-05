# Feature 06: Admin Dashboard & CRUD Operations

> **Status: ✅ Implemented**

## 1. Overview

The admin panel allows users with the `ADMIN` role to manage the core data driving the analysis engine: Ingredients, Safety Rules, and Products. It is the only way to update the database without writing raw SQL.

## 2. Backend Implementation (`/backend`)

**Middleware Stack (applied to ALL `/api/v1/admin/*` routes):**
1. `authMiddleware` — validates JWT token.
2. `adminMiddleware` — checks `req.user.role === 'ADMIN'`. Returns `403 Forbidden` if not admin.

**Ingredient Endpoints (`/api/v1/admin/ingredients`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/ingredients` | List all ingredients, ordered alphabetically |
| `POST` | `/ingredients` | Create new ingredient. Name auto-normalized to lowercase. Returns 409 if duplicate. |
| `PUT` | `/ingredients/:id` | Update name/description. Checks for duplicate name conflicts. |
| `DELETE` | `/ingredients/:id` | Deletes ingredient. Cascades to rules and product-ingredient links. |
| `DELETE` | `/ingredients/all` | Deletes ALL ingredients. Cascades to all rules and product-ingredient links. |

**Rule Endpoints (`/api/v1/admin/rules`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/rules` | List all rules, includes ingredient info, ordered newest first |
| `POST` | `/rules` | Upsert: creates rule if not exists, updates effect if already exists for that `(ingredientId, skinType)` pair |
| `DELETE` | `/rules/:id` | Delete a specific rule |
| `DELETE` | `/rules/all` | Delete ALL safety rules |

**Product Endpoints (`/api/v1/admin/products`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/products` | List all products, includes full ingredient list, ordered newest first |
| `POST` | `/products` | Create product. Accepts `ingredientNames` as array (parsed from INCI string on frontend). Auto-creates any unknown ingredients. |
| `PUT` | `/products/:id` | Update product. Replaces all ingredient relations. |
| `DELETE` | `/products/:id` | Delete product. Cascades to product-ingredient links. |
| `DELETE` | `/products/all` | Delete ALL products. Cascades to all product-ingredient links. |

**Excel Export Endpoints (`/api/v1/admin/export`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/export/ingredients` | Download all ingredients as `.xlsx` |
| `GET` | `/export/rules` | Download all rules as `.xlsx` (includes ingredient name) |
| `GET` | `/export/products` | Download all products as `.xlsx` (includes INCI string) |

**Excel Import Endpoints (`/api/v1/admin/import`):**

| Method | Path | Behavior |
|--------|------|----------|
| `POST` | `/import/ingredients` | Upload `.xlsx` to bulk-import ingredients (upsert by name) |
| `POST` | `/import/rules` | Upload `.xlsx` to bulk-import rules. Accepts Vietnamese column values (e.g., "DA DẦU" → OILY). |
| `POST` | `/import/products` | Upload `.xlsx` to bulk-import products. Auto-creates unknown ingredients. Upserts by name+brand. |

Import endpoints use `multer` for `multipart/form-data` file upload (max 10 MB). Import responses return `{ created, updated, skipped, errors[] }`.

## 3. Frontend Implementation (`/frontend`)

* **Route guard:** `AdminProtectedRoute.tsx` wraps all admin pages and redirects non-admin users to the home page.
* **Layout:** `admin/layout.tsx` provides a sidebar with navigation links to each management section (Dashboard, Ingredients, Rules, Products, Users, Reports, Import/Export).
* **Product INCI input:** The product form uses a **text area** where admins paste an INCI string. The frontend parses it (split by comma, trim) and sends the resulting array as `ingredientNames` to the backend.
* **Management pages:**
  - `/admin/ingredients` — Table with Edit/Delete actions per row, modal form for add/edit. Client-side search by ingredient name.
  - `/admin/rules` — Table with Delete action, form for creating/updating rules. Client-side search by related component.
  - `/admin/products` — Table with Edit/Delete actions, modal form with INCI textarea input. Client-side search by product/brand name.
  - `/admin/import-export` — Export database tables as `.xlsx`, import from `.xlsx` with drag-and-drop upload, and "Delete All" danger zone for bulk deletion of ingredients, rules, or products.

## 4. Testing

Tests in `admin.routes.test.ts` verify:
* A user with `role: USER` receives `403 Forbidden` on any `/api/v1/admin/*` route.
* A user with `role: ADMIN` can successfully call CRUD endpoints.
* Ingredient creation correctly normalizes names to lowercase.
* Duplicate ingredient name creation returns an error.