# 👋 GENERAL.md — New Member Onboarding Guide

> **Purpose:** Get you fully up to speed on SKINMATE in ~30 minutes of focused reading.  
> **Last Updated:** April 29, 2026  
> **Who this is for:** Anyone joining the team for the first time.

---

## ⏱️ Reading Order (Do These In Sequence)

Follow this exact path. Each step takes ~3–5 minutes:

| Step | File | What You'll Learn |
|------|------|-------------------|
| 1 | 📄 **This file** (`GENERAL.md`) | Big picture, flow, and where everything lives |
| 2 | [`STATUS.md`](./STATUS.md) | Full annotated file tree + feature list + setup guide |
| 3 | [`docs/CONTEXT.md`](./docs/CONTEXT.md) | Why the project exists, core business logic rules |
| 4 | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | How the 3 layers talk to each other; algorithms |
| 5 | [`docs/DATABASE.md`](./docs/DATABASE.md) | Every database table, field, and relationship |
| 6 | [`docs/API_SPEC.md`](./docs/API_SPEC.md) | Every API endpoint, inputs, outputs, and auth |
| 7 | [`docs/PROJECT-RULES.md`](./docs/PROJECT-RULES.md) | Coding standards to follow when writing code |
| 8 | [`docs/features/`](./docs/features/) | Deep-dive specs for each feature (read as needed) |
| 9 | **Code** | `backend/src/index.ts` → then trace routes → services |

---

## 🧭 What Is SKINMATE?

**SKINMATE** is a luxury skincare ingredient analysis web app. In plain English:

- A user pastes the ingredient list (INCI string) from the back of any skincare product.
- The system looks up each ingredient against a curated safety database.
- For every ingredient, it tells the user: **GOOD** 🌿, **BAD** 🌸, or **NEUTRAL** ☁️ — based on their personal skin type (Oily, Dry, Sensitive, Combination, Normal).
- It then recommends products that are **100% free of BAD ingredients** for that skin type.
- If an ingredient is not in the database, **Google Gemini AI** evaluates it as a fallback and caches the result for future speed.

> Think of it as a smart, personalized "ingredient safety checker" for cosmetics.

---

## 🗂️ Project Structure at a Glance

```
SKINMATE/
├── GENERAL.md          ← You are here
├── STATUS.md           ← Full annotated file tree & setup guide
├── .gitignore
│
├── docs/               ← All design docs (read these first before touching code)
│   ├── README.md
│   ├── CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API_SPEC.md
│   ├── PROJECT-RULES.md
│   └── features/       ← Per-feature specs (01-auth, 02-profile, ..., 08-design-system)
│
├── backend/            ← Node.js + Express API server (port 5000)
│   ├── .env            ← Secret keys (DB URL, JWT secret, Gemini API key)
│   ├── prisma/
│   │   ├── schema.prisma   ← Database blueprint
│   │   ├── seed.ts         ← Sample data loader
│   │   └── migrations/     ← DB change history
│   └── src/
│       ├── index.ts        ← Entry point: boots server, mounts all routes
│       ├── routes/         ← URL definitions
│       ├── middlewares/    ← Auth guard, admin guard, rate limiter
│       ├── controllers/    ← Request handlers (no logic, just I/O formatting)
│       ├── services/       ← Business logic (the real brains)
│       ├── utils/          ← Prisma DB client, Gemini AI client
│       └── tests/          ← Jest unit/integration tests
│
└── frontend/           ← Next.js 16 website (port 3000)
    └── src/
        ├── app/        ← Pages (file-based routing: folder = URL path)
        ├── components/ ← Navbar, ProductCard, ProtectedRoute, etc.
        └── context/    ← AuthContext (stores logged-in user globally)
```

---

## 🔄 The Full Application Flow

Understanding this flow is the most important thing. Once you get this, everything else clicks.

### 1. User Journey (Frontend → Backend → DB)

```
[Browser: localhost:3000]
        │
        ▼ User registers / logs in
[POST /api/v1/auth/register or /login]
        │
        ▼ Backend issues a JWT token (valid 24 hours)
[Frontend stores token in localStorage via AuthContext]
        │
        ▼ User sets their skin type (Oily / Dry / Sensitive / etc.)
[PUT /api/v1/users/profile]
        │
        ▼ User pastes an INCI ingredient list & clicks "Analyze"
[POST /api/v1/analysis/check]  ← protected by authMiddleware + analysisRateLimiter
        │
        ▼ Backend's Analysis Service runs the pipeline:
        │   1. Split & normalize ingredients (lowercase)
        │   2. Batch-query DB for known ingredients + rules for user's skinType
        │   3. Unknown ingredients? → Call Gemini AI → cache results in DB
        │   4. Build result array: { originalName, mappedName, effect, description }
        │   5. Save raw input to AnalysisHistory
        │
        ▼ Frontend renders color-coded ingredient badges
        │
        ▼ Frontend also calls [GET /api/v1/products/recommendations]
        │   Backend filters ALL products: exclude any with a BAD ingredient for this skin type
        │
        ▼ "Recommended for You" product cards appear below results
```

### 2. Admin Flow

```
[Admin user logs in → role = 'ADMIN' in JWT payload]
        │
        ▼ All /api/v1/admin/* routes are protected by authMiddleware + adminMiddleware
        │
        ├── Manage Ingredients → GET/POST/PUT/DELETE /api/v1/admin/ingredients
        ├── Manage Safety Rules → GET/POST/DELETE /api/v1/admin/rules
        ├── Manage Products → GET/POST/PUT/DELETE /api/v1/admin/products
        ├── Manage Users → GET /admin/users | PATCH .../status | DELETE .../id
        └── View Reports → GET /api/v1/admin/reports (totals + skin type distribution pie chart)
```

---

## 🗄️ Database Relationships (Plain English)

There are **5 tables**. Here's how they relate:

```
User ──────────────── AnalysisHistory
  (one user has many past analyses)

Ingredient ──────────── IngredientRule
  (one ingredient has many rules, one per skin type)
  (e.g., "salicylic acid" is BAD for DRY, GOOD for OILY)

Ingredient ←────── ProductIngredient ──────→ Product
  (many-to-many: a product has many ingredients; an ingredient appears in many products)
```

**Key data rule:** Ingredient names are **always stored in lowercase**. The analysis engine normalizes input to lowercase before querying. This ensures "Niacinamide" and "niacinamide" always match correctly.

---

## 🧱 Backend Layer Responsibilities

Every request travels through **4 layers** in order:

```
HTTP Request
    │
    ▼  routes/*.routes.ts
    │  → "Which controller function handles this URL?"
    │
    ▼  middlewares/*.middleware.ts
    │  → auth.middleware.ts: "Is there a valid JWT token?" (blocks if not logged in)
    │  → admin.middleware.ts: "Is the user an ADMIN?" (blocks non-admins on admin routes)
    │  → rateLimit.middleware.ts: "Has this user exceeded 25 analyses today?" (blocks if yes)
    │
    ▼  controllers/*.controller.ts
    │  → Unpack req.body / req.params → call the right service → format the JSON response
    │  → NO business logic here. It is only I/O formatting.
    │
    ▼  services/*.service.ts
       → THIS is where real work happens:
         - analysis.service.ts: INCI parsing, DB lookup, Gemini AI call, result assembly
         - auth.service.ts: password hashing (bcrypt), JWT creation, lock check
         - product.service.ts: safety-first filtering (exclude BAD ingredient products)
         - admin.service.ts: CRUD for ingredients/rules/products, user management, reports
         - user.service.ts: profile read/update
```

---

## 🤖 Gemini AI Integration (How It Works)

This is a key feature added to enhance analysis quality:

| Step | What Happens |
|------|-------------|
| 1 | User submits INCI string |
| 2 | Backend queries local DB for all ingredients |
| 3 | Some ingredients are **not in the DB** (niche or new cosmetics) |
| 4 | Those unknown names are sent to **Gemini 1.5 Flash API** (`src/utils/gemini.ts`) |
| 5 | Gemini returns `{ mappedName, effect, description }` for each |
| 6 | Results are **upserted into DB** (Ingredient + IngredientRule tables) — cached forever |
| 7 | If Gemini API is unreachable → graceful fallback to **NEUTRAL** |

**Why this matters:** Without AI, all unknown ingredients show as NEUTRAL (unknown). With AI, the system gives a real safety verdict even for rare ingredients. Each AI result is cached permanently, so the second time anyone asks about the same ingredient, it comes from the local DB — no API cost.

**Rate Limiting:** To prevent abuse of the Gemini API (which costs money), standard users are limited to **25 analyses per 24-hour window**. ADMIN users have no limit.

---

## 🔐 Security At a Glance

| What | How |
|------|-----|
| Passwords | Hashed with `bcryptjs` (10 salt rounds). Plain text is **never stored**. |
| Sessions | JWT token, signed with `JWT_SECRET`, expires in 24h. Stored in browser `localStorage`. |
| Protected routes | `authMiddleware` checks `Authorization: Bearer <token>` on every private endpoint. |
| Admin routes | `adminMiddleware` additionally checks `role === 'ADMIN'` in the token payload. |
| Locked accounts | `isActive: false` on a User row = login is rejected, even with correct password. |
| SQL injection | Prisma ORM uses parameterized queries exclusively. Raw SQL is never used. |
| Rate limiting | `express-rate-limit` on the analysis endpoint. Keyed by `userId` (or IP if unauthenticated). |

---

## 🎨 Frontend Design System (Quick Summary)

The UI follows a "luxury beauty" aesthetic. Key rules:

| Element | Rule |
|---------|------|
| Fonts | **Playfair Display** (serif) for headings; **Inter** (sans-serif) for body |
| Colors | Dusty rose (BAD), sage green (GOOD), soft gray (NEUTRAL) — NO plain red/green |
| Cards | Glassmorphism: `bg-white/70 backdrop-blur-lg rounded-3xl` |
| Backgrounds | Gradient aura blobs (blurred `rose-200` circles behind content) |
| Buttons | `rounded-full`, rose gradient; hover scale transform |
| Styling | **TailwindCSS v4 classes ONLY** — no inline styles, ever |

Pages and their URLs:
| URL | File | Description |
|-----|------|-------------|
| `/` | `app/page.tsx` | Home / Landing |
| `/login` | `app/login/page.tsx` | Login form |
| `/register` | `app/register/page.tsx` | Registration form |
| `/profile` | `app/profile/page.tsx` | View & edit skin type |
| `/analysis` | `app/analysis/page.tsx` | INCI analysis + recommendations |
| `/history` | `app/history/page.tsx` | Past analyses, re-analyze, delete |
| `/admin` | `app/admin/page.tsx` | Admin dashboard (ADMIN only) |

---

## 🛠️ How to Run Locally (TL;DR)

```bash
# 1. Start database (Docker must be running)
docker start skinmate-postgres

# 2. Start backend (new terminal)
cd backend && npm run dev
# → http://localhost:5000

# 3. Start frontend (another terminal)
cd frontend && npm run dev
# → http://localhost:3000

# 4. (Optional) Visual DB browser
cd backend && npx prisma studio
# → http://localhost:5555
```

**First time only** (after cloning the repo):
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npx prisma db seed
```
```bash
cd frontend
npm install
```

**Required `backend/.env`:**
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
GEMINI_API_KEY="your_key_here"
```
> ⚠️ The `.env` file is never committed to Git. Ask a senior team member for the actual keys.

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests use **Jest + Supertest** and mock the Prisma database client. They cover:
- Auth (register, login, locked account)
- Auth middleware (invalid/missing token)
- User profile endpoints
- INCI analysis parsing & rule matching
- Product safety-first filtering
- History retrieval & deletion
- Admin CRUD & role authorization

---

## 📌 Key Conventions to Remember

1. **Ingredient names = always lowercase** in the DB and all queries.
2. **Services contain all business logic** — controllers are thin I/O wrappers.
3. **No inline styles** — TailwindCSS v4 utility classes only.
4. **No `any` type** — TypeScript strict typing throughout.
5. **Always `async/await` with `try/catch`** — no `.then()/.catch()` chains.
6. **Early returns (guard clauses)** at the top of functions — no deep nesting.
7. **Never modify `schema.prisma`** without team confirmation — migrations are permanent.
8. **Never commit `.env`** — it contains secrets.

---

## ❓ Quick Reference: "Where is X?"

| I want to... | Look here |
|-------------|-----------|
| Understand business rules | `docs/CONTEXT.md` |
| See the DB schema | `docs/DATABASE.md` or `backend/prisma/schema.prisma` |
| Find an API endpoint | `docs/API_SPEC.md` |
| Trace how analysis works | `backend/src/services/analysis.service.ts` |
| See how Gemini AI is called | `backend/src/utils/gemini.ts` |
| Change a page's UI | `frontend/src/app/<page-name>/page.tsx` |
| Add a shared component | `frontend/src/components/` |
| Check who's logged in globally | `frontend/src/context/AuthContext.tsx` |
| Add a new backend endpoint | `routes/` → `controllers/` → `services/` (in that order) |
| Browse the database visually | Run `npx prisma studio` → `http://localhost:5555` |
| Run all tests | `cd backend && npm test` |

---

*Welcome to the team. The codebase is clean, well-documented, and follows consistent patterns. If something is unclear, this file and `STATUS.md` are your first stops. 🚀*
