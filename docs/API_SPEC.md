# SKINMATE - API Specification (v1)

> **Last Updated:** April 30, 2026  
> **Status:** All endpoints implemented.

## 1. General Info
* **Base URL:** `/api/v1`
* **Content-Type:** `application/json`
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

### Admin CRUD — Ingredients (`/api/v1/admin/ingredients`)

> All admin routes require **both** `authMiddleware` AND `adminMiddleware`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/ingredients` | List all ingredients |
| `POST` | `/admin/ingredients` | Create a new ingredient (name auto-normalized to lowercase) |
| `PUT` | `/admin/ingredients/:id` | Update an ingredient's name or description |
| `DELETE` | `/admin/ingredients/:id` | Delete an ingredient (cascades to rules and product links) |

### Admin CRUD — Rules (`/api/v1/admin/rules`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/rules` | List all safety rules (includes ingredient info) |
| `POST` | `/admin/rules` | Create or update a rule (`ingredientId`, `skinType`, `effect`) |
| `DELETE` | `/admin/rules/:id` | Delete a specific rule |

### Admin CRUD — Products (`/api/v1/admin/products`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/products` | List all products (includes ingredient list) |
| `POST` | `/admin/products` | Create a product. Accepts `name`, `brand`, `imageUrl`, `ingredientNames` (INCI string parsed automatically) |
| `PUT` | `/admin/products/:id` | Update a product. Replaces ingredient relations |
| `DELETE` | `/admin/products/:id` | Delete a product (cascades to product-ingredient links) |

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