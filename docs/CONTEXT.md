# SKINMATE - Project Context

> **Last Updated:** May 9, 2026  
> **Current Phase:** MVP Complete + Community Features

## 1. Project Overview

* **Name:** SKINMATE — Skincare Ingredient Consulting & Checking Platform.
* **Target Audience:** Vietnamese Gen Z, high school/university students, and skincare beginners who lack deep chemical/dermatological knowledge.
* **Current Phase:** MVP Complete with Community Features. All core features are implemented and running locally. Speed and functional completeness were prioritized over micro-optimizations.
* **Core Value:** Automate the tedious process of manually checking cosmetic ingredients (INCI lists). The system uses a Rule-based matching engine to evaluate ingredient safety based on the user's specific skin type, then recommends safe products. Users can also contribute to the community by reporting ingredient misclassifications.

## 2. Core Workflows (Do NOT deviate from this logic)

### User Flow
```
Register/Login
  → Set Skin Type (Oily, Dry, Sensitive, Combination, Normal)
  → Paste INCI string (comma-separated) or upload product label image (OCR)
  → System splits & trims, normalizes to lowercase
  → System matches against IngredientRules for the user's skin type
  → Unknown ingredients (not in DB) → AI Fallback via Gemini 1.5 Flash
  → AI results are auto-cached to DB (upsert) for future speed
  → Return visual color-coded results
  → Save raw input to AnalysisHistory
  → Show safe product recommendations (excluding products with BAD ingredients)
  → Users can report misclassified ingredients via the Community Reporting system
```

### Visual Evaluation System (Luxury Aesthetic)
* 🌸 **Dusty Rose (Bad):** Harmful/Irritating for the user's specific skin type.
* 🌿 **Sage Green (Good):** Beneficial/Safe for the user's skin type.
* ☁️ **Soft Gray (Neutral):** Neutral, or ingredient not found in the DB.

### Recommendation Logic
* **Safety-first filter:** A product is ONLY recommended if it contains **zero** ingredients flagged as `BAD` for the user's skin type.
* The "Recommended for You" section is **only rendered** after the user submits an analysis — hidden on initial page load.

### Community Reporting Flow
* Users can submit reports claiming an ingredient's safety classification is wrong for a specific skin type.
* Other users can **upvote/downvote** reports to signal community agreement.
* Admins can **approve or reject** reports:
  - **Approved reports** automatically update the corresponding `IngredientRule` in the database.
  - The reporting user receives an **in-app notification** about the resolution.

### Admin Flow
* Admins can manage ingredients, safety rules, and products via the admin dashboard.
* Admins can lock/unlock user accounts — locked accounts cannot log in.
* Admins can view statistical reports: total users, total analyses, skin type distribution.
* Admins can **bulk import/export** data via Excel files (`.xlsx`) for ingredients, rules, and products.
* Admins can **delete all** records of a given type (ingredients, rules, or products) from the Import/Export page.
* Admins can **moderate community reports** — approve (auto-updates rules) or reject with an optional note.
* Admins can **send notifications** to individual users.

## 3. Tech Stack (Implemented)

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TailwindCSS v4, TypeScript |
| **Charts** | Recharts 3 (admin reports) |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express.js 4, TypeScript |
| **Database** | PostgreSQL 15 via Docker (`skinmate-postgres`), Prisma 5 ORM |
| **Auth** | bcryptjs (password hashing) + jsonwebtoken (JWT, 24h expiry) |
| **AI Integration** | Google Gemini 1.5 Flash API (ingredient analysis fallback) |
| **OCR** | OCR.space API + rule-based ingredient parser (product label scanning) |
| **Rate Limiting** | express-rate-limit (25 analyses/24h per user; unlimited for ADMIN) |
| **Excel I/O** | xlsx (reading) + exceljs (writing) + multer (file upload) |
| **HTTP Client** | axios (OCR API calls) |
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