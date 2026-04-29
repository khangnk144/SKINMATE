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

**Rule Endpoints (`/api/v1/admin/rules`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/rules` | List all rules, includes ingredient info, ordered newest first |
| `POST` | `/rules` | Upsert: creates rule if not exists, updates effect if already exists for that `(ingredientId, skinType)` pair |
| `DELETE` | `/rules/:id` | Delete a specific rule |

**Product Endpoints (`/api/v1/admin/products`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/products` | List all products, includes full ingredient list, ordered newest first |
| `POST` | `/products` | Create product. Accepts `ingredientNames` as array (parsed from INCI string on frontend). Auto-creates any unknown ingredients. |
| `PUT` | `/products/:id` | Update product. Replaces all ingredient relations. |
| `DELETE` | `/products/:id` | Delete product. Cascades to product-ingredient links. |

## 3. Frontend Implementation (`/frontend`)

* **Route guard:** `AdminProtectedRoute.tsx` wraps all admin pages and redirects non-admin users to the home page.
* **Layout:** `admin/layout.tsx` provides a sidebar with navigation links to each management section.
* **Product INCI input:** The product form uses a **text area** where admins paste an INCI string. The frontend parses it (split by comma, trim) and sends the resulting array as `ingredientNames` to the backend.
* **Management pages:**
  - `/admin/ingredients` — Table with Edit/Delete actions per row, modal form for add/edit.
  - `/admin/rules` — Table with Delete action, form for creating/updating rules.
  - `/admin/products` — Table with Edit/Delete actions, modal form with INCI textarea input.

## 4. Testing

Tests in `admin.routes.test.ts` verify:
* A user with `role: USER` receives `403 Forbidden` on any `/api/v1/admin/*` route.
* A user with `role: ADMIN` can successfully call CRUD endpoints.
* Ingredient creation correctly normalizes names to lowercase.
* Duplicate ingredient name creation returns an error.