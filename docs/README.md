# SKINMATE Documentation Index

> Last verified against code: June 1, 2026

Start here if you are trying to understand or modify the project.

## Recommended Reading Order

1. [`../GENERAL.md`](../GENERAL.md) - onboarding and full project map.
2. [`../STATUS.md`](../STATUS.md) - current implemented status.
3. [`CONTEXT.md`](./CONTEXT.md) - product goals and core workflows.
4. [`ARCHITECTURE.md`](./ARCHITECTURE.md) - backend/frontend/database architecture.
5. [`DATABASE.md`](./DATABASE.md) - Prisma schema reference.
6. [`API_SPEC.md`](./API_SPEC.md) - implemented REST API.
7. [`PROJECT-RULES.md`](./PROJECT-RULES.md) - contribution rules.
8. [`features/`](./features/) - one file per implemented feature.

## Project Summary

SKINMATE is a full-stack skincare ingredient checker. Users analyze INCI lists by skin type, upload product label images for OCR extraction, get safe product recommendations, save history, submit community reports, vote on reports, and receive notifications. Admins manage the content database and moderation workflows.

## Source Of Truth

- Database: `backend/prisma/schema.prisma`
- Backend routes: `backend/src/routes/*.ts` and `backend/src/index.ts`
- Backend behavior: `backend/src/controllers/*.ts`, `backend/src/services/*.ts`, `backend/src/modules/ocr/*.ts`
- Frontend pages: `frontend/src/app/**/page.tsx`
- Frontend API helpers: `frontend/src/lib/api.ts`
- Package versions: `backend/package.json`, `frontend/package.json`

## Local Quick Start

```bash
docker run --name skinmate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=skinmate -p 5432:5432 -d postgres
cd backend
npm install
npx prisma db push
npx prisma generate
npx prisma db seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Backend default: `http://localhost:5000`

Frontend default: `http://localhost:3000`

## Required Backend Environment

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/skinmate"
JWT_SECRET="replace_me"
GEMINI_API_KEY="replace_me"
OCR_API_KEY="replace_me"
```

## Optional Frontend Environment

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_ENABLE_HEALTH_CHECK="true"
```
