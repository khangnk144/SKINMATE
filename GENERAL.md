# 👋 GENERAL.md — New Member Onboarding Guide

> **Purpose:** Get you fully up to speed on SKINMATE over your first 3 days.  
> **Last Updated:** April 29, 2026  
> **Who this is for:** Anyone joining the team for the first time.

---

## 📅 3-Day Reading Plan

### Day 1: Understand the "What" and "Why" (Documentation Only)

| Order | Time | File | What You'll Learn |
|-------|------|------|-------------------|
| 1 | 15 min | 📄 **This file** (`GENERAL.md`) | Big picture, architecture overview, and how all the pieces connect |
| 2 | 20 min | [`STATUS.md`](./STATUS.md) | Annotated file tree with explanations of every single file and folder |
| 3 | 10 min | [`docs/CONTEXT.md`](./docs/CONTEXT.md) | Why the project exists, target audience, core business logic rules |
| 4 | 15 min | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | How the 3 layers (frontend → backend → DB) talk; key algorithms |
| 5 | 15 min | [`docs/DATABASE.md`](./docs/DATABASE.md) | All 6 database tables, every field, and relationships between them |
| 6 | 15 min | [`docs/API_SPEC.md`](./docs/API_SPEC.md) | Every backend API endpoint — URL, method, auth, request/response |
| 7 | 10 min | [`docs/PROJECT-RULES.md`](./docs/PROJECT-RULES.md) | Coding standards, naming conventions, anti-patterns to avoid |

**End of Day 1 Goal:** You should be able to explain in your own words: what SKINMATE does, how the user flow works from registration to analysis, what each database table stores, and what API endpoints exist.

---

### Day 2: Read the Backend Code (Trace Real Request Flows)

Read each file in the order listed. **Don't just skim — trace the data flow.**

| Order | Time | File | Focus On |
|-------|------|------|----------|
| 1 | 10 min | `backend/prisma/schema.prisma` | Compare this to what you read in `DATABASE.md`. This is the single source of truth. |
| 2 | 5 min | `backend/src/index.ts` | Entry point. See how Express boots, middleware loads, and routes mount. |
| 3 | 5 min | `backend/src/utils/prisma.ts` | The singleton DB connection used everywhere. |
| 4 | 10 min | `backend/src/middlewares/auth.middleware.ts` | How JWT tokens are validated. Note the `AuthRequest` interface — it extends Express's `Request` with a `user` object. |
| 5 | 5 min | `backend/src/middlewares/admin.middleware.ts` | Simple role check that runs AFTER auth middleware. |
| 6 | 5 min | `backend/src/middlewares/rateLimit.middleware.ts` | Rate limiting config: 25/day per user, ADMIN exempt. |
| 7 | 10 min | `backend/src/services/auth.service.ts` | **Read carefully.** Password hashing with bcrypt, JWT creation, locked account check. |
| 8 | 5 min | `backend/src/routes/analysis.routes.ts` | Only 1 line of routing logic — but it chains 3 middlewares. |
| 9 | 20 min | `backend/src/services/analysis.service.ts` | ⭐ **THE MOST IMPORTANT FILE.** The INCI analysis engine. Read every line. |
| 10 | 15 min | `backend/src/utils/gemini.ts` | How Gemini AI is called: the prompt construction, API call, JSON parsing, error handling. |
| 11 | 10 min | `backend/src/controllers/analysis.controller.ts` | See how the controller is a thin wrapper: validate input → call service → save history → respond. |
| 12 | 10 min | `backend/src/services/product.service.ts` | The safety-first filter algorithm. Short but critical. |
| 13 | 10 min | `backend/src/services/admin.service.ts` | CRUD operations, user management, report aggregation. |
| 14 | 15 min | `backend/src/tests/` (browse any 2-3 files) | See how Jest mocks Prisma and tests each service/controller. |
| 15 | 10 min | `docs/features/01-auth.md` through `08-design-system.md` | Skim each feature spec. Match what you read in code with what's in the spec. |

**End of Day 2 Goal:** You should be able to trace a full analysis request from `POST /api/v1/analysis/check` all the way through routes → middleware → controller → service → Prisma → Gemini → response. You should understand **why** the code is structured in layers.

---

### Day 3: Read the Frontend Code + Run Everything Locally

| Order | Time | File | Focus On |
|-------|------|------|----------|
| 1 | 15 min | Set up locally | Follow the [setup instructions](#️-how-to-run-locally) below. Get backend + frontend + DB running. |
| 2 | 10 min | `frontend/src/app/layout.tsx` | Root layout: font loading, AuthProvider wrapping, header/footer structure. |
| 3 | 15 min | `frontend/src/context/AuthContext.tsx` | **Critical.** How login state is stored in React Context + localStorage. Read every line. |
| 4 | 10 min | `frontend/src/components/Navbar.tsx` | Conditional rendering based on auth state and role. Mobile hamburger menu. |
| 5 | 5 min | `frontend/src/components/ProtectedRoute.tsx` | How unauthenticated users get redirected to `/login`. |
| 6 | 5 min | `frontend/src/components/AdminProtectedRoute.tsx` | Same pattern, but also checks `role === 'ADMIN'`. |
| 7 | 15 min | `frontend/src/app/analysis/page.tsx` | The main user-facing page. See how it calls the API, renders results, shows recommendations. |
| 8 | 10 min | `frontend/src/app/login/page.tsx` | Auth form: how tokens are received and stored via `useAuth().login()`. |
| 9 | 10 min | `frontend/src/app/history/page.tsx` | History list, re-analyze flow, delete with confirmation. |
| 10 | 10 min | `frontend/src/app/admin/` (browse layout + any 1 page) | Admin sidebar layout, data table patterns, confirmation modals. |
| 11 | 15 min | `frontend/src/app/globals.css` | TailwindCSS config and custom styles. Note the luxury design tokens. |
| 12 | 30 min | **Use the app!** | Register, set skin type, paste an INCI string, see results, check history, try admin panel. |

**End of Day 3 Goal:** You should be able to make a small UI change (e.g., change a button label or add a field to a form) and see it reflected live. You should understand how the frontend calls the backend and how auth state flows through the app.

---

## 🧭 What Is SKINMATE?

**SKINMATE** is a luxury skincare ingredient analysis web app. Here's the user story:

1. A user **registers** and sets their **skin type** (Oily, Dry, Sensitive, Combination, Normal).
2. They **paste the ingredient list** (called an "INCI string") from the back of any skincare product.
3. The system **looks up each ingredient** in a curated database and tells the user whether each one is **GOOD** 🌿, **BAD** 🌸, or **NEUTRAL** ☁️ — specifically for *their* skin type.
4. If an ingredient is **not in the database**, the system calls **Google Gemini AI** to evaluate it, then **caches the result** so future lookups are instant.
5. It then **recommends products** that contain zero BAD ingredients for the user's skin type.
6. Users can **view their analysis history**, re-run past analyses, or delete entries.
7. **Admin users** manage the ingredient database, safety rules, products, user accounts, and view usage statistics.

> Think of it as a personalized "ingredient safety scanner" for cosmetics — like Yuka, but specifically for skincare and skin type.

---

## 🗂️ Project Structure at a Glance

```
SKINMATE/
├── GENERAL.md          ← You are here (onboarding guide)
├── STATUS.md           ← Full annotated file tree & feature list
├── .gitignore
│
├── docs/               ← Design docs (read BEFORE touching code)
│   ├── README.md           ← Quick start + doc reading order
│   ├── CONTEXT.md          ← Business logic rules & target audience
│   ├── ARCHITECTURE.md     ← System design, algorithms, security model
│   ├── DATABASE.md         ← Complete DB schema documentation
│   ├── API_SPEC.md         ← All REST API endpoints
│   ├── PROJECT-RULES.md    ← Coding conventions
│   └── features/           ← Per-feature specs (01 through 08)
│
├── backend/            ← Express.js API server (port 5000)
│   ├── .env                ← Secrets: DATABASE_URL, GEMINI_API_KEY
│   ├── prisma/
│   │   ├── schema.prisma       ← Database blueprint (THE source of truth)
│   │   ├── seed.ts             ← Populates DB with sample data
│   │   └── migrations/         ← Permanent record of every DB change
│   └── src/
│       ├── index.ts            ← Entry point: creates Express app, mounts routes
│       ├── routes/             ← Maps URLs → controllers (thin wiring)
│       ├── middlewares/        ← Auth guard, admin guard, rate limiter
│       ├── controllers/        ← Validates input, calls service, sends response
│       ├── services/           ← ⭐ ALL business logic lives here
│       ├── utils/              ← prisma.ts (DB client) + gemini.ts (AI client)
│       └── tests/              ← Jest unit tests
│
└── frontend/           ← Next.js 16 website (port 3000)
    └── src/
        ├── app/            ← Pages (folder name = URL path)
        ├── components/     ← Reusable UI: Navbar, ProductCard, route guards
        └── context/        ← AuthContext (login state for the whole app)
```

---

## 🔄 The Full Application Flow (Step by Step)

### User Journey

```
[User opens browser → localhost:3000]
        │
        ▼ Clicks "Join Now"
[POST /api/v1/auth/register]
  → auth.service.ts: validate → hash password (bcrypt, 10 rounds) → save to User table
  → Returns: { id, username, skinType, role }
        │
        ▼ User logs in
[POST /api/v1/auth/login]
  → auth.service.ts: find user → check isActive (locked?) → compare password hash
  → Generate JWT: { userId, role, skinType } signed with JWT_SECRET, expires 24h
  → Returns: { token, user }
        │
        ▼ Frontend calls useAuth().login(token, user)
  → Saves token + user JSON to localStorage
  → AuthContext re-renders entire app with logged-in state
  → Navbar shows: Analysis, History, Profile, Logout (+ Admin Panel if ADMIN)
        │
        ▼ User visits /profile → sets skin type
[PUT /api/v1/users/profile]  ← authMiddleware checks JWT
        │
        ▼ User visits /analysis → pastes INCI string → clicks "Analyze"
[POST /api/v1/analysis/check]
  Middleware chain: authMiddleware → analysisRateLimiter → checkAnalysis controller
        │
        ▼ Controller validates input → calls analyzeIngredients(inciString, skinType)
        │
        ▼ analysis.service.ts runs the pipeline:
        │   Step 1: Split by comma, trim whitespace, lowercase for DB matching
        │   Step 2: Batch query — SELECT * FROM Ingredient WHERE name IN (...)
        │   Step 3: For matched ingredients → JOIN IngredientRule WHERE skinType = user's type
        │   Step 4: Unmatched ingredients? → Send to Gemini AI → get {effect, description}
        │   Step 5: Upsert AI results into Ingredient + IngredientRule tables (cached forever)
        │   Step 6: Build result array: [{ originalName, mappedName, effect, description }, ...]
        │
        ▼ Controller saves rawInput to AnalysisHistory table
        ▼ Returns JSON array of results to frontend
        │
        ▼ Frontend renders color-coded badges (rose=BAD, green=GOOD, gray=NEUTRAL)
        │
        ▼ Frontend also calls [GET /api/v1/products/recommendations]
        │   → product.service.ts: fetch ALL products with ingredients+rules
        │   → Filter: keep only products with ZERO BAD ingredients for this skin type
        │   → Return safe products as cards below the analysis results
```

### Admin Journey

```
[Admin logs in → JWT payload includes role: 'ADMIN']
        │
        ▼ Navbar shows green "Admin Panel" link
        ▼ All /api/v1/admin/* routes require: authMiddleware + adminMiddleware
        │
        ├── /admin/ingredients — CRUD for the ingredient database
        │     POST auto-normalizes name to lowercase
        │     DELETE cascades to rules + product links
        │
        ├── /admin/rules — Manage safety rules
        │     POST uses upsert: update if (ingredientId + skinType) exists, else create
        │
        ├── /admin/products — Manage products with INCI string input
        │     Frontend parses INCI string → sends ingredientNames[] to backend
        │     Backend auto-creates unknown ingredients via findOrCreateIngredients()
        │
        ├── /admin/users — Lock/unlock/delete user accounts
        │     PATCH toggles isActive (locked users can't login)
        │     DELETE cascades to all user's history
        │
        └── /admin/reports — Dashboard stats
              totalUsers, totalAnalyses, skinTypeDistribution (for pie chart)
```

---

## 🧱 Backend Architecture: The 4-Layer Pattern

Every HTTP request passes through exactly 4 layers. **This is the most important architectural concept to internalize.**

### Layer 1: Routes (`src/routes/*.routes.ts`)

Routes are pure wiring — they just say "this URL goes to this function, with these middlewares."

**Real example** from `analysis.routes.ts` (the entire file is 11 lines):
```typescript
import { Router } from 'express';
import { checkAnalysis } from '../controllers/analysis.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { analysisRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
router.post('/check', authMiddleware, analysisRateLimiter, checkAnalysis);
export default router;
```
Notice: the middleware chain reads left-to-right: first check JWT → then check rate limit → then run controller.

### Layer 2: Middlewares (`src/middlewares/*.middleware.ts`)

Middlewares are "guards" that run before the controller. They can block the request or attach data to it.

**`auth.middleware.ts`** — What it actually does:
```typescript
// 1. Check if Authorization header exists and starts with "Bearer "
// 2. Extract the token string
// 3. Verify it with jwt.verify(token, JWT_SECRET)
// 4. Attach decoded payload to req.user = { userId, role, skinType }
// 5. Call next() to proceed to the next middleware/controller
// If anything fails → return 401 Unauthorized
```

**`rateLimit.middleware.ts`** — Key details:
- Window: 24 hours
- Limit: 25 calls per user (keyed by `userId`, not IP)
- ADMIN users: skip the limit entirely
- Error message is in **Vietnamese** (this is intentional — target audience)

### Layer 3: Controllers (`src/controllers/*.controller.ts`)

Controllers are thin I/O wrappers. They **never** contain business logic. Pattern:
```
1. Extract data from req.body / req.params / req.user
2. Validate inputs (return 400 if invalid)
3. Call the appropriate service function
4. Format and send the HTTP response (200, 201, etc.)
5. Catch errors and return 500
```

**Real example** — `analysis.controller.ts` does exactly this:
```typescript
export const checkAnalysis = async (req: AuthRequest, res: Response) => {
  // 1. Extract
  const { inciString } = req.body;
  // 2. Validate
  if (!inciString || typeof inciString !== 'string') { res.status(400)... }
  // 3. Call service
  const results = await analyzeIngredients(inciString, skinType);
  // 4. Side-effect: save to history
  await prisma.analysisHistory.create({ data: { userId, rawInput: inciString } });
  // 5. Respond
  res.status(200).json(results);
};
```

### Layer 4: Services (`src/services/*.service.ts`)

**This is where ALL the real work happens.** Services contain business logic and talk to the database via Prisma.

Key services and what they do:

| Service | Key Functions | What They Do |
|---------|--------------|-------------|
| `auth.service.ts` | `registerUser()`, `loginUser()` | Hash passwords, check duplicates, check `isActive`, generate JWT tokens |
| `analysis.service.ts` | `analyzeIngredients()` | Split INCI string → batch DB query → Gemini AI fallback → build results |
| `product.service.ts` | `getSafeRecommendations()` | Fetch all products → filter out any with BAD ingredients → return safe ones |
| `user.service.ts` | `getProfile()`, `updateProfile()` | Simple Prisma read/write for user profile |
| `admin.service.ts` | CRUD functions + `getReports()` | Ingredient/rule/product management, user lock/delete, aggregate stats |

---

## 🤖 Gemini AI Integration — Deep Dive

This is the most complex part of the backend. Here's exactly how it works:

### When Is Gemini Called?
Only when `analysis.service.ts` finds ingredients that are **not in the local database**. If every ingredient is already known, Gemini is never called.

### The Prompt
The prompt is written in **Vietnamese** (because the AI's descriptions are displayed to Vietnamese users). It instructs Gemini to act as a dermatologist and evaluate each unknown ingredient for the user's specific skin type. The response format is strictly enforced as JSON.

### The Caching Strategy
After Gemini returns results:
1. Each ingredient is **upserted** into the `Ingredient` table (create if new, skip if exists)
2. A corresponding `IngredientRule` is **upserted** for the user's skin type
3. Next time ANY user asks about this ingredient for this skin type → instant DB lookup, no API call

### Error Handling
If Gemini API fails (network error, quota exceeded, invalid response), the function returns an **empty array** — and the main analysis engine defaults those ingredients to NEUTRAL. The user still gets results; they're just less specific.

### Cost Control
The rate limiter on the analysis endpoint (25/day per user) indirectly limits Gemini API usage since Gemini is only called during analysis.

---

## 🗄️ Database: The 6 Tables Explained

### Table Relationships (Visual)
```
User ─────────────────── AnalysisHistory
 │ has many                  │ stores rawInput per analysis
 │                           │
 │ fields: id mod username,  │ fields: id, userId, rawInput,
 │ passwordHash, skinType,   │ createdAt
 │ role, isActive             

Ingredient ──────────── IngredientRule
 │ has many rules             │ one rule per (ingredient + skinType)
 │                            │ effect: GOOD / BAD / NEUTRAL
 │ fields: id, name,          │
 │ description                │ UNIQUE(ingredientId, skinType)

Ingredient ←──── ProductIngredient ────→ Product
                  │ junction table         │ has many ingredients
                  │ (many-to-many)         │ fields: id, name, brand,
                  │ position: order in     │ imageUrl, createdAt
                  │ the INCI list          
```

### Key Rules to Remember
1. **Ingredient names are ALWAYS lowercase.** The analysis engine normalizes user input to lowercase before querying. This is enforced in both `analysis.service.ts` and `admin.service.ts`.
2. **One rule per (ingredient, skinType) pair.** The `@@unique([ingredientId, skinType])` constraint prevents duplicates. An ingredient can be GOOD for oily skin but BAD for dry skin — that's two separate `IngredientRule` rows.
3. **Cascade deletes everywhere.** Deleting a User deletes their history. Deleting an Ingredient deletes its rules and product links. This is enforced at the DB level via `onDelete: Cascade`.

---

## 🎨 Frontend Architecture

### How Auth Works (Frontend Side)

The `AuthContext.tsx` file is the **single most important frontend file**. It:
1. Creates a React Context that holds `{ user, token, login(), logout(), isLoading }`
2. On app load → checks `localStorage` for a saved token/user
3. On login → saves token + user to both React state and localStorage
4. On logout → clears both
5. Wraps the entire app via `<AuthProvider>` in `layout.tsx`
6. Any component can call `useAuth()` to get the current user/token

### How Pages Call the Backend

Every page that needs data follows this pattern:
```typescript
const { token } = useAuth();

const response = await fetch('http://localhost:5000/api/v1/some/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,   // ← JWT token from AuthContext
  },
  body: JSON.stringify({ someData }),
});
```

### Route Protection

- `ProtectedRoute.tsx` — Wraps pages that require login. If `user === null`, redirects to `/login`.
- `AdminProtectedRoute.tsx` — Same, but also checks `user.role === 'ADMIN'`. Redirects non-admins to home.

### Next.js File-Based Routing

In Next.js, **folder structure = URL structure**:
- `app/page.tsx` → `/` (home page)
- `app/login/page.tsx` → `/login`
- `app/analysis/page.tsx` → `/analysis`
- `app/admin/products/page.tsx` → `/admin/products`

The `layout.tsx` in a folder wraps all pages in that folder. `app/layout.tsx` wraps the **entire app** (header, footer, fonts). `app/admin/layout.tsx` adds the admin sidebar.

### Design System Summary

| Element | Implementation |
|---------|---------------|
| Fonts | **Playfair Display** (headings) + **Inter** (body), loaded via `next/font/google` in `layout.tsx` |
| Colors | Dusty rose palette (BAD), sage/emerald (GOOD), soft gray (NEUTRAL). No plain red/green. |
| Cards | Glassmorphism: `bg-white/70 backdrop-blur-lg rounded-3xl` + soft shadow |
| Backgrounds | Gradient aura: blurred `rose-200` circles positioned with `absolute` behind content |
| Buttons | `rounded-full`, rose gradient `from-rose-400 to-pink-500`, hover scale |
| Styling rule | TailwindCSS v4 classes **only**. Zero inline styles. |

---

## 🔐 Security Model

| Threat | Defense | Where in Code |
|--------|---------|--------------|
| Password theft | Hashed with `bcryptjs` (10 salt rounds). Never stored as plain text. | `auth.service.ts` |
| Session hijacking | JWT signed with `JWT_SECRET`, 24h expiry. Stored in `localStorage`. | `auth.service.ts`, `AuthContext.tsx` |
| Unauthorized access | `authMiddleware` validates JWT on every protected route | `auth.middleware.ts` |
| Privilege escalation | `adminMiddleware` checks `role === 'ADMIN'` after auth | `admin.middleware.ts` |
| Banned user bypass | `loginUser()` checks `isActive` before issuing token | `auth.service.ts` line 48 |
| SQL injection | Prisma ORM uses parameterized queries. Zero raw SQL. | All `*.service.ts` files |
| API abuse | Rate limiter: 25 analyses/24h per user, ADMIN exempt | `rateLimit.middleware.ts` |

---

## 🛠️ How to Run Locally

### Prerequisites
- **Node.js** v18+
- **Docker Desktop** (for PostgreSQL)
- **npm**

### First-Time Setup (After Cloning)
```bash
# 1. Create PostgreSQL container
docker run --name skinmate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=skinmate -p 5432:5432 -d postgres

# 2. Set up backend
cd backend
npm install
# Create .env file (see below)
npx prisma db push
npx prisma generate
npx prisma db seed

# 3. Set up frontend
cd ../frontend
npm install
```

### Required `backend/.env` File
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
GEMINI_API_KEY="ask_a_senior_team_member_for_this"
```
> ⚠️ This file is **never** committed to Git. Ask a team member for the real keys.

### Daily Startup (3 Terminals)
```bash
# Terminal 1: Start database
docker start skinmate-postgres

# Terminal 2: Start backend
cd backend && npm run dev           # → http://localhost:5000

# Terminal 3: Start frontend
cd frontend && npm run dev          # → http://localhost:3000

# (Optional) Terminal 4: Visual DB browser
cd backend && npx prisma studio     # → http://localhost:5555
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests use **Jest + Supertest** and mock Prisma (no real database needed). They cover:
- Auth: register, login, locked account rejection
- Auth middleware: missing/invalid token handling
- User profile: GET and PUT endpoints
- Analysis: INCI string parsing, rule matching, edge cases
- Products: safety-first filter verification
- History: retrieval and both deletion endpoints
- Admin: CRUD operations + 403 for non-admin users

---

## 📌 Coding Conventions (Must Follow)

1. **Ingredient names = always lowercase** in DB and all queries.
2. **Services = all business logic.** Controllers are thin I/O wrappers.
3. **TailwindCSS v4 only** — no inline styles, no plain CSS in components.
4. **No `any` type** — TypeScript strict typing everywhere. Use `unknown` if needed.
5. **`async/await` + `try/catch`** — no `.then()/.catch()` chains.
6. **Guard clauses** (early returns) — avoid deep nesting.
7. **Never modify `schema.prisma`** without team discussion — migrations are permanent.
8. **Never commit `.env`** — it contains secrets.
9. **Comments explain WHY, not WHAT** — don't comment obvious code.
10. **Single quotes** for TS strings, **double quotes** for JSX attributes.

---

## ❓ Quick Reference: "Where Do I Find X?"

| I want to... | Look here |
|-------------|-----------|
| Understand the business rules | `docs/CONTEXT.md` |
| See the database schema | `docs/DATABASE.md` or `backend/prisma/schema.prisma` |
| Find an API endpoint | `docs/API_SPEC.md` |
| Trace how analysis works end-to-end | `backend/src/services/analysis.service.ts` |
| See how Gemini AI is called | `backend/src/utils/gemini.ts` |
| Understand how login state works | `frontend/src/context/AuthContext.tsx` |
| Change a page's UI | `frontend/src/app/<page-name>/page.tsx` |
| Add a reusable component | `frontend/src/components/` |
| Add a new backend endpoint | Create in: `routes/` → `controllers/` → `services/` (in that order) |
| Browse the database visually | `cd backend && npx prisma studio` → `http://localhost:5555` |
| Run all tests | `cd backend && npm test` |
| See the full file tree with explanations | `STATUS.md` |
| Check a specific feature's spec | `docs/features/01-auth.md` through `08-design-system.md` |

---

## 🚨 Common Gotchas (Save Yourself Some Debugging Time)

| Problem | Cause | Fix |
|---------|-------|-----|
| `EADDRINUSE: port 5000` | Backend is already running or another process uses port 5000 | Kill the process: `npx kill-port 5000` |
| Frontend images broken | External image domain not allowed | Add domain to `frontend/next.config.ts` → `images.remotePatterns` |
| Analysis returns all NEUTRAL | Ingredients are not in the DB **and** Gemini API key is missing/invalid | Check `GEMINI_API_KEY` in `.env` |
| Login says "account locked" | Admin toggled `isActive: false` on that user | Use Prisma Studio to set `isActive: true`, or ask an admin |
| `Cannot find module '@prisma/client'` | Prisma client not generated | Run `cd backend && npx prisma generate` |
| Database tables don't exist | Schema not pushed to DB | Run `cd backend && npx prisma db push` |
| Tests fail with Prisma errors | Tests use mocks — ensure mock setup matches current schema | Check test file imports and mock structure |

---

*Welcome to the team! This codebase follows clean, consistent patterns. Once you internalize the 4-layer backend architecture and the AuthContext flow on the frontend, everything else will feel predictable. Use this file and `STATUS.md` as your go-to references. 🚀*
