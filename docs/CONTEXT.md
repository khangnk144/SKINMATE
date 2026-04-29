# SKINMATE - Project Context

> **Last Updated:** April 29, 2026  
> **Current Phase:** MVP Complete

## 1. Project Overview

* **Name:** SKINMATE — Skincare Ingredient Consulting & Checking Platform.
* **Target Audience:** Vietnamese Gen Z, high school/university students, and skincare beginners who lack deep chemical/dermatological knowledge.
* **Current Phase:** MVP Complete. All core features are implemented and running locally. Speed and functional completeness were prioritized over micro-optimizations.
* **Core Value:** Automate the tedious process of manually checking cosmetic ingredients (INCI lists). The system uses a Rule-based matching engine to evaluate ingredient safety based on the user's specific skin type, then recommends safe products.

## 2. Core Workflows (Do NOT deviate from this logic)

### User Flow
```
Register/Login
  → Set Skin Type (Oily, Dry, Sensitive, Combination, Normal)
  → Paste INCI string (comma-separated)
  → System splits & trims, normalizes to lowercase
  → System matches against IngredientRules for the user's skin type
  → Unknown ingredients (not in DB) → AI Fallback via Gemini 1.5 Flash
  → AI results are auto-cached to DB (upsert) for future speed
  → Return visual color-coded results
  → Save raw input to AnalysisHistory
  → Show safe product recommendations (excluding products with BAD ingredients)
```

### Visual Evaluation System (Luxury Aesthetic)
* 🌸 **Dusty Rose (Bad):** Harmful/Irritating for the user's specific skin type.
* 🌿 **Sage Green (Good):** Beneficial/Safe for the user's skin type.
* ☁️ **Soft Gray (Neutral):** Neutral, or ingredient not found in the DB.

### Recommendation Logic
* **Safety-first filter:** A product is ONLY recommended if it contains **zero** ingredients flagged as `BAD` for the user's skin type.
* The "Recommended for You" section is **only rendered** after the user submits an analysis — hidden on initial page load.

### Admin Flow
* Admins can manage ingredients, safety rules, and products via the admin dashboard.
* Admins can lock/unlock user accounts — locked accounts cannot log in.
* Admins can view statistical reports: total users, total analyses, skin type distribution.

## 3. Tech Stack (Implemented)

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TailwindCSS v4, TypeScript |
| **Charts** | Recharts 3 (admin reports) |
| **Backend** | Node.js, Express.js 4, TypeScript |
| **Database** | PostgreSQL 15 via Docker (`skinmate-postgres`), Prisma 5 ORM |
| **Auth** | bcryptjs (password hashing) + jsonwebtoken (JWT, 24h expiry) |
| **AI Integration** | Google Gemini 1.5 Flash API (ingredient analysis fallback) |
| **Rate Limiting** | express-rate-limit (25 analyses/24h per user; unlimited for ADMIN) |
| **Testing** | Jest & Supertest |
| **Package Manager** | `npm` |

## 4. Absolute AI Directives (The "Never Do" List)

1. **NO Schema Alteration:** Never modify the Prisma/DB schema without explicit user confirmation.
2. **NO Ghost Dependencies:** Do not install new `npm` packages unless specifically requested or strictly necessary for the current task (must confirm first).
3. **MANDATORY Testing:** After writing code for a new feature or endpoint, you MUST provide the corresponding test cases (Unit/Integration) to verify it works.
4. **NO Environment Tampering:** Never modify `.env`, `.gitignore`, or core config files (e.g., `tsconfig.json`, `next.config.ts`) outside of the initial setup scope.
5. **Scope Discipline:** Do NOT refactor code outside the immediate scope of the user's prompt.
6. **API Contract Strictness:** Never change the JSON response format of existing APIs, as the Client application depends on strict contracts.
7. **NO Inline Styles:** Use TailwindCSS v4 utility classes exclusively. Adhere to the SKINMATE Luxury Design System (rose accents, soft shadows, serif headings, glassmorphism).