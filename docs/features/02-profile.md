# Feature 02 - User Profile

> Last verified against code: June 1, 2026

## Backend

Files:

- `backend/src/routes/user.routes.ts`
- `backend/src/controllers/user.controller.ts`
- `backend/src/services/user.service.ts`

All routes use router-level `authMiddleware`.

Endpoints:

- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `PUT /api/v1/users/change-password`

`GET /profile` returns a safe profile with `id`, `username`, `displayName`, `skinType`, `role`, `createdAt`, and `updatedAt`.

`PUT /profile` requires `skinType` and accepts optional `displayName`. Username cannot be changed here.

`PUT /change-password` requires `oldPassword` and `newPassword`. The service verifies the old password and requires the new password to be at least 6 characters.

## Frontend

File:

- `frontend/src/app/profile/page.tsx`

The profile page supports skin type updates, display name updates, and password change.

## Tests

Relevant backend test:

- `backend/src/tests/user.routes.test.ts`
