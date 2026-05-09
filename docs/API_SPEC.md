# SKINMATE - API Specification (v1)

> **Last Updated:** May 9, 2026  
> **Status:** All endpoints implemented.

## 1. General Info
* **Base URL:** `/api/v1`
* **Content-Type:** `application/json` (except file upload endpoints which use `multipart/form-data`)
* **Authentication:** Bearer Token (JWT) in the `Authorization` header.
* **Server Port:** `5000` (development)

## 2. Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "..." }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": null
  }
}
```

## 3. Core Endpoints

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register a new user (`username`, `password`, `skinType`, `displayName?`) |
| `POST` | `/auth/login` | ❌ | Returns JWT token + user object (includes `displayName`). Rejects locked accounts (`isActive: false`) |

### User Profile (`/api/v1/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/profile` | ✅ User | Get authenticated user's profile (includes `displayName`) |
| `PUT` | `/users/profile` | ✅ User | Update `skinType` and/or `displayName` |
| `PUT` | `/users/change-password` | ✅ User | Change user password |

**Update Profile Request Body:**
```json
{
  "skinType": "OILY",
  "displayName": "Nguyễn Thị An"
}
```
> `displayName` is optional. Send `null` to clear it. `username` cannot be changed via this endpoint.

**Change Password Request Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```
**Success Response:** `200 OK` with `{ "message": "Password changed successfully." }`
**Error Codes:** `INVALID_PASSWORD` (wrong old password or new password < 6 chars), `USER_NOT_FOUND`.

### Analysis (`/api/v1/analysis`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/analysis/check` | ✅ User | Analyze an INCI string. Saves result to history automatically. |

**Request Body:**
```json
{ "inciString": "Water, Glycerin, Niacinamide, ..." }
```
**Response:** Array of ingredient results with `originalName`, `mappedName`, `effect` (`GOOD`/`BAD`/`NEUTRAL`), and `description`.

### Products (`/api/v1/products`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/products/recommendations` | ✅ User | Returns all products safe for the user's skin type (excludes any product with a BAD ingredient for that skin type) |

### History (`/api/v1/history`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/history` | ✅ User | Returns the authenticated user's analysis history, ordered by most recent |
| `DELETE` | `/history/:id` | ✅ User | Deletes a specific history entry by ID |
| `DELETE` | `/history` | ✅ User | Clears ALL history entries for the authenticated user |

### Ingredient Search (`/api/v1/ingredients`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/ingredients/search?name=...` | ✅ User | Search for an ingredient by exact name (lowercase match). Returns `{ id, name }` or 404 if not found. Used by the community reporting feature to resolve ingredient IDs. |

### Community Ingredient Reports (`/api/v1/reports`)

> All routes require `authMiddleware`. Admin-only routes additionally require `adminMiddleware`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/reports` | ✅ User | Submit a new ingredient report. Body: `{ ingredientId, skinType, reportedEffect, reason, evidenceUrl? }` |
| `POST` | `/reports/vote` | ✅ User | Vote on a report. Body: `{ reportId, voteType }` (`UP`/`DOWN`). Same vote type toggles off. Different vote type updates. |
| `GET` | `/reports/pending` | ✅ User | List pending reports. Query params: `sortBy` (`votes`/`newest`), `limit`, `offset`. Returns `{ data, total }`. |
| `GET` | `/reports/vote/:reportId` | ✅ User | Get the authenticated user's vote on a specific report. Returns `{ voteType }` (or `null`). |
| `POST` | `/reports/resolve` | ✅ Admin | Resolve a pending report. Body: `{ reportId, status, adminNote? }`. Status must be `APPROVED` or `REJECTED`. Approved reports auto-update the corresponding `IngredientRule`. Creates a notification for the report author. |

### Notifications (`/api/v1/notifications`)

> All routes require `authMiddleware`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/notifications` | ✅ User | Get the authenticated user's notifications (newest first, max 50). |
| `PATCH` | `/notifications/:id/read` | ✅ User | Mark a specific notification as read. Verifies ownership. |
| `PATCH` | `/notifications/read-all` | ✅ User | Mark all of the user's unread notifications as read. |
| `POST` | `/notifications/send` | ✅ Admin | Send a custom notification to a user. Body: `{ userId, title, message, link? }`. |

### OCR — Image Ingredient Extraction (`/api/ocr`)

> **Note:** This endpoint uses a different base path (`/api/ocr`, not `/api/v1`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/ocr/ingredients` | ❌ | Upload a product label image to extract the INCI ingredient list via OCR. Uses `multer` for `multipart/form-data` upload (field name: `file`). Returns `{ ingredients: "comma, separated, list" }`. |

### Admin CRUD — Ingredients (`/api/v1/admin/ingredients`)

> All admin routes require **both** `authMiddleware` AND `adminMiddleware`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/ingredients` | List all ingredients |
| `POST` | `/admin/ingredients` | Create a new ingredient (name auto-normalized to lowercase) |
| `PUT` | `/admin/ingredients/:id` | Update an ingredient's name or description |
| `DELETE` | `/admin/ingredients/:id` | Delete an ingredient (cascades to rules and product links) |
| `DELETE` | `/admin/ingredients/all` | Delete ALL ingredients (cascades to all rules and product links) |

### Admin CRUD — Rules (`/api/v1/admin/rules`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/rules` | List all safety rules (includes ingredient info) |
| `POST` | `/admin/rules` | Create or update a rule (`ingredientId`, `skinType`, `effect`) |
| `DELETE` | `/admin/rules/:id` | Delete a specific rule |
| `DELETE` | `/admin/rules/all` | Delete ALL safety rules |

### Admin CRUD — Products (`/api/v1/admin/products`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/products` | List all products (includes ingredient list) |
| `POST` | `/admin/products` | Create a product. Accepts `name`, `brand`, `imageUrl`, `ingredientNames` (INCI string parsed automatically) |
| `PUT` | `/admin/products/:id` | Update a product. Replaces ingredient relations |
| `DELETE` | `/admin/products/:id` | Delete a product (cascades to product-ingredient links) |
| `DELETE` | `/admin/products/all` | Delete ALL products (cascades to all product-ingredient links) |

### Admin — User Management (`/api/v1/admin/users`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users` | List all users (excludes `passwordHash`). Includes `skinType`, `role`, `isActive` |
| `PATCH` | `/admin/users/:id/status` | Toggle `isActive` for a user (lock/unlock account) |
| `DELETE` | `/admin/users/:id` | Permanently delete a user account |

### Admin — Reports (`/api/v1/admin/reports`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/reports` | Returns: `totalUsers`, `totalAnalyses`, `skinTypeDistribution` (array of `{ type, count }`) |

### Admin — Excel Export (`/api/v1/admin/export`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/export/ingredients` | Download all ingredients as an `.xlsx` file |
| `GET` | `/admin/export/rules` | Download all safety rules as an `.xlsx` file |
| `GET` | `/admin/export/products` | Download all products as an `.xlsx` file |

**Response:** Binary `.xlsx` file with `Content-Disposition: attachment` header.

### Admin — Excel Import (`/api/v1/admin/import`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/import/ingredients` | Upload an `.xlsx` file to bulk-import ingredients. Uses upsert (creates new, updates existing by name). |
| `POST` | `/admin/import/rules` | Upload an `.xlsx` file to bulk-import safety rules. Accepts both English and Vietnamese column values. |
| `POST` | `/admin/import/products` | Upload an `.xlsx` file to bulk-import products. Auto-creates unknown ingredients. |

**Request:** `multipart/form-data` with a `file` field containing the `.xlsx` file. Max file size: 10 MB.

**Response:**
```json
{
  "success": true,
  "result": {
    "created": 5,
    "updated": 2,
    "skipped": 1,
    "errors": ["Row 4: \"name\" column is missing or empty."]
  }
}
```

## 4. Error Codes

| Code | Meaning |
|------|---------|
| `AUTH_FAILED` | Invalid credentials (wrong password or username) |
| `INVALID_PASSWORD` | Current password does not match or new password is invalid |
| `ACCOUNT_LOCKED` | Account has been locked by an administrator |
| `UNAUTHORIZED` | Missing or invalid JWT token |
| `FORBIDDEN` | Authenticated but insufficient role (e.g., non-admin on admin route) |
| `VALIDATION_ERROR` | Input format is incorrect (e.g., empty INCI string) |
| `NOT_FOUND` | Requested resource does not exist |
| `CONFLICT` | Resource already exists (e.g., duplicate ingredient name) |
| `DB_ERROR` | Database connection or query issue |
| `RATE_LIMITED` | Analysis rate limit exceeded (25/day per user) |