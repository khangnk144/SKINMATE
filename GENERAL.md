# SKINMATE - General Onboarding Guide

> Last verified against code: June 1, 2026
> Scope: documentation only. The Prisma schema, backend routes, frontend pages, and package files are the source of truth.

## What SKINMATE Is

SKINMATE is a skincare ingredient analysis web app.

Users can register, choose a skin type, paste an INCI ingredient list or upload a product label image, receive per-ingredient safety results, view recommendations, save history, report incorrect ingredient classifications, vote on community reports, and receive in-app notifications.

Admins can manage ingredients, safety rules, products, users, community reports, notifications, and Excel import/export data.

## Current Tech Stack

| Area | Code-backed implementation |
| --- | --- |
| Frontend | Next.js 16.2.4 App Router, React 19.2.4, TypeScript, TailwindCSS 4 |
| UI helpers | Lucide React, Recharts 3.8.1, Next Image |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL through Prisma 5 |
| Auth | bcryptjs password hashing, JWT tokens, localStorage on frontend |
| AI fallback | Google Gemini through `backend/src/utils/gemini.ts` |
| OCR | OCR.space through `backend/src/modules/ocr/ocrService.ts` |
| Excel | `xlsx`, `multer`; package also includes `exceljs` |
| Tests | Backend Jest + Supertest |

## Repository Map

```text
SKINMATE/
|-- GENERAL.md
|-- STATUS.md
|-- fix-urls.js
|-- report.tex
|-- skinmate_logo.png
|-- docs/
|   |-- README.md
|   |-- CONTEXT.md
|   |-- ARCHITECTURE.md
|   |-- DATABASE.md
|   |-- API_SPEC.md
|   |-- PROJECT-RULES.md
|   `-- features/
|       |-- 01-auth.md
|       |-- ...
|       `-- 14-localization-pagination.md
|-- backend/
|   |-- package.json
|   |-- jest.config.js
|   |-- tsconfig.json
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   `-- src/
|       |-- index.ts
|       |-- routes/
|       |-- controllers/
|       |-- services/
|       |-- middlewares/
|       |-- modules/ocr/
|       |-- utils/
|       |-- tests/
|       `-- scratch/
`-- frontend/
    |-- package.json
    |-- next.config.ts
    |-- eslint.config.mjs
    |-- postcss.config.mjs
    |-- AGENTS.md
    |-- CLAUDE.md
    |-- README.md
    |-- public/
    `-- src/
        |-- app/
        |-- components/
        |-- context/
        `-- lib/
```

Generated folders such as `node_modules/` and `.next/` are not project documentation and should not be edited manually.

## Backend Entry Point

`backend/src/index.ts` creates the Express app and mounts these routes:

| Mount path | Route file |
| --- | --- |
| `/api/v1/auth` | `auth.routes.ts` |
| `/api/v1/users` | `user.routes.ts` |
| `/api/v1/analysis` | `analysis.routes.ts` |
| `/api/v1/products` | `product.routes.ts` |
| `/api/v1/history` | `history.routes.ts` |
| `/api/v1/admin` | `admin.routes.ts` |
| `/api/v1/reports` | `report.routes.ts` |
| `/api/v1/ingredients` | `ingredient.routes.ts` |
| `/api/v1/notifications` | `notification.routes.ts` |
| `/api/ocr` | `modules/ocr/ocrRoutes.ts` |

The app uses `cors()`, `compression()`, and `express.json({ limit: '1mb' })`. The default port is `process.env.PORT || 5000`.

## Backend Layer Pattern

Most backend features follow this flow:

```text
Request -> route -> middleware -> controller -> service -> Prisma -> PostgreSQL
```

Routes wire URLs to handlers. Middlewares enforce auth/admin/rate-limit rules. Controllers validate request shape and format responses. Services contain business logic. Prisma is the database access layer.

Two areas intentionally use inline Prisma instead of a separate service:

- History controller
- Ingredient and notification controllers

## Database Models

The live schema is `backend/prisma/schema.prisma`. It defines 9 models:

| Model | Purpose |
| --- | --- |
| `User` | Accounts, roles, profile skin type, lock status |
| `Ingredient` | Normalized lowercase INCI ingredient names |
| `IngredientRule` | `ingredientId + skinType -> GOOD/BAD/NEUTRAL` |
| `Product` | Recommended products |
| `ProductIngredient` | Product-to-ingredient join table with INCI position |
| `AnalysisHistory` | Raw INCI strings submitted by users |
| `IngredientReport` | Community reports about wrong classifications |
| `ReportVote` | One UP/DOWN vote per user per report |
| `Notification` | In-app user notifications |

Enums:

- `SkinType`: `OILY`, `DRY`, `SENSITIVE`, `COMBINATION`, `NORMAL`
- `UserRole`: `USER`, `ADMIN`
- `SafetyEffect`: `GOOD`, `BAD`, `NEUTRAL`
- `ReportStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `VoteType`: `UP`, `DOWN`

## Main User Flow

1. User registers with `POST /api/v1/auth/register`.
2. User logs in with `POST /api/v1/auth/login`.
3. Frontend stores `token` and `user` in `localStorage` through `AuthContext`.
4. User updates `skinType` and optional `displayName` with `PUT /api/v1/users/profile`.
5. User opens `/analysis`.
6. User either pastes an INCI string or uploads an image to `/api/ocr/ingredients`.
7. Frontend sends `POST /api/v1/analysis/check`.
8. Backend refreshes the user's current skin type from DB.
9. `analysis.service.ts` splits the INCI string by comma, trims entries, lowercases names for matching, and looks up known ingredients.
10. Missing ingredients are sent to Gemini only when a skin type exists.
11. Gemini results are cached into `Ingredient` and `IngredientRule`.
12. Backend saves the raw input into `AnalysisHistory`.
13. Frontend renders results and calls `GET /api/v1/products/recommendations`.

## Recommendation Logic

`backend/src/services/product.service.ts` does more than a simple "return all safe products" list:

1. Fetch all products with ingredients and rules for the user's skin type.
2. Exclude any product with an ingredient whose matching rule is `BAD`.
3. Score safe products by number of `GOOD` ingredient rules.
4. Sort by score, keep the top 6, shuffle them, and return 3 products.

The optional `ingredients` query parameter is parsed by the controller and passed to the service as `contextIngredients`, but the service currently keeps it for future ranking and does not use it.

## Auth And Security

- Passwords are hashed with bcrypt using 10 salt rounds.
- JWT payload contains `userId`, `role`, and `skinType`.
- JWT expiry is `1d`.
- `authMiddleware` requires `Authorization: Bearer <token>`.
- `adminMiddleware` requires `req.user.role === 'ADMIN'`.
- Locked users (`isActive: false`) cannot log in.
- Analysis is rate-limited to 25 calls per 24 hours for normal users.
- Admin users skip the analysis rate limit.
- The limiter also contains a future `PRO` branch with 100 calls, but `PRO` is not a Prisma `UserRole` today.

## Frontend Structure

Live routes under `frontend/src/app`:

| URL | File |
| --- | --- |
| `/` | `app/page.tsx` |
| `/login` | `app/login/page.tsx` |
| `/register` | `app/register/page.tsx` |
| `/profile` | `app/profile/page.tsx` |
| `/analysis` | `app/analysis/page.tsx` |
| `/history` | `app/history/page.tsx` |
| `/community/reports` | `app/community/reports/page.tsx` |
| `/admin` | `app/admin/page.tsx` |
| `/admin/ingredients` | `app/admin/ingredients/page.tsx` |
| `/admin/rules` | `app/admin/rules/page.tsx` |
| `/admin/products` | `app/admin/products/page.tsx` |
| `/admin/users` | `app/admin/users/page.tsx` |
| `/admin/reports` | `app/admin/reports/page.tsx` |
| `/admin/community-reports` | `app/admin/community-reports/page.tsx` |
| `/admin/import-export` | `app/admin/import-export/page.tsx` |

Important frontend files:

- `src/context/AuthContext.tsx`: token/user state and localStorage hydration.
- `src/lib/api.ts`: `NEXT_PUBLIC_API_URL`, `API_ROOT_URL`, pagination helpers.
- `src/components/Navbar.tsx`: guest/user/admin nav and notification bell.
- `src/components/ProtectedRoute.tsx`: login guard.
- `src/components/AdminProtectedRoute.tsx`: admin guard.
- `src/components/ImageOCRUploader.tsx`: image upload to OCR endpoint.
- `src/components/ProductCard.tsx`: recommendation card.
- `src/components/AdminReportsCharts.tsx`: Recharts dashboard chart.

## Environment Variables

Backend `.env` expected by code:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
JWT_SECRET="replace_me"
GEMINI_API_KEY="replace_me"
OCR_API_KEY="replace_me"
```

Frontend optional `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_ENABLE_HEALTH_CHECK="true"
```

If `NEXT_PUBLIC_API_URL` is not set, frontend code defaults to `http://localhost:5000/api/v1`.

## Local Setup

```bash
docker run --name skinmate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=skinmate -p 5432:5432 -d postgres
cd backend
npm install
npx prisma db push
npx prisma generate
npx prisma db seed
cd ../frontend
npm install
```

Daily startup:

```bash
docker start skinmate-postgres
cd backend
npm run dev
cd ../frontend
npm run dev
```

Backend runs on `http://localhost:5000`; frontend runs on `http://localhost:3000`.

## Tests

Backend tests:

```bash
cd backend
npm test
```

Frontend has a lint script:

```bash
cd frontend
npm run lint
```

There is no frontend test runner configured in `frontend/package.json` at this time.

## Reading Order For New Contributors

1. `GENERAL.md`
2. `STATUS.md`
3. `docs/CONTEXT.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DATABASE.md`
6. `docs/API_SPEC.md`
7. `docs/PROJECT-RULES.md`
8. `docs/features/*.md`
9. Backend source under `backend/src`
10. Frontend source under `frontend/src`

## Current Caveats From Code

- Many source comments and UI strings contain mojibake-looking Vietnamese text. This documentation records behavior without changing code.
- `notification.controller.ts` creates its own `PrismaClient` instead of using `utils/prisma.ts`.
- `product.service.ts` creates its own `PrismaClient` instead of using `utils/prisma.ts`.
- `exceljs` is installed but Excel service currently uses `xlsx`.
- There is no Prisma migrations folder; docs and setup use `prisma db push`.
- `report.tex` is a large report artifact and is not part of runtime code.
