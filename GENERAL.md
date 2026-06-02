# SKINMATE - General Onboarding Guide

> Last verified against code: June 1, 2026
> Scope: documentation only. The Prisma schema, backend routes, frontend pages, and package files are the source of truth.

## What SKINMATE Is

SKINMATE is a skincare ingredient analysis web app.

Users can register, choose a skin type, paste an INCI ingredient list or upload a product label image, receive per-ingredient safety results, view recommendations, save history, report incorrect ingredient classifications, vote on community reports, and receive in-app notifications.

Admins can manage ingredients, safety rules, AI ingredient suggestions, products, users, community reports, notifications, and Excel import/export data.

## 3-Day Onboarding Plan

Use this when a new member needs to understand the project quickly without getting lost in every file at once.

### Day 1 - Product And Docs

| Order | File | Goal |
| --- | --- | --- |
| 1 | `GENERAL.md` | Understand the whole project map and main flows |
| 2 | `docs/README.md` | Course/team info, setup, and documentation index |
| 3 | `STATUS.md` | Current implemented status and feature map |
| 4 | `docs/CONTEXT.md` | Product goals and business rules |
| 5 | `docs/ARCHITECTURE.md` | Backend/frontend/database shape |
| 6 | `docs/DATABASE.md` | Prisma models and relationships |
| 7 | `docs/API_SPEC.md` | Implemented API endpoints |
| 8 | `docs/PROJECT-RULES.md` | Project contribution rules |

End goal: explain what SKINMATE does, what the main user/admin flows are, and which docs answer which question.

### Day 2 - Backend Code

| Order | File or folder | Focus |
| --- | --- | --- |
| 1 | `backend/prisma/schema.prisma` | Database source of truth |
| 2 | `backend/src/index.ts` | Express app setup and route mounting |
| 3 | `backend/src/middlewares/` | JWT auth, admin guard, analysis rate limit |
| 4 | `backend/src/routes/` | Endpoint wiring |
| 5 | `backend/src/controllers/` | Request validation and response status codes |
| 6 | `backend/src/services/auth.service.ts` | Register/login/password logic |
| 7 | `backend/src/services/analysis.service.ts` | INCI parsing, DB lookup, Gemini fallback |
| 8 | `backend/src/services/product.service.ts` | Safe product filtering and recommendation selection |
| 9 | `backend/src/services/admin.service.ts` | Admin CRUD, pagination/search, stats |
| 10 | `backend/src/services/report.service.ts` | Community reports, votes, resolution |
| 11 | `backend/src/modules/ocr/` | OCR upload, OCR.space call, ingredient extraction |
| 12 | `backend/src/tests/` | How behavior is verified |

End goal: trace `POST /api/v1/analysis/check` from route to controller to service to Prisma and back.

### Day 3 - Frontend Code And Local Run

| Order | File or folder | Focus |
| --- | --- | --- |
| 1 | Local setup section below | Run DB, backend, and frontend |
| 2 | `frontend/src/app/layout.tsx` | Fonts, AuthProvider, Navbar, footer |
| 3 | `frontend/src/context/AuthContext.tsx` | Token/user state and localStorage |
| 4 | `frontend/src/lib/api.ts` | API URL and pagination helpers |
| 5 | `frontend/src/components/Navbar.tsx` | Guest/user/admin navigation |
| 6 | `frontend/src/components/ProtectedRoute.tsx` | Authenticated route guard |
| 7 | `frontend/src/components/AdminProtectedRoute.tsx` | Admin route guard |
| 8 | `frontend/src/app/analysis/page.tsx` | Main analysis UI |
| 9 | `frontend/src/app/profile/page.tsx` | Profile and password update |
| 10 | `frontend/src/app/history/page.tsx` | History and re-analysis |
| 11 | `frontend/src/app/admin/` | Admin dashboard and management pages |

End goal: run the app, register/login, analyze an INCI string, inspect history, and understand how frontend calls backend.

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

The live schema is `backend/prisma/schema.prisma`. It defines 10 models:

| Model | Purpose |
| --- | --- |
| `User` | Accounts, roles, profile skin type, lock status |
| `Ingredient` | Normalized lowercase INCI ingredient names |
| `IngredientRule` | `ingredientId + skinType -> GOOD/BAD/NEUTRAL` |
| `AiIngredientSuggestion` | Pending Gemini classifications awaiting admin review |
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
11. Gemini results are returned as unverified AI suggestions and stored in `AiIngredientSuggestion`.
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
| `/admin/ai-suggestions` | `app/admin/ai-suggestions/page.tsx` |
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

## Quick Reference

| Need | Go to |
| --- | --- |
| Project overview and onboarding | `GENERAL.md` |
| Course/team info | `docs/README.md` |
| Current implemented status | `STATUS.md` |
| Product/business rules | `docs/CONTEXT.md` |
| Architecture and data flow | `docs/ARCHITECTURE.md` |
| Database fields and relationships | `docs/DATABASE.md` |
| Endpoint list and request notes | `docs/API_SPEC.md` |
| Feature-by-feature notes | `docs/features/*.md` |
| Backend route mounting | `backend/src/index.ts` |
| Auth flow | `backend/src/services/auth.service.ts`, `frontend/src/context/AuthContext.tsx` |
| Analysis engine | `backend/src/services/analysis.service.ts` |
| Gemini integration | `backend/src/utils/gemini.ts` |
| OCR integration | `backend/src/modules/ocr/` |
| Recommendation logic | `backend/src/services/product.service.ts` |
| Admin CRUD | `backend/src/services/admin.service.ts` |
| API base URL helpers | `frontend/src/lib/api.ts` |
| Frontend pages | `frontend/src/app/` |

## Common Gotchas

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Backend cannot connect to DB | PostgreSQL container is stopped or `DATABASE_URL` is wrong | Run `docker start skinmate-postgres` and check `backend/.env` |
| Prisma client errors | Client was not generated after install/schema sync | Run `cd backend && npx prisma generate` |
| Tables do not exist | Schema was not pushed | Run `cd backend && npx prisma db push` |
| OCR upload fails | Missing `OCR_API_KEY` or file too large | Add key to backend `.env`; keep upload under 5 MB |
| Unknown ingredients all become `NEUTRAL` | Gemini key missing/failing or AI returned no parseable data | Check `GEMINI_API_KEY` and backend logs |
| Frontend calls wrong API URL | `NEXT_PUBLIC_API_URL` missing or incorrect | Set it to `http://localhost:5000/api/v1` |
| Login rejected for a real account | User may be locked | Check `isActive` in DB/admin users page |
| Admin page redirects | Logged-in user role is not `ADMIN` | Use/admin-create an admin account |
| Recommendation seems small | Current service returns up to 3 products, not all safe products | This is expected from `product.service.ts` |

## Current Caveats From Code

- Many source comments and UI strings contain mojibake-looking Vietnamese text. This documentation records behavior without changing code.
- `notification.controller.ts` creates its own `PrismaClient` instead of using `utils/prisma.ts`.
- `product.service.ts` creates its own `PrismaClient` instead of using `utils/prisma.ts`.
- `exceljs` is installed but Excel service currently uses `xlsx`.
- There is no Prisma migrations folder; docs and setup use `prisma db push`.
- `report.tex` is a large report artifact and is not part of runtime code.
