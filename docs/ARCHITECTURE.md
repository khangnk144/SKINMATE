# SKINMATE - Architecture

> Last verified against code: June 1, 2026

## High-Level Shape

```text
Next.js frontend
  -> REST calls through frontend/src/lib/api.ts
Express backend
  -> Prisma Client
PostgreSQL database
```

The backend is the source of business rules. The frontend stores auth state, renders workflows, and calls REST endpoints.

## Backend App Setup

`backend/src/index.ts`:

- Loads `dotenv`.
- Creates an Express app.
- Enables `cors()`.
- Enables `compression()`.
- Parses JSON with `express.json({ limit: '1mb' })`.
- Mounts `/api/v1/*` routes.
- Mounts OCR separately at `/api/ocr`.
- Listens on `process.env.PORT || 5000`.

## Backend Layers

```text
route -> middleware -> controller -> service -> prisma
```

| Layer | Responsibility |
| --- | --- |
| Routes | URL wiring and middleware ordering |
| Middlewares | JWT auth, admin authorization, analysis rate limiting |
| Controllers | Request validation, status codes, response shape |
| Services | Business logic and database orchestration |
| Utils | Shared Prisma client and Gemini client |
| Modules | Self-contained feature modules, currently OCR |

Some small flows use Prisma directly in controllers:

- History
- Ingredient search
- Notifications

## Backend Module Map

| Module | Route base | Main files |
| --- | --- | --- |
| Auth | `/api/v1/auth` | `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts` |
| Users | `/api/v1/users` | `user.routes.ts`, `user.controller.ts`, `user.service.ts` |
| Analysis | `/api/v1/analysis` | `analysis.routes.ts`, `analysis.controller.ts`, `analysis.service.ts` |
| Products | `/api/v1/products` | `product.routes.ts`, `product.controller.ts`, `product.service.ts` |
| History | `/api/v1/history` | `history.routes.ts`, `history.controller.ts` |
| Admin | `/api/v1/admin` | `admin.routes.ts`, `admin.controller.ts`, `admin.service.ts` |
| Excel | `/api/v1/admin/export`, `/api/v1/admin/import` | `excel.controller.ts`, `excel.service.ts` |
| Reports | `/api/v1/reports` | `report.routes.ts`, `report.controller.ts`, `report.service.ts` |
| Ingredients | `/api/v1/ingredients` | `ingredient.routes.ts`, `ingredient.controller.ts` |
| Notifications | `/api/v1/notifications` | `notification.routes.ts`, `notification.controller.ts` |
| OCR | `/api/ocr` | `modules/ocr/*` |

## INCI Analysis Flow

```text
POST /api/v1/analysis/check
-> authMiddleware
-> analysisRateLimiter
-> checkAnalysis controller
-> refresh current user from DB
-> analyzeIngredients service
-> save raw input to AnalysisHistory
-> return result array
```

`analysis.service.ts`:

1. Splits input by comma.
2. Trims blank items.
3. Lowercases names for database matching.
4. Deduplicates lookup names.
5. Fetches known ingredients and rules for the current skin type.
6. Calls Gemini for missing names when `skinType` exists.
7. Caches Gemini results with Prisma upserts.
8. Returns results in original input order.

## Recommendation Flow

```text
GET /api/v1/products/recommendations
-> authMiddleware
-> getRecommendations controller
-> getSafeRecommendations service
```

The service fetches all products, removes products containing any `BAD` ingredient for the user's skin type, scores by `GOOD` ingredients, keeps the top 6, shuffles, and returns 3 products.

## Community Report Flow

```text
POST /api/v1/reports
POST /api/v1/reports/vote
GET /api/v1/reports/pending
GET /api/v1/reports/vote/:reportId
POST /api/v1/reports/resolve
```

All report routes require auth. `resolve` also requires admin. Approval updates or creates an `IngredientRule` and creates a notification for the reporter.

## OCR Flow

```text
POST /api/ocr/ingredients
-> multer memory upload, field name "file", max 5 MB
-> OCR.space API, timeout 15 seconds
-> rule-based text extraction
-> return { ingredients: "comma, separated, list" }
```

OCR requires `OCR_API_KEY`.

## Frontend Architecture

| Area | Files |
| --- | --- |
| App routes | `frontend/src/app/**/page.tsx` |
| Root layout | `frontend/src/app/layout.tsx` |
| Admin layout | `frontend/src/app/admin/layout.tsx` |
| Auth state | `frontend/src/context/AuthContext.tsx` |
| API helpers | `frontend/src/lib/api.ts` |
| Shared UI | `frontend/src/components/*.tsx` |

`AuthContext` hydrates token/user from `localStorage`, exposes `login()` and `logout()`, and is mounted in the root layout.

## API URL Handling

`frontend/src/lib/api.ts` defines:

- `API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'`
- `API_ROOT_URL` derived by removing `/api/v1`
- `buildListUrl()` for admin list endpoints
- Helpers for legacy arrays and paginated responses

## Security Model

- JWT auth for protected routes.
- Admin middleware for admin-only routes.
- bcrypt password hashing.
- Locked accounts blocked during login.
- Prisma query APIs instead of raw SQL.
- Analysis rate limit of 25 per day for normal users.
- JSON body limit of 1 MB.
- OCR upload limit of 5 MB.
