# SKINMATE — Project Status & Complete Guide

> **Last Updated:** May 5, 2026  
> **Current Phase:** MVP Complete — All Features Implemented & Deployed Locally

---

## Table of Contents

1. [What is SKINMATE?](#1-what-is-skinmate)
2. [File Type Glossary (What Each File Extension Does)](#2-file-type-glossary)
3. [Full Folder & File Tree (With Explanations)](#3-full-folder--file-tree)
4. [Why is the Code Structured This Way?](#4-why-is-the-code-structured-this-way)
5. [Tech Stack Summary](#5-tech-stack-summary)
6. [Completed Features](#6-completed-features)
7. [How to Start Everything](#7-how-to-start-everything)
8. [Next Action Items](#8-next-action-items)

---

## 1. What is SKINMATE?

SKINMATE is a **luxury skincare ingredient analysis web application**. Users can:
- **Register/Login** to create a personal account (locked accounts are blocked from logging in).
- **Set their skin type** (Oily, Dry, Sensitive, Combination, Normal).
- **Paste an INCI ingredient list** (the list printed on the back of skincare products) and get a color-coded safety analysis based on their skin type.
- **See product recommendations** that are safe for their skin — products with any ingredient flagged as BAD for the user's skin type are automatically excluded.
- **View and manage their analysis history** — re-analyze past entries or delete individual/all records.
- **Admin users** can manage the full database of ingredients, safety rules, and products, as well as view statistical reports and manage user accounts (lock/unlock/delete).

---

## 2. File Type Glossary

If you've never coded before, here's what each file extension means and why it exists:

### Code Files

| Extension | Full Name | What It Does |
|-----------|-----------|--------------|
| `.ts` | **TypeScript** | A programming language built on top of JavaScript. It adds "types" — like labels that say "this variable is a number" or "this is a piece of text." This prevents bugs. All backend logic is written in `.ts` files. |
| `.tsx` | **TypeScript + JSX** | Same as `.ts`, but it can also contain **HTML-like code** (called JSX). This is how React/Next.js builds the visual parts of a website — mixing logic and visual layout in one file. All frontend pages and components use `.tsx`. |
| `.js` | **JavaScript** | The original programming language of the web. Browsers can only run JavaScript natively. Some config files still use plain `.js` because they don't need TypeScript's extra features. |
| `.mjs` | **JavaScript Module** | Same as `.js` but explicitly tells the system "this file uses the modern `import/export` style." Used for config files like ESLint and PostCSS. |
| `.css` | **Cascading Style Sheets** | Controls the **visual appearance** of the website — colors, fonts, spacing, sizes, animations. Think of it as the "paint and decoration" of a house. |
| `.prisma` | **Prisma Schema** | A special file that describes your database structure in human-readable format. Prisma (a tool) reads this and creates the actual database tables for you. |
| `.svg` | **Scalable Vector Graphics** | An image format that uses math instead of pixels, so it stays sharp at any size. Used for icons and logos. |

### Configuration Files

| Extension / Name | What It Does |
|------------------|--------------|
| `.json` | **JavaScript Object Notation** — a universal format for storing structured data (like a settings file). Used for project configs (`package.json`, `tsconfig.json`). |
| `.toml` | **Tom's Obvious Minimal Language** — another settings file format, simpler than JSON. Used by Prisma for migration locks. |
| `.env` | **Environment Variables** — a secret settings file that stores sensitive info like database passwords and secret keys. **Never shared publicly.** |
| `.gitignore` | Tells Git (the version-tracking tool) which files to **NOT** track — like `node_modules/` (too big) or `.env` (too secret). |
| `.ico` | **Icon file** — the tiny image that appears in the browser tab next to your website title. |
| `.md` | **Markdown** — a simple text formatting language (like this file!). Used for documentation and README files. |

### Special Naming Conventions

| Name | What It Means |
|------|---------------|
| `page.tsx` | In Next.js, any file named `page.tsx` inside a folder under `app/` **automatically becomes a web page**. The folder name becomes the URL. |
| `layout.tsx` | A "wrapper" page in Next.js. It defines shared structure (like the navigation bar and footer) that appears on **every page**. |
| `globals.css` | The CSS file that applies styles to the **entire website**, not just one page. |
| `index.ts` | The "entry point" — the first file that runs when you start the backend server. |

---

## 3. Full Folder & File Tree

Below is every folder and file in the project. Folders marked with 📁, files with 📄.  
`node_modules/` and `.next/` are excluded (they are auto-generated and contain thousands of files).

```
SKINMATE/                          ← 🏠 ROOT: The entire project lives here
│
├── 📄 GENERAL.md                  ← New member onboarding guide (~30 min read)
├── 📄 STATUS.md                   ← This file! Documents everything about the project
├── 📄 .gitignore                  ← Root-level gitignore (excludes .env, node_modules, etc.)
├── 📄 fix-urls.js                 ← Utility script to replace hardcoded localhost URLs with env vars
│
├── 📁 docs/                       ← 📚 PROJECT DOCUMENTATION (planning & rules)
│   ├── 📄 README.md               ← Overview of documentation folder
│   ├── 📄 CONTEXT.md              ← High-level description of what SKINMATE is and its goals
│   ├── 📄 ARCHITECTURE.md         ← Explains the overall technical design decisions
│   ├── 📄 DATABASE.md             ← Describes all database tables and their relationships
│   ├── 📄 API_SPEC.md             ← Lists all backend API endpoints (URLs the frontend calls)
│   ├── 📄 PROJECT-RULES.md        ← Coding standards and rules the project follows
│   └── 📁 features/               ← Detailed specs for each feature
│       ├── 📄 01-auth.md          ← Spec for user registration & login
│       ├── 📄 02-profile.md       ← Spec for user profile & skin type management
│       ├── 📄 03-core-analysis.md ← Spec for the INCI ingredient analysis engine
│       ├── 📄 04-recommendation.md← Spec for safe product recommendations
│       ├── 📄 05-history.md       ← Spec for analysis history tracking
│       ├── 📄 06-admin-crud.md    ← Spec for admin panel (manage ingredients/rules/products)
│       ├── 📄 07-admin-users-reports.md ← Spec for admin user management & statistical reports
│       └── 📄 08-design-system.md ← Spec for the luxury UI/UX design system
│
├── 📁 backend/                    ← 🖥️ THE SERVER (processes data, talks to database)
│   ├── 📄 .env                    ← Secret settings (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)
│   ├── 📄 package.json            ← Lists all backend dependencies and run scripts
│   ├── 📄 package-lock.json       ← Auto-generated: locks exact versions of dependencies
│   ├── 📄 tsconfig.json           ← TypeScript settings for the backend
│   ├── 📄 jest.config.js          ← Settings for Jest (the testing tool)
│   ├── 📁 node_modules/           ← [AUTO-GENERATED] All downloaded library code (do NOT edit)
│   │
│   ├── 📁 prisma/                 ← 🗄️ DATABASE DEFINITION & SETUP
│   │   ├── 📄 schema.prisma       ← THE database blueprint — defines all tables & columns
│   │   └── 📄 seed.ts             ← Script to fill the database with sample/test data
│   │
│   └── 📁 src/                    ← 💻 ALL BACKEND SOURCE CODE
│       ├── 📄 index.ts            ← THE ENTRY POINT — starts the server, loads all routes
│       │
│       ├── 📁 routes/             ← 🛣️ URL DEFINITIONS (maps URLs to controller functions)
│       │   ├── 📄 auth.routes.ts      ← /api/v1/auth/register & /login
│       │   ├── 📄 user.routes.ts      ← /api/v1/users/profile (GET & PUT)
│       │   ├── 📄 analysis.routes.ts  ← /api/v1/analysis/check (POST)
│       │   ├── 📄 product.routes.ts   ← /api/v1/products/recommendations (GET)
│       │   ├── 📄 history.routes.ts   ← /api/v1/history (GET, DELETE /:id, DELETE /)
│       │   └── 📄 admin.routes.ts     ← /api/v1/admin/* (CRUD + users + reports)
│       │
│       ├── 📁 controllers/        ← 🎮 REQUEST HANDLERS (receive request → call service → send response)
│       │   ├── 📄 auth.controller.ts      ← Handles register & login requests
│       │   ├── 📄 user.controller.ts      ← Handles profile view & update requests
│       │   ├── 📄 analysis.controller.ts  ← Handles ingredient analysis requests
│       │   ├── 📄 product.controller.ts   ← Handles product recommendation requests
│       │   ├── 📄 history.controller.ts   ← Handles history retrieval & deletion requests
│       │   ├── 📄 admin.controller.ts     ← Handles all admin CRUD, user mgmt & reports
│       │   └── 📄 excel.controller.ts     ← Handles Excel file export/import (multer upload + download)
│       │
│       ├── 📁 services/           ← ⚙️ BUSINESS LOGIC (the actual "brains" — does the real work)
│       │   ├── 📄 auth.service.ts      ← Hashes passwords, creates JWT tokens, validates logins, blocks locked accounts
│       │   ├── 📄 user.service.ts      ← Reads/updates user profile data in the database
│       │   ├── 📄 analysis.service.ts  ← Parses INCI strings, looks up safety rules per skin type
│       │   ├── 📄 product.service.ts   ← Safety-first filter: excludes products with BAD ingredients for user's skin type
│       │   ├── 📄 admin.service.ts     ← CRUD for ingredients/rules/products + user management + reports
│       │   └── 📄 excel.service.ts     ← Excel import/export logic for ingredients, rules, and products
│       │
│       ├── 📁 middlewares/        ← 🔒 SECURITY GUARDS (run BEFORE a request reaches the controller)
│       │   ├── 📄 auth.middleware.ts      ← Checks if the user is logged in (valid JWT token)
│       │   ├── 📄 admin.middleware.ts     ← Checks if the user is an ADMIN (not just logged in)
│       │   └── 📄 rateLimit.middleware.ts ← Limits analysis to 25 calls/24h per user; ADMIN role is exempt
│       │
│       ├── 📁 utils/              ← 🔧 SHARED HELPERS (small reusable tools)
│       │   ├── 📄 prisma.ts           ← Creates & exports the database connection object
│       │   └── 📄 gemini.ts           ← Gemini AI client — calls Gemini 1.5 Flash for unknown ingredient analysis
│       │
│       └── 📁 tests/              ← 🧪 AUTOMATED TESTS (verify code works correctly)
│           ├── 📄 auth.controller.test.ts     ← Tests for register & login (incl. locked account)
│           ├── 📄 auth.middleware.test.ts      ← Tests for the login-check middleware
│           ├── 📄 user.routes.test.ts         ← Tests for profile endpoints
│           ├── 📄 analysis.controller.test.ts ← Tests for analysis endpoint
│           ├── 📄 analysis.service.test.ts    ← Tests for INCI parsing logic
│           ├── 📄 product.service.test.ts     ← Tests for safety-first recommendation filtering
│           ├── 📄 history.controller.test.ts  ← Tests for history GET & DELETE endpoints
│           └── 📄 admin.routes.test.ts        ← Tests for admin CRUD & authorization
│
└── 📁 frontend/                   ← 🎨 THE WEBSITE (what users see and interact with)
    ├── 📄 .gitignore              ← Files that Git should ignore in this folder
    ├── 📄 AGENTS.md               ← Instructions for AI coding assistants
    ├── 📄 CLAUDE.md               ← Additional AI assistant instructions
    ├── 📄 README.md               ← Next.js default readme
    ├── 📄 package.json            ← Lists all frontend dependencies and run scripts
    ├── 📄 package-lock.json       ← Auto-generated: locks exact dependency versions
    ├── 📄 tsconfig.json           ← TypeScript settings for the frontend
    ├── 📄 next.config.ts          ← Next.js configuration (incl. allowed image domains)
    ├── 📄 next-env.d.ts           ← Auto-generated: TypeScript type definitions for Next.js
    ├── 📄 eslint.config.mjs       ← ESLint settings (code quality checker)
    ├── 📄 postcss.config.mjs      ← PostCSS settings (processes CSS, enables TailwindCSS)
    ├── 📁 .next/                  ← [AUTO-GENERATED] Next.js build cache (do NOT edit)
    ├── 📁 node_modules/           ← [AUTO-GENERATED] Downloaded library code (do NOT edit)
    │
    ├── 📁 public/                 ← 🖼️ STATIC ASSETS (images/icons served directly to the browser)
    │   ├── 📄 file.svg            ← Default icon
    │   ├── 📄 globe.svg           ← Default icon
    │   ├── 📄 next.svg            ← Next.js logo
    │   ├── 📄 vercel.svg          ← Vercel logo
    │   ├── 📄 window.svg          ← Default icon
    │   └── 📁 images/             ← Project images (aurapink.jpg, beauty products photo, etc.)
    │
    └── 📁 src/                    ← 💻 ALL FRONTEND SOURCE CODE
        │
        ├── 📁 context/            ← 🧠 GLOBAL STATE MANAGEMENT
        │   └── 📄 AuthContext.tsx  ← Stores login state (who is logged in?) across ALL pages
        │
        ├── 📁 components/         ← 🧩 REUSABLE UI PIECES (used across multiple pages)
        │   ├── 📄 Navbar.tsx              ← The navigation bar at the top of every page
        │   ├── 📄 ProtectedRoute.tsx      ← Wrapper: redirects to login if user is NOT logged in
        │   ├── 📄 AdminProtectedRoute.tsx ← Wrapper: redirects if user is NOT an admin
        │   └── 📄 ProductCard.tsx         ← A styled card that displays one product's info
        │
        └── 📁 app/                ← 📄 PAGES (each subfolder = one URL/page on the website)
            ├── 📄 favicon.ico     ← Browser tab icon for the website
            ├── 📄 globals.css     ← Global styles that apply to every page
            ├── 📄 layout.tsx      ← Shared layout: header (navbar), footer, fonts, and AuthProvider
            ├── 📄 page.tsx        ← HOME PAGE (/) — luxury hero section with gradient aura background
            │
            ├── 📁 login/
            │   └── 📄 page.tsx    ← LOGIN PAGE (/login) — split-screen glassmorphism form
            │
            ├── 📁 register/
            │   └── 📄 page.tsx    ← REGISTER PAGE (/register) — create account form
            │
            ├── 📁 profile/
            │   └── 📄 page.tsx    ← PROFILE PAGE (/profile) — view & edit skin type
            │
            ├── 📁 analysis/
            │   └── 📄 page.tsx    ← ANALYSIS PAGE (/analysis) — paste ingredients, see safety results + recommendations
            │
            ├── 📁 history/
            │   └── 📄 page.tsx    ← HISTORY PAGE (/history) — view/delete past analyses, re-analyze
            │
            └── 📁 admin/          ← 🔐 ADMIN SECTION (only accessible by admin users)
                ├── 📄 layout.tsx  ← Admin layout with sidebar navigation
                ├── 📄 page.tsx    ← ADMIN DASHBOARD (/admin) — overview & links
                ├── 📁 ingredients/
                │   └── 📄 page.tsx ← Manage ingredients (add/edit/delete) with search
                ├── 📁 rules/
                │   └── 📄 page.tsx ← Manage safety rules (add/edit/delete) with search
                ├── 📁 products/
                │   └── 📄 page.tsx ← Manage products with INCI string input (add/edit/delete) with search
                ├── 📁 users/
                │   └── 📄 page.tsx ← Manage user accounts (lock/unlock/delete with confirmation modal)
                ├── 📁 reports/
                │   └── 📄 page.tsx ← Statistical dashboard (total users, analyses, skin type pie chart)
                └── 📁 import-export/
                    └── 📄 page.tsx ← Bulk Excel import/export + delete-all danger zone
```

---

## 4. Why is the Code Structured This Way?

### 4.1 — Why are there TWO separate folders (`backend/` and `frontend/`)?

This is called a **"Decoupled Monorepo"** architecture:

- **`backend/`** = The **server**. Think of it like the kitchen in a restaurant. Customers never see it, but it does all the real work — storing data, checking passwords, running analysis logic.
- **`frontend/`** = The **website**. Think of it like the dining room in a restaurant. It's what customers see — the menus, the plates, the decorations.

They are **separated** because:
1. **They do different jobs.** The backend handles data; the frontend handles visuals.
2. **They can be updated independently.** You can redesign the website without touching the database logic.
3. **They communicate over the internet** using "API calls" — the frontend sends requests (like "give me this user's profile") to the backend's URLs, and the backend responds with data.

### 4.2 — Why does the backend have `routes/`, `controllers/`, `services/`, and `middlewares/`?

This is called the **"Layered Architecture"** pattern. Imagine processing a letter at a post office:

1. **`routes/`** = The **mailbox slots**. Each slot has a label (URL like `/api/v1/auth/login`). When a request arrives, it gets sorted to the right slot.
2. **`middlewares/`** = The **security guards**. Before a letter reaches the office worker, guards check IDs. `auth.middleware.ts` checks "are you logged in?" and `admin.middleware.ts` checks "are you an admin?"
3. **`controllers/`** = The **front desk clerks**. They receive the letter, open it, pass the important content to the specialist, and then write the response letter back.
4. **`services/`** = The **specialists**. They do the actual intellectual work — calculating results, talking to the database, hashing passwords.

**Why split it this way?** Because if you ever need to change HOW something works (like switching from PostgreSQL to another database), you only change the service file — the routes and controllers stay the same. Each piece has ONE job, making bugs easier to find.

### 4.3 — Why does the frontend have `app/`, `components/`, and `context/`?

- **`app/`** = **Pages**. Next.js uses "file-based routing." This means: *the folder structure IS your website's URL structure.* If you create `app/login/page.tsx`, your website automatically gets a `/login` page. No extra configuration needed.
- **`components/`** = **Reusable building blocks**. The `Navbar` appears on every page, so instead of copy-pasting the same code into 8 files, you write it once here and import it everywhere.
- **`context/`** = **Shared memory**. When a user logs in on the login page, every other page needs to know "who is logged in." The `AuthContext` stores this information in one central place that all pages can access.

### 4.4 — Why is there a `prisma/` folder inside `backend/`?

**Prisma** is a tool that acts as a translator between your code and the database:
- **`schema.prisma`** = You describe your data in simple English-like syntax (like "a User has a username and a skinType"). Prisma reads this and creates the actual PostgreSQL tables for you.
- **`migrations/`** = Every time you change `schema.prisma` (like adding a new column), Prisma creates a migration file recording what changed. This is like a history book of your database's evolution.
- **`seed.ts`** = A script that fills your database with sample data for testing.

### 4.5 — Why are there `package.json` files?

Every JavaScript/TypeScript project needs a `package.json`. It serves three purposes:
1. **Lists dependencies** — all the external libraries (tools) the project uses (like Express, React, Prisma).
2. **Defines scripts** — shortcuts like `npm run dev` (starts the server) or `npm test` (runs tests).
3. **Stores metadata** — the project name, version, etc.

The `package-lock.json` is auto-generated and locks the exact version of every dependency so that everyone working on the project gets identical code.

### 4.6 — Why are there `tsconfig.json` files?

TypeScript doesn't run directly in the browser or on the server — it must be **compiled** (translated) into JavaScript first. `tsconfig.json` tells the TypeScript compiler HOW to do this translation (which features to enable, where to put the output, etc.).

### 4.7 — Why are there `tests/` files?

Automated tests are programs that run your code with fake inputs and check if the outputs are correct. They act as a **safety net**: every time you change something, you run the tests to make sure you didn't accidentally break existing features.

---

## 5. Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | Next.js 16 (App Router) | Builds the website pages, handles routing |
| **UI Library** | React 19 | Creates interactive user interfaces |
| **Styling** | TailwindCSS 4 | Utility-first CSS for rapid, beautiful design |
| **Frontend Language** | TypeScript | Type-safe JavaScript for fewer bugs |
| **Charts** | Recharts 3 | Data visualization for admin reports (Pie Charts) |
| **Icons** | Lucide React | Beautiful, consistent icon library |
| **Backend Framework** | Express.js 4 | Handles HTTP requests on the server |
| **Backend Language** | TypeScript (Node.js) | Server-side logic |
| **Database** | PostgreSQL 15 (via Docker) | Stores all data (users, ingredients, products) |
| **ORM** | Prisma 5 | Translates between code and database queries |
| **Authentication** | bcryptjs + jsonwebtoken | Securely hashes passwords and manages login sessions |
| **Excel I/O** | xlsx + exceljs + multer | Bulk import/export of data via Excel files |
| **Testing** | Jest + Supertest | Automated testing for backend endpoints |
| **Code Quality** | ESLint | Catches code style issues and potential bugs |
| **Dev Server** | Nodemon | Auto-restarts backend when code changes |

---

## 6. Completed Features

### Feature 01: Authentication (Registration & Login)
- **Backend:** Secure password hashing with `bcryptjs`, JWT token generation, `/register` and `/login` endpoints. Login is **blocked for locked accounts** (`isActive: false`) with a clear error message.
- **Frontend:** Luxury split-screen login and register forms with glassmorphism card, form validation, and error handling.
- **Testing:** Full unit tests for auth controller including locked account scenario.

### Feature 02: User Profile & Skin Type Management
- **Backend:** Protected `GET` and `PUT` endpoints for `/api/v1/users/profile`. Auth middleware for route protection. `PUT /api/v1/users/change-password` endpoint to securely change passwords with old password verification.
- **Frontend:** Profile page where users can view and update their username and skin type. 'Security Settings' section with a toggleable form for changing the password.
- **Testing:** Unit tests for middleware and user endpoints.

### Feature 03: Core INCI Analysis Engine
- **Database:** Seed script with sample ingredients and skin-type-specific safety rules.
- **Backend:** `POST /api/v1/analysis/check` — parses INCI strings, normalizes names, queries safety rules based on user's skin type. Results are automatically saved to `AnalysisHistory`.
- **Frontend:** Analysis page with split-screen layout, textarea input, color-coded results (🟢 GOOD, 🔴 BAD, ⚪ NEUTRAL), and ingredient descriptions.
- **Testing:** Unit tests for string parsing, rule-matching, and edge cases.

### Feature 04: Safe Product Recommendations
- **Backend:** `GET /api/v1/products/recommendations` — uses a **safety-first filter**: excludes any product that contains an ingredient flagged as `BAD` for the user's skin type. All remaining safe products are returned.
- **Frontend:** "Recommended for You" section on the analysis page, rendered **only after** the user submits an INCI string for analysis. Displays product cards in a responsive grid.
- **Testing:** Unit tests verifying that the returned products contain zero BAD ingredients for the user's skin type.

### Feature 05: Analysis History
- **Backend:**
  - Analysis results are automatically saved to `AnalysisHistory` on every successful check.
  - `GET /api/v1/history` — retrieves past analyses ordered by newest first.
  - `DELETE /api/v1/history/:id` — deletes a specific history entry.
  - `DELETE /api/v1/history` — clears all history for the authenticated user.
- **Frontend:** Luxury history page with:
  - List of past analyses with timestamps.
  - **Re-analyze** button to quickly rerun checks.
  - **Delete** individual entries with confirmation prompt.
  - **Clear All** history option.
  - Responsive layout and smooth animations.
- **Testing:** Unit tests for history retrieval and both deletion endpoints.

### Feature 06: Admin Dashboard — Ingredients, Rules & Products CRUD
- **Backend:** Full Create/Read/Update/Delete endpoints for ingredients, safety rules, and products under `/api/v1/admin/*`. Protected by both `authMiddleware` and `adminMiddleware`.
  - Products accept an INCI string as input; ingredients are auto-resolved (found or created) from the string.
- **Frontend:** Admin panel with sidebar navigation and dedicated management pages for ingredients, rules, and products. Only accessible to `ADMIN` role users.
- **Testing:** Unit tests for admin routes including 403 Forbidden enforcement for non-admin users.

### Feature 07: Admin — User Management & Statistical Reports
- **Database:** `User` model includes `isActive Boolean @default(true)` for account status tracking.
- **Backend:**
  - `GET /api/v1/admin/users` — lists all users (excluding password hash).
  - `PATCH /api/v1/admin/users/:id/status` — toggles `isActive` (lock/unlock account).
  - `DELETE /api/v1/admin/users/:id` — permanently deletes a user account.
  - `GET /api/v1/admin/reports` — aggregates: total users, total analyses, skin type distribution.
- **Frontend:**
  - **Users tab:** Data table with Lock/Unlock toggle and Delete button. All destructive actions trigger a **confirmation modal**.
  - **Reports tab:** Summary metric cards (Total Users, Total Analyses) + Pie Chart (skin type distribution via `recharts`).
- **Testing:** Endpoints verified through admin routes test suite.

### Feature 08: Luxury UI/UX Design System
- Applied a premium, high-end design system across all pages using:
  - **Playfair Display** (serif) for headings and **Inter** (sans-serif) for body text (via Google Fonts).
  - Dusty rose and sage green color palette as the core visual language.
  - **Glassmorphism** effects — frosted glass cards with `backdrop-blur` and `border-white/20`.
  - **Gradient aura backgrounds** — soft pink blurred blobs on the home page and key sections.
  - Split-screen layouts on auth and analysis pages.
  - Micro-animations and hover effects throughout.
  - Fully responsive layouts (mobile → tablet → desktop).
  - Next.js `<Image>` configured with `remotePatterns` to support external image hosting (e.g., `i.postimg.cc`).

### Feature 09: AI-Powered Fallback Analysis (Gemini Integration)
- **Problem Solver:** Prevents unknown ingredients (not in DB) from being incorrectly labeled as NEUTRAL.

- **Backend Integration:** 
  - Integrated **Gemini 1.5 Flash API** as a fallback mechanism in the analysis service.
  - When ingredients are missing from the local database, the system calls Gemini to evaluate them based on the user's specific skin type.
  - **Auto-Caching:** Results from AI are automatically inserted into the database as new `Ingredient` and `IngredientRule` entries. This reduces API costs and improves speed for future requests.
  - **Safety Fallback:** If the AI API fails or times out, the system gracefully defaults to NEUTRAL to ensure reliability.
- **Benefits:** Provides a more comprehensive analysis even for niche or new cosmetic ingredients.

### Feature 10: Excel Import/Export & Bulk Data Management
- **Backend:**
  - `excel.controller.ts` and `excel.service.ts` handle all Excel I/O logic.
  - **Export endpoints** (`GET /api/v1/admin/export/{ingredients|rules|products}`) — generate `.xlsx` files with all data, properly formatted with column widths.
  - **Import endpoints** (`POST /api/v1/admin/import/{ingredients|rules|products}`) — accept `.xlsx` uploads via `multer` (max 10 MB). Uses upsert logic: creates new records, updates existing ones (matched by name/brand), and reports `{ created, updated, skipped, errors }`. Supports Vietnamese column values for rules (e.g., "DA DẦU" → OILY).
  - **Bulk delete endpoints** (`DELETE /api/v1/admin/{ingredients|rules|products}/all`) — permanently removes all records of a given type.
- **Frontend:** `/admin/import-export` page with three sections:
  - **Export:** One-click download cards for each entity type.
  - **Import:** Drag-and-drop file upload with progress, result stats (created/updated/skipped), and collapsible error details.
  - **Danger Zone:** "Delete All" buttons with confirmation prompts for each entity type.
- **Dependencies:** `xlsx` (reading), `exceljs` (writing), `multer` (file upload middleware).

---

## 7. How to Start Everything (After a Computer Shutdown)

### Step 1: Start the Database

**A. If this is your FIRST time running the project (or if you deleted the database):**
1. Open **Docker Desktop** and wait for it to start.
2. Open a terminal and run the following command to create the database:
```bash
docker run --name skinmate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=skinmate -p 5432:5432 -d postgres
```
3. Push the schema and seed the initial data:
```bash
cd backend
npx prisma db push
npx prisma generate
npx prisma db seed
```

**B. For EVERY DAY use (after shutting down your computer):**
You do **NOT** need to seed the data again. Your data is saved.
1. Open **Docker Desktop** and wait for it to start.
2. Open a terminal and simply start the existing database:
```bash
docker start skinmate-postgres
```

### Required `backend/.env` File
```env
PORT=5000
JWT_SECRET="your_jwt_secret_here"
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
GEMINI_API_KEY="ask_a_senior_team_member_for_this"
```
> ⚠️ This file is **never** committed to Git. Ask a team member for the real keys.

### Step 2: Start the Backend Server
Open a terminal inside the `backend/` folder:
```bash
cd backend
npm run dev
```
The backend will run on **http://localhost:5000**.

### Step 3: Start the Frontend Website
Open a **second** terminal inside the `frontend/` folder:
```bash
cd frontend
npm run dev
```
The website will run on **http://localhost:3000**.

### Step 4 (Optional): Open Prisma Studio
To visually browse your database, open a **third** terminal:
```bash
cd backend
npx prisma studio
```
This opens a database viewer at **http://localhost:5555**.

---

## 8. Next Action Items

- [ ] **Product Scanning (OCR/Image)** — Allow users to upload a photo of a product label to automatically extract the INCI ingredient list.
- [ ] **Advanced Filtering** — Let users filter analysis results or products by category, brand, or safety rating.
- [ ] **Weighted Scoring System** — Rank recommendations by a composite score based on the number and weight of GOOD ingredients, not just the absence of BAD ones.
- [ ] **AI Coverage Expansion** — Extend Gemini AI fallback to also evaluate product-level safety holistically, not just per-ingredient.
- [x] **Deployment** — *(Completed)* Frontend on Vercel, backend + DB on Render. Production environment is live.
