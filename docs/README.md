# SKINMATE - Cosmetic Ingredient Safety Checker

SKINMATE is a luxury web application designed to help users analyze cosmetic ingredients (INCI lists) based on their specific skin type, using a rule-based engine with a **Gemini AI fallback** for unknown ingredients and a **community reporting** system for continuous improvement.

> **New team member?** Start with [`GENERAL.md`](../GENERAL.md) in the project root — it is a complete 30-minute onboarding walkthrough.

## 🚀 Quick Start

### 1. Prerequisites
* Node.js (v18+)
* Docker Desktop (for PostgreSQL database)
* npm

### 2. Environment Variables
Create `backend/.env` with:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
JWT_SECRET="your_jwt_secret_here"
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Database Setup
1. Open Docker Desktop.
2. Start (or create) the database container:
```bash
# First time only:
docker run --name skinmate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=skinmate -p 5432:5432 -d postgres

# Every subsequent day:
docker start skinmate-postgres
```
3. Push schema and seed data (first time only):
```bash
cd backend
npx prisma db push
npx prisma generate
npx prisma db seed
```

### 4. Running the App

**Start the Backend:**
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:5000`

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`

### 5. (Optional) Prisma Studio — Visual DB Browser
```bash
cd backend
npx prisma studio
```
Opens at `http://localhost:5555`

## 📚 Documentation

All docs are in the `/docs` folder. **Read them in this order:**

1. [`../GENERAL.md`](../GENERAL.md) — **START HERE** (new member onboarding, ~30 min read)
2. [`CONTEXT.md`](./CONTEXT.md) — Project overview & goals
3. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System design & data flow
4. [`DATABASE.md`](./DATABASE.md) — Schema & data models (9 tables)
5. [`API_SPEC.md`](./API_SPEC.md) — All backend API endpoints
6. [`PROJECT-RULES.md`](./PROJECT-RULES.md) — Coding standards & conventions
7. [`features/`](./features/) — Detailed spec per feature (01 through 14)

There is also a comprehensive [`STATUS.md`](../STATUS.md) in the root directory with the full project status, annotated file tree, and setup guide.

## 🛠 Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS v4 (Luxury Design System), TypeScript.
* **Backend:** Node.js, Express.js 4, Prisma 5 ORM, TypeScript.
* **Database:** PostgreSQL 15 (via Docker container `skinmate-postgres`). 9 tables.
* **AI Integration:** Google Gemini 1.5 Flash (ingredient analysis fallback).
* **OCR:** OCR.space API + rule-based ingredient parser (product label scanning).
* **Community:** Ingredient reporting with voting, admin moderation, and in-app notifications.
* **Excel I/O:** xlsx + exceljs + multer (bulk import/export for admin).
* **Rate Limiting:** express-rate-limit (25 analyses/24h per user; ADMIN exempt).
* **Testing:** Jest + Supertest.