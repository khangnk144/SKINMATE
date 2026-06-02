# SKINMATE - API Specification

> Last verified against code: June 1, 2026

## General

- Versioned base URL: `/api/v1`
- OCR base URL: `/api/ocr`
- Development server: `http://localhost:5000`
- JSON body limit: `1mb`
- File uploads: `multipart/form-data`
- Protected routes require `Authorization: Bearer <jwt>`

Responses are not wrapped in a single standard envelope. Most controllers return either raw objects/arrays or `{ error: "..." }`.

## Auth

Base: `/api/v1/auth`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/register` | No | `username`, `password`, `skinType`, optional `displayName` | `201 { message, user }` |
| `POST` | `/login` | No | `username`, `password` | `200 { token, user }` |

Notes:

- Password must be at least 6 characters.
- `skinType` must be a Prisma `SkinType`.
- Locked users receive `403`.

## Users

Base: `/api/v1/users`

All routes require auth.

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/profile` | None | Safe user profile without password hash |
| `PUT` | `/profile` | `skinType`, optional `displayName` | Updated profile |
| `PUT` | `/change-password` | `oldPassword`, `newPassword` | `{ message: "Password changed successfully." }` |

`PUT /profile` requires `skinType`; `displayName` is optional.

## Analysis

Base: `/api/v1/analysis`

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/check` | User | `inciString` | Array of analysis results |

Result item:

```json
{
  "originalName": "Water",
  "mappedName": "water",
  "effect": "GOOD",
  "description": "optional text",
  "ingredientId": 1,
  "source": "DATABASE",
  "isVerified": true
}
```

Notes:

- Uses `authMiddleware` then `analysisRateLimiter`.
- Saves raw input to `AnalysisHistory`.
- Unknown ingredients can trigger Gemini fallback.
- Official DB results return `source: "DATABASE"` and `isVerified: true`.
- Gemini results return `source: "AI"` and `isVerified: false`, and are saved as pending admin suggestions.
- Missing DB/AI results return `source: "FALLBACK"` and `isVerified: false`.

## Products

Base: `/api/v1/products`

| Method | Path | Auth | Query | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/recommendations` | User | optional `ingredients=water,glycerin` | Up to 3 product cards |

The `ingredients` query is parsed but not currently used by the service ranking logic.

## History

Base: `/api/v1/history`

All routes require auth.

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/` | Current user's history, newest first |
| `DELETE` | `/:id` | `{ message: "History item deleted" }` |
| `DELETE` | `/` | `{ message: "All history deleted" }` |

## Ingredients

Base: `/api/v1/ingredients`

All routes require auth.

| Method | Path | Query | Response |
| --- | --- | --- | --- |
| `GET` | `/search` | `name` | `{ id, name }` or 404 |

Search trims and lowercases `name`, then does exact unique lookup.

## Reports

Base: `/api/v1/reports`

All routes require auth. `/resolve` also requires admin.

| Method | Path | Body/Query | Response |
| --- | --- | --- | --- |
| `POST` | `/` | `ingredientId`, `skinType`, `reportedEffect`, `reason`, optional `evidenceUrl` | Created report |
| `POST` | `/vote` | `reportId`, `voteType` | Vote result |
| `GET` | `/pending` | `sortBy=votes|newest`, `limit`, `offset` | `{ data, total }` |
| `GET` | `/vote/:reportId` | None | `{ voteType }` |
| `POST` | `/resolve` | `reportId`, `status`, optional `adminNote` | Resolved report |

`status` for resolve must be `APPROVED` or `REJECTED`.

## Notifications

Base: `/api/v1/notifications`

All routes require auth. `/send` also requires admin.

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/` | None | Up to 50 newest notifications |
| `PATCH` | `/read-all` | None | `{ message: "All notifications marked as read" }` |
| `PATCH` | `/:id/read` | None | Updated notification |
| `POST` | `/send` | `userId`, `title`, `message`, optional `link` | Created notification |

## OCR

Base: `/api/ocr`

| Method | Path | Auth | Upload | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/ingredients` | No | field name `file`, max 5 MB | `{ ingredients }` |

Notes:

- Requires backend `OCR_API_KEY`.
- Uses OCR.space with 15 second timeout.
- Oversized uploads return `413 { error, ingredients: "" }`.

## Admin

Base: `/api/v1/admin`

All routes require auth and admin.

### Dashboard

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/stats` | `{ ingredients, rules, products, users, analyses }` |
| `GET` | `/reports` | `{ totalUsers, totalAnalyses, skinTypeDistribution }` |

### Ingredients

| Method | Path | Body/Query |
| --- | --- | --- |
| `GET` | `/ingredients` | optional `page`, `limit`, `search` |
| `POST` | `/ingredients` | `name`, optional `description` |
| `PUT` | `/ingredients/:id` | `name`, optional `description` |
| `DELETE` | `/ingredients/all` | None |
| `DELETE` | `/ingredients/:id` | None |

### Rules

| Method | Path | Body/Query |
| --- | --- | --- |
| `GET` | `/rules` | optional `page`, `limit`, `search` |
| `POST` | `/rules` | `ingredientId`, `skinType`, `effect` |
| `DELETE` | `/rules/all` | None |
| `DELETE` | `/rules/:id` | None |

`POST /rules` creates or updates the unique `(ingredientId, skinType)` rule.

### AI Suggestions

| Method | Path | Body/Query |
| --- | --- | --- |
| `GET` | `/ai-suggestions` | optional `status=PENDING|APPROVED|REJECTED`, `page`, `limit`, `search` |
| `POST` | `/ai-suggestions/:id/approve` | optional `adminNote` |
| `POST` | `/ai-suggestions/:id/reject` | optional `adminNote` |

AI suggestions are generated from Gemini when analysis finds ingredients missing from the official database.

Approving a pending suggestion creates or updates the official `Ingredient`, upserts the `(ingredientId, skinType)` `IngredientRule`, and marks the suggestion `APPROVED`.

Rejecting a pending suggestion marks it `REJECTED` without mutating official ingredient or rule data.

### Products

| Method | Path | Body/Query |
| --- | --- | --- |
| `GET` | `/products` | optional `page`, `limit`, `search` |
| `POST` | `/products` | `name`, `brand`, optional `imageUrl`, optional `ingredientNames` |
| `PUT` | `/products/:id` | `name`, `brand`, optional `imageUrl`, optional `ingredientNames` |
| `DELETE` | `/products/all` | None |
| `DELETE` | `/products/:id` | None |

Product create/update auto-finds or creates ingredients and stores positions.

### Users

| Method | Path | Body/Query |
| --- | --- | --- |
| `GET` | `/users` | optional `page`, `limit`, `search` |
| `PATCH` | `/users/:id/status` | None; toggles `isActive` |
| `DELETE` | `/users/:id` | None |

### Excel

| Method | Path | Upload/Response |
| --- | --- | --- |
| `GET` | `/export/ingredients` | `.xlsx` file |
| `GET` | `/export/rules` | `.xlsx` file |
| `GET` | `/export/products` | `.xlsx` file |
| `POST` | `/import/ingredients` | `file` field |
| `POST` | `/import/rules` | `file` field |
| `POST` | `/import/products` | `file` field |

Import upload limit is 10 MB.

## Admin List Pagination

When `page`, `limit`, or `search` is present, admin list endpoints return:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

The service caps `limit` at 100. If no list query params are sent, endpoints return legacy arrays.
