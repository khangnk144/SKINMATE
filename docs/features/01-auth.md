# Feature 01 - Authentication

> Last verified against code: June 1, 2026

## Backend

Files:

- `backend/src/routes/auth.routes.ts`
- `backend/src/controllers/auth.controller.ts`
- `backend/src/services/auth.service.ts`

Endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

Register requires `username`, `password`, and `skinType`; `displayName` is optional. The controller validates `SkinType`, the service enforces password length >= 6, checks duplicate usernames, hashes the password with bcrypt, and returns a safe user object without `passwordHash`.

Login checks username/password, rejects locked accounts (`isActive: false`), and returns `{ token, user }`. JWT payload contains `userId`, `role`, and `skinType`; expiry is `1d`.

## Frontend

Files:

- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/context/AuthContext.tsx`

`AuthContext` stores token and user in React state and `localStorage`.

## Tests

Relevant backend tests:

- `backend/src/tests/auth.controller.test.ts`
- `backend/src/tests/auth.middleware.test.ts`
