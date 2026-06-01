# SKINMATE - Project Rules

> Last verified against code: June 1, 2026

## Do Not Change Code Unless Asked

For documentation work, do not modify TypeScript, TSX, Prisma, package, or config files.

## Source Of Truth

- API behavior: backend routes/controllers/services.
- Database: `backend/prisma/schema.prisma`.
- Frontend routes: `frontend/src/app`.
- Package versions/scripts: each `package.json`.

## Backend Conventions

- Keep route files thin.
- Put validation and HTTP status handling in controllers.
- Put business rules in services.
- Use `authMiddleware` before code that expects `req.user`.
- Use `adminMiddleware` only after `authMiddleware`.
- Normalize ingredient names with `trim().toLowerCase()`.
- Do not change `schema.prisma` without explicit approval.
- Do not commit `.env`.

## Frontend Conventions

- Use Next.js App Router pages under `src/app`.
- Use `AuthContext` for client auth state.
- Use `frontend/src/lib/api.ts` for API base URLs.
- Use TailwindCSS utility classes for styling.
- Keep admin-only pages behind `AdminProtectedRoute`.
- Keep login-required pages behind `ProtectedRoute`.

## TypeScript And Style

- Prefer explicit types.
- Avoid new `any` usage.
- Prefer `async/await`.
- Use guard clauses for validation.
- Use single quotes in TS/JS where the local file does.
- Keep comments focused on why a decision exists.

## Testing Expectations

Backend has Jest/Supertest configured. Run:

```bash
cd backend
npm test
```

Frontend currently has lint only:

```bash
cd frontend
npm run lint
```

Do not claim frontend tests exist unless a test runner is added.
