# SKINMATE - System Architecture

> **Last Updated:** April 29, 2026

## 1. High-Level Overview

SKINMATE follows a **Client-Server architecture** using a **Layered Pattern** to separate concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 16)                   │
│   App Router · TailwindCSS v4 · React 19 · TypeScript       │
│   Luxury Design System · Glassmorphism · Recharts           │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / REST (JSON) over localhost:5000
┌──────────────────────▼──────────────────────────────────────┐
│                     BACKEND (Express.js 4)                  │
│   Node.js · TypeScript · JWT Auth · bcryptjs               │
│   Layered: Routes → Middlewares → Controllers → Services    │
└──────────────────────┬──────────────────────────────────────┘
                       │  Prisma ORM
┌──────────────────────▼──────────────────────────────────────┐
│                DATABASE (PostgreSQL 15 via Docker)          │
│   Users · Ingredients · IngredientRules · Products ·        │
│   ProductIngredients · AnalysisHistory                      │
└─────────────────────────────────────────────────────────────┘
```

* **Frontend:** Next.js (App Router) with TailwindCSS v4 — Responsible for UI/UX (Luxury Design System) and client-side logic.
* **Backend:** Node.js + Express.js — Responsible for business logic, database orchestration, and security.
* **Database:** PostgreSQL 15 via Prisma ORM running in Docker.

## 2. Backend Layered Architecture

Each module in the Backend follows this strict flow:

```
Request → Router → Middleware(s) → Controller → Service → Prisma → DB
```

| Layer | File Pattern | Responsibility |
|-------|-------------|----------------|
| **Router** | `*.routes.ts` | Maps URLs to controller methods |
| **Middleware** | `*.middleware.ts` | Handles Auth (JWT validation), Admin role checks, and Rate Limiting |
| **Controller** | `*.controller.ts` | Extracts request params, calls service, formats HTTP response. **No business logic.** |
| **Service** | `*.service.ts` | Core business logic — analysis engine, safety filtering, password hashing, etc. |
| **Prisma** | `utils/prisma.ts` | Singleton database client. Pure data access. |
| **Utils** | `utils/*.ts` | Shared helpers — `prisma.ts` (DB client), `gemini.ts` (Gemini AI client) |

## 3. Backend Module Map

| Module | Routes | Controller | Service |
|--------|--------|------------|---------|
| Auth | `/api/v1/auth` | `auth.controller.ts` | `auth.service.ts` |
| User Profile | `/api/v1/users` | `user.controller.ts` | `user.service.ts` |
| Analysis | `/api/v1/analysis` | `analysis.controller.ts` | `analysis.service.ts` |
| Products | `/api/v1/products` | `product.controller.ts` | `product.service.ts` |
| History | `/api/v1/history` | `history.controller.ts` | *(inline Prisma calls)* |
| Admin | `/api/v1/admin` | `admin.controller.ts` | `admin.service.ts` |

## 4. Frontend Structure

```
src/
├── app/           ← Next.js App Router (file-based pages)
├── components/    ← Shared UI components (Navbar, ProductCard, etc.)
└── context/       ← Global state (AuthContext — stores logged-in user)
```

* **App Router (Next.js):** Every `page.tsx` inside `app/` auto-becomes a URL route.
* **AuthContext:** A React Context that holds the current user's `token`, `role`, and `skinType`. Persists to `localStorage` so users stay logged in on refresh.
* **Admin Guard:** `AdminProtectedRoute.tsx` wraps all admin pages and redirects non-admin users.

## 5. Key Algorithm: The INCI Analysis Engine

```
POST /api/v1/analysis/check
  Body: { "inciString": "Water, Glycerin, Niacinamide, ..." }

Step 1 — Parse & Normalize:
  - Split by comma
  - Trim whitespace from each token
  - Lowercase for DB matching (preserve original casing for display)

Step 2 — Database Lookup:
  - Batch query Ingredient table: WHERE name IN (normalizedList)
  - For matched ingredients: JOIN IngredientRule WHERE skinType = user.skinType

Step 3 — AI Fallback for Missing Ingredients:
  - Ingredients NOT found in DB → call Gemini 1.5 Flash API
  - Gemini returns { mappedName, effect, description } for each unknown ingredient
  - Results are upserted into Ingredient + IngredientRule tables (auto-caching)
  - If Gemini API fails → default to NEUTRAL (graceful degradation)

Step 4 — Classify Each Ingredient:
  - Found in DB + has rule → return rule.effect (GOOD / BAD / NEUTRAL)
  - Found in DB + no rule for this skin type → NEUTRAL
  - AI result available → return AI effect + description
  - Complete fallback → NEUTRAL

Step 5 — Persist:
  - Save rawInput + userId to AnalysisHistory

Step 6 — Respond:
  - Return array of { originalName, mappedName, effect, description }
```

## 6. Key Algorithm: Safety-First Product Recommendations

```
GET /api/v1/products/recommendations

Step 1 — Fetch ALL products with their ingredients + rules for user's skin type
Step 2 — Filter: keep only products where ZERO ingredients have effect = BAD
Step 3 — Return: { id, name, brand, imageUrl } for all safe products
```

This is a **strict exclusion filter** — no scoring or ranking. Any single BAD ingredient disqualifies the entire product.

## 7. Security Model

| Concern | Mechanism |
|---------|-----------|
| Password storage | `bcryptjs` (salted hash, 10 rounds) |
| Session management | JWT signed with `JWT_SECRET`, expires in 24h |
| Route protection | `authMiddleware` validates Bearer token on every protected route |
| Admin-only routes | `adminMiddleware` enforces `role === 'ADMIN'` after auth check |
| Locked accounts | `loginUser` checks `isActive` field and throws before issuing a token |
| SQL injection | Prisma ORM uses parameterized queries exclusively |
| Rate limiting | `analysisRateLimiter` (express-rate-limit): 25 calls/24h per user; unlimited for ADMINs; grouped by `userId` (or IP if unauthenticated) |

## 8. Database Engine Choice

PostgreSQL 15 was chosen as the database engine for:
- Strong relational integrity (foreign keys, cascade deletes)
- Native UUID support
- Familiar SQL semantics for the Prisma ORM
- Easy local development via Docker (`skinmate-postgres` container)

## 9. External Integrations

| Service | Purpose | File |
|---------|---------|------|
| **Gemini 1.5 Flash** (Google AI) | AI-powered fallback ingredient analysis | `src/utils/gemini.ts` |

Gemini is used **only as a fallback** when an ingredient is not found in the local database. Results are auto-cached to the DB to minimize future API calls.
