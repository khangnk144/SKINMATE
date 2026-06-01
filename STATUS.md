# SKINMATE - Project Status

> Last verified against code: June 1, 2026

## Current State

The repository contains a working full-stack SKINMATE application with:

- Express + TypeScript backend.
- Prisma PostgreSQL schema with 9 models.
- Next.js 16 + React 19 frontend.
- Backend tests using Jest and Supertest.
- User auth, profile, analysis, recommendations, history, admin CRUD, Excel import/export, OCR, Gemini fallback, community reports, voting, and notifications.

No code changes are required to read this status file.

## File Type Glossary

| File type | Meaning in this repo |
| --- | --- |
| `.ts` | TypeScript backend source, services, controllers, routes, tests, and config |
| `.tsx` | React/Next.js pages and components |
| `.js` | JavaScript scripts/config, such as `fix-urls.js` and Jest config |
| `.mjs` | JavaScript module config files such as ESLint/PostCSS |
| `.css` | Global frontend styling through TailwindCSS |
| `.prisma` | Prisma database schema |
| `.json` | Package metadata, lockfiles, and TypeScript config |
| `.md` | Project documentation |
| `.png`, `.jpg`, `.svg` | Static images and icons |
| `.tex` | Report artifact; not runtime app code |

Special names:

- `page.tsx`: Next.js route page.
- `layout.tsx`: Next.js layout wrapper.
- `globals.css`: global frontend CSS.
- `index.ts`: backend entry point.
- `schema.prisma`: database source of truth.

## Implemented Backend Routes

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` |
| Profile | `GET /api/v1/users/profile`, `PUT /api/v1/users/profile`, `PUT /api/v1/users/change-password` |
| Analysis | `POST /api/v1/analysis/check` |
| Products | `GET /api/v1/products/recommendations` |
| History | `GET /api/v1/history`, `DELETE /api/v1/history/:id`, `DELETE /api/v1/history` |
| Ingredients | `GET /api/v1/ingredients/search?name=...` |
| Reports | `POST /api/v1/reports`, `POST /api/v1/reports/vote`, `GET /api/v1/reports/pending`, `GET /api/v1/reports/vote/:reportId`, `POST /api/v1/reports/resolve` |
| Notifications | `GET /api/v1/notifications`, `PATCH /api/v1/notifications/read-all`, `PATCH /api/v1/notifications/:id/read`, `POST /api/v1/notifications/send` |
| OCR | `POST /api/ocr/ingredients` |
| Admin | `GET /api/v1/admin/stats`, CRUD for ingredients/rules/products/users, `GET /api/v1/admin/reports`, Excel import/export |

## Implemented Frontend Pages

| Page | Purpose |
| --- | --- |
| `/` | Home page, optional health check when enabled |
| `/login` | User login |
| `/register` | User registration |
| `/profile` | Skin type, display name, password change |
| `/analysis` | INCI analysis, OCR upload, recommendations, report entry points |
| `/history` | Saved raw INCI inputs, re-run, delete |
| `/community/reports` | Browse and vote on pending ingredient reports |
| `/admin` | Admin dashboard |
| `/admin/ingredients` | Ingredient CRUD with search/pagination |
| `/admin/rules` | Ingredient rule management |
| `/admin/products` | Product management |
| `/admin/users` | User lock/unlock/delete |
| `/admin/reports` | User/analysis/skin type statistics |
| `/admin/community-reports` | Approve or reject reports |
| `/admin/import-export` | Excel import/export and delete-all actions |

## Folder Guide

```text
backend/src/index.ts
```

Express app setup, middleware setup, and route mounting.

```text
backend/src/routes/
```

Route wiring. Admin, user, report, ingredient, and notification route files use router-level middleware where appropriate.

```text
backend/src/controllers/
```

Request validation, status codes, and response formatting. Several controllers call Prisma directly for small flows.

```text
backend/src/services/
```

Business logic for auth, user profile, analysis, products, admin, Excel, and reports.

```text
backend/src/modules/ocr/
```

Self-contained OCR module. Uses multer memory upload, OCR.space, and a rule-based parser.

```text
backend/src/tests/
```

Jest/Supertest tests for auth, middleware, users, analysis, product recommendations, history, and admin routes.

```text
frontend/src/app/
```

Next.js App Router pages and layouts.

```text
frontend/src/components/
```

Shared UI and route guard components.

```text
frontend/src/context/AuthContext.tsx
```

Global client auth state.

```text
frontend/src/lib/api.ts
```

API base URL and admin pagination helpers.

## Runtime Configuration

Backend expects:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
JWT_SECRET="replace_me"
GEMINI_API_KEY="replace_me"
OCR_API_KEY="replace_me"
```

Frontend can use:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_ENABLE_HEALTH_CHECK="true"
```

## How To Start Everything

First-time local setup:

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

Daily startup after setup:

```bash
docker start skinmate-postgres
cd backend
npm run dev
```

Open another terminal:

```bash
cd frontend
npm run dev
```

Useful optional DB browser:

```bash
cd backend
npx prisma studio
```

Expected local URLs:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Prisma Studio: `http://localhost:5555`

## Scripts

Backend:

```bash
npm run dev
npm run build
npm start
npm test
```

Frontend:

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Feature Status

| Feature | Status | Code location |
| --- | --- | --- |
| Auth | Implemented | `auth.*`, `AuthContext.tsx`, login/register pages |
| Profile | Implemented | `user.*`, `/profile` |
| Analysis | Implemented | `analysis.*`, `/analysis` |
| Recommendations | Implemented | `product.*`, `ProductCard.tsx` |
| History | Implemented | `history.controller.ts`, `/history` |
| Admin CRUD | Implemented | `admin.*`, `/admin/*` |
| Admin stats | Implemented | `/admin/stats`, `/admin/reports` |
| Design system | Implemented in Tailwind classes and global CSS |
| Gemini fallback | Implemented | `utils/gemini.ts`, `analysis.service.ts` |
| Excel import/export | Implemented | `excel.*`, `/admin/import-export` |
| OCR scanning | Implemented | `modules/ocr`, `ImageOCRUploader.tsx` |
| Community reporting | Implemented | `report.*`, community/admin report pages |
| Notifications | Implemented | `notification.*`, `NotificationBell.tsx` |
| Admin pagination/search | Implemented for ingredients, rules, products, users |

## Notable Details

- Ingredient names are normalized to lowercase before DB lookup or save.
- `IngredientRule` has a unique `(ingredientId, skinType)` constraint.
- Analysis saves only raw input history, not a snapshot of result rows.
- Recommendation returns 3 products selected from a shuffled top-scoring safe pool.
- OCR endpoint is outside `/api/v1`.
- Admin list endpoints return either a legacy array or `{ items, total, page, limit }` when pagination/search params are present.
- Deployment is not represented by deployment config files in this repository, so this file does not claim a specific live deployment target.

## Next Possible Work

- Fix mojibake text in code/UI strings.
- Add frontend tests if needed.
- Replace direct `new PrismaClient()` usage in controllers/services with shared `utils/prisma.ts`.
- Decide whether `exceljs` should be removed or used.
- Add real Prisma migrations if the team moves beyond `prisma db push`.

## Current Action Items

| Status | Item |
| --- | --- |
| Done | Authentication and profile management |
| Done | Core INCI analysis and history |
| Done | Product recommendations |
| Done | Admin CRUD and admin reports |
| Done | Excel import/export |
| Done | OCR ingredient extraction |
| Done | Gemini fallback for unknown ingredients |
| Done | Community reports, voting, moderation |
| Done | In-app notifications |
| Done | Admin pagination/search |
| Possible future | Advanced filtering by product/category/brand/safety |
| Possible future | Product-level or weighted recommendation scoring |
| Possible future | Frontend automated tests |
