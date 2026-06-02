# SKINMATE Onboarding Guide

> Last generated from `.understand-anything/knowledge-graph.json`: June 2, 2026

This guide is for first-time contributors who want a practical way to understand the repository without reading the full knowledge graph.

## Project Overview

SKINMATE is a full-stack skincare ingredient checker with:

- A Next.js frontend for analysis, profile, history, community reporting, and admin workflows.
- An Express backend for authentication, ingredient analysis, recommendations, notifications, moderation, and OCR ingestion.
- A Prisma/PostgreSQL data layer for ingredients, rules, products, reports, notifications, and user data.
- Supporting project docs that describe product goals, architecture, API behavior, and contribution rules.

### Main Languages And Frameworks

- Languages: TypeScript, JavaScript, Markdown, JSON, Prisma, CSS, TeX
- Frameworks: Next.js, React, Express, Prisma

## Local Quick Start

Start the database, backend, and frontend in this order.

```bash
docker run --name skinmate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=skinmate -p 5432:5432 -d postgres

cd backend
npm install
npx prisma db push
npx prisma generate
npx prisma db seed
npm run dev
```

Open a second terminal for the frontend:

```bash
cd frontend
npm install
npm run dev
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Frontend API target: `http://localhost:5000/api/v1`

Required backend environment:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
JWT_SECRET="replace_me"
GEMINI_API_KEY="replace_me"
OCR_API_KEY="replace_me"
```

Optional frontend environment:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_ENABLE_HEALTH_CHECK="true"
```

## How To Read This Repo

Do not start from the whole graph. Use this sequence:

1. Read the docs to understand product scope and current status.
2. Read the backend entry point to see how routes and middleware are wired.
3. Read the Prisma schema to understand the data model.
4. Read the frontend shell to understand app-wide layout and auth state.
5. Trace the main analysis flow from page to service.
6. Leave admin and OCR internals for later.

## Architecture Layers

The knowledge graph groups the repo into 8 layers. Treat these as the main mental model.

### 1. Project Docs

Purpose: explain product goals, architecture, implemented features, and contribution rules.

Start here:

- [docs/README.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/README.md)
- [GENERAL.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/GENERAL.md)
- [STATUS.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/STATUS.md)
- [docs/ARCHITECTURE.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/ARCHITECTURE.md)
- [docs/API_SPEC.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/API_SPEC.md)

What this layer gives you:

- Product scope and user journeys
- Feature inventory
- API expectations
- Architecture vocabulary used across the project

### 2. Frontend Shell

Purpose: define the Next.js application frame, global layout, and top-level configuration.

Key files:

- [frontend/src/app/layout.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/layout.tsx)
- [frontend/src/app/admin/layout.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/layout.tsx)
- [frontend/package.json](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/package.json)
- [frontend/next.config.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/next.config.ts)
- [frontend/README.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/README.md)

What to look for:

- App Router structure
- Global styling and page wrappers
- Admin-specific layout separation
- Frontend build/runtime configuration

### 3. Frontend Experience

Purpose: contain user-facing pages and admin workflows.

Core user pages:

- [frontend/src/app/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/page.tsx)
- [frontend/src/app/analysis/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/analysis/page.tsx)
- [frontend/src/app/history/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/history/page.tsx)
- [frontend/src/app/profile/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/profile/page.tsx)
- [frontend/src/app/community/reports/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/community/reports/page.tsx)

Admin pages:

- [frontend/src/app/admin/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/page.tsx)
- [frontend/src/app/admin/ai-suggestions/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/ai-suggestions/page.tsx)
- [frontend/src/app/admin/ingredients/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/ingredients/page.tsx)
- [frontend/src/app/admin/products/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/products/page.tsx)
- [frontend/src/app/admin/reports/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/reports/page.tsx)
- [frontend/src/app/admin/import-export/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/import-export/page.tsx)

What to look for:

- Which pages are simple views vs workflow-heavy screens
- Where frontend state is page-local
- Which pages are more likely to coordinate multiple API calls

### 4. Frontend Shared

Purpose: reusable UI, auth/state coordination, and API helpers shared across pages.

Key files:

- [frontend/src/context/AuthContext.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/context/AuthContext.tsx)
- [frontend/src/lib/api.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/lib/api.ts)
- [frontend/src/components/Navbar.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/Navbar.tsx)
- [frontend/src/components/NotificationBell.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/NotificationBell.tsx)
- [frontend/src/components/ProtectedRoute.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/ProtectedRoute.tsx)
- [frontend/src/components/AdminProtectedRoute.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/AdminProtectedRoute.tsx)
- [frontend/src/components/ImageOCRUploader.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/ImageOCRUploader.tsx)

What to look for:

- Where auth token and user state are stored
- How API base URLs are derived
- How protected routes are enforced
- How OCR upload is integrated on the client

### 5. Backend API

Purpose: expose the HTTP surface, register routes, and apply middleware.

Key files:

- [backend/src/index.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/index.ts)
- [backend/src/routes/auth.routes.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/routes/auth.routes.ts)
- [backend/src/routes/analysis.routes.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/routes/analysis.routes.ts)
- [backend/src/controllers/auth.controller.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/controllers/auth.controller.ts)
- [backend/src/controllers/report.controller.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/controllers/report.controller.ts)
- [backend/src/middlewares/auth.middleware.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/middlewares/auth.middleware.ts)
- [backend/src/middlewares/admin.middleware.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/middlewares/admin.middleware.ts)
- [backend/src/middlewares/rateLimit.middleware.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/middlewares/rateLimit.middleware.ts)

What to look for:

- Route registration order
- Middleware boundaries for auth, admin access, and rate limiting
- Which controllers are thin wrappers vs logic-heavy endpoints

### 6. Backend Domain

Purpose: hold business logic, integrations, and OCR-specific modules.

Key files:

- [backend/src/services/analysis.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/analysis.service.ts)
- [backend/src/services/product.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/product.service.ts)
- [backend/src/services/admin.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/admin.service.ts)
- [backend/src/services/excel.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/excel.service.ts)
- [backend/src/utils/prisma.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/utils/prisma.ts)
- [backend/src/utils/gemini.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/utils/gemini.ts)
- [backend/src/modules/ocr/ocrRoutes.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr/ocrRoutes.ts)
- [backend/src/modules/ocr/ocrService.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr/ocrService.ts)
- [backend/src/modules/ocr/ingredientsExtractor.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr/ingredientsExtractor.ts)

What to look for:

- Business rules for ingredient analysis and recommendations
- Database access patterns
- Gemini fallback behavior for unknown ingredients
- Pending AI suggestion review flow before any official Ingredient or IngredientRule mutation
- OCR request flow and extraction responsibilities

### 7. Data Platform

Purpose: define persistence, seeds, and backend build/test configuration.

Key files:

- [backend/prisma/schema.prisma](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/prisma/schema.prisma)
- [backend/prisma/seed.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/prisma/seed.ts)
- [backend/package.json](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/package.json)
- [backend/tsconfig.json](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/tsconfig.json)
- [backend/jest.config.js](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/jest.config.js)

What to look for:

- Core entities and relationships
- Seed assumptions used by demo and dev flows
- Backend runtime/test scripts

### 8. Miscellaneous

Purpose: helper scripts that support one-off maintenance.

Key file:

- [fix-urls.js](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/fix-urls.js)

## Guided Tour

This is the recommended first-pass walkthrough derived from the graph.

### Step 1: Project Overview

Read:

- [docs/README.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/README.md)
- [GENERAL.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/GENERAL.md)
- [STATUS.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/STATUS.md)

Goal:

- Understand the product, the implemented scope, and the current team vocabulary.

### Step 2: Backend Entry Point

Read:

- [backend/src/index.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/index.ts)
- [backend/src/routes/auth.routes.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/routes/auth.routes.ts)
- [backend/src/controllers/auth.controller.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/controllers/auth.controller.ts)

Goal:

- Understand how Express starts, where middleware is attached, and how a request reaches controller logic.

### Step 3: Data Model

Read:

- [backend/prisma/schema.prisma](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/prisma/schema.prisma)
- [backend/prisma/seed.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/prisma/seed.ts)
- [backend/src/utils/prisma.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/utils/prisma.ts)

Goal:

- Learn the persistent entities before reading business logic that depends on them.

### Step 4: Frontend Shell

Read:

- [frontend/src/app/layout.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/layout.tsx)
- [frontend/src/components/Navbar.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/Navbar.tsx)
- [frontend/src/context/AuthContext.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/context/AuthContext.tsx)

Goal:

- Understand how layout, navigation, and login state are shared across the app.

### Step 5: Core Analysis Flow

Read:

- [frontend/src/app/analysis/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/analysis/page.tsx)
- [backend/src/services/analysis.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/analysis.service.ts)
- [backend/src/services/product.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/product.service.ts)

Goal:

- Trace the main product value from user input to backend analysis and recommendations.

### Step 6: Admin Operations

Read:

- [frontend/src/app/admin/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/page.tsx)
- [frontend/src/app/admin/ai-suggestions/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/ai-suggestions/page.tsx)
- [backend/src/services/admin.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/admin.service.ts)
- [backend/src/controllers/report.controller.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/controllers/report.controller.ts)
- [backend/src/services/excel.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/excel.service.ts)

Goal:

- Understand moderation, CRUD-heavy workflows, AI suggestion approval, and import/export responsibilities.

### Step 7: OCR Feature

Read:

- [frontend/src/components/ImageOCRUploader.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/ImageOCRUploader.tsx)
- [backend/src/modules/ocr/ocrRoutes.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr/ocrRoutes.ts)
- [backend/src/modules/ocr/ocrService.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr/ocrService.ts)

Goal:

- Understand the image upload path and how extracted ingredients re-enter the analysis flow.

## Key Concepts

These are the concepts that appear repeatedly across the graph and docs.

- Docs-first onboarding: major behavior and scope are described in project docs before you dive into implementation.
- Page-to-service flow: frontend pages trigger API requests, controllers validate/route them, and services own business logic.
- Auth-aware UI: authentication state is centralized in the frontend context and used to gate protected/admin routes.
- Prisma as source of truth: the schema and seed data define the baseline domain model used across analysis, reporting, and admin tools.
- OCR as an extension of analysis: OCR is not a separate product area; it feeds ingredient text into the same core analysis pipeline.
- Gemini fallback: external AI support is used when ingredients are unknown or need additional interpretation.
- Admin-reviewed AI promotion: Gemini results now enter a pending suggestion queue first; official ingredient and rule tables change only after admin approval.
- Admin-heavy maintenance surface: the repo includes significant operator tooling for ingredients, rules, products, users, reports, and Excel workflows.

## File Map

Use this as a quick lookup when you know the kind of change you want to make.

- Product behavior or current scope: [GENERAL.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/GENERAL.md), [STATUS.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/STATUS.md)
- API contract: [docs/API_SPEC.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/API_SPEC.md)
- Architecture summary: [docs/ARCHITECTURE.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/ARCHITECTURE.md)
- Database model: [backend/prisma/schema.prisma](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/prisma/schema.prisma)
- Seed/demo data: [backend/prisma/seed.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/prisma/seed.ts)
- Backend bootstrapping: [backend/src/index.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/index.ts)
- Frontend app shell: [frontend/src/app/layout.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/layout.tsx)
- Frontend auth state: [frontend/src/context/AuthContext.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/context/AuthContext.tsx)
- Frontend API helpers: [frontend/src/lib/api.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/lib/api.ts)
- Core analysis UI: [frontend/src/app/analysis/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/analysis/page.tsx)
- Core analysis logic: [backend/src/services/analysis.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/analysis.service.ts)
- Gemini fallback and review queue: [docs/features/09-gemini-ai.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/features/09-gemini-ai.md), [frontend/src/app/admin/ai-suggestions/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/ai-suggestions/page.tsx), [backend/src/services/admin.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/admin.service.ts)
- Recommendations and product matching: [backend/src/services/product.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/product.service.ts)
- OCR upload UI: [frontend/src/components/ImageOCRUploader.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/ImageOCRUploader.tsx)
- OCR backend flow: [backend/src/modules/ocr/ocrRoutes.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr/ocrService.ts), [backend/src/modules/ocr/ingredientsExtractor.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr/ingredientsExtractor.ts)
- Admin workflows: [frontend/src/app/admin/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/page.tsx), [backend/src/services/admin.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/admin.service.ts)
- Import/export workflows: [frontend/src/app/admin/import-export/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/admin/import-export/page.tsx), [backend/src/services/excel.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/excel.service.ts)

## Complexity Hotspots

These are the places new contributors should approach carefully after they understand the basics.

### Frontend Hotspots

- [frontend/src/app/analysis/page.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/app/analysis/page.tsx)
- [frontend/src/components/Navbar.tsx](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/frontend/src/components/Navbar.tsx)
- `frontend/src/app/admin/**/page.tsx`, especially AI suggestions, ingredients, products, rules, import/export, and community reports

Why they are tricky:

- They coordinate multiple UI states and API calls.
- They mix data loading, interaction handling, and conditional rendering.
- Admin screens likely bundle CRUD, filtering, moderation, and import/export logic in one place.

### Backend Hotspots

- [backend/src/services/admin.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/admin.service.ts)
- [backend/src/services/analysis.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/analysis.service.ts)
- [backend/src/services/excel.service.ts](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/services/excel.service.ts)
- OCR modules under [backend/src/modules/ocr](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/backend/src/modules/ocr)

Why they are tricky:

- They likely coordinate several models and validation paths.
- Analysis now mixes verified DB rules, Gemini fallback, and pending admin-review writes, so behavior changes there can affect both user output and moderation workflows.
- Import/export code usually has many edge cases and mapping rules.
- OCR and external API paths introduce non-deterministic behavior and failure handling.

### Documentation Hotspots

- [GENERAL.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/GENERAL.md)
- [STATUS.md](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/STATUS.md)
- [report.tex](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/report.tex)

Why they are tricky:

- They contain broad project context, but are not the fastest starting point for code changes.
- They are best used as references after you already know which subsystem you are touching.

## Recommended First Tasks For A New Contributor

- Run the app locally and verify login, analysis, and one admin screen.
- Trace one happy path end to end: analysis input on the frontend to response generation on the backend.
- Read the Prisma schema and list the core entities in your own words.
- Pick one feature doc under [docs/features](/C:/Users/Admin/OneDrive%20-%20MSFT/Desktop/SKINMATE/docs/features) and compare it with the corresponding page and service implementation.
- Avoid starting with Excel import/export or OCR internals unless your task directly requires them.

## When To Use The Knowledge Graph Again

Come back to the graph when you need to answer one of these questions:

- Which layer does this file belong to?
- What are the immediate neighbors of this module?
- Which docs or services are connected to this feature?
- What is the next file to read after this one?

If the graph feels too dense, reduce scope:

1. Stay within one layer.
2. Only inspect file-level nodes.
3. Follow one tour step at a time.
4. Ignore function/class nodes until you are already oriented.
