# Feature 05 - Analysis History

> Last verified against code: June 1, 2026

## Backend

Files:

- `backend/src/routes/history.routes.ts`
- `backend/src/controllers/history.controller.ts`

All routes require auth.

Endpoints:

- `GET /api/v1/history`
- `DELETE /api/v1/history/:id`
- `DELETE /api/v1/history`

History rows are created by `analysis.controller.ts` after a successful analysis. The history table stores `rawInput`, not computed result rows.

`GET /history` returns only the current user's rows ordered newest first.

`DELETE /history/:id` uses `id + userId` lookup so a user cannot delete another user's history.

`DELETE /history` deletes all rows for the current user only.

## Frontend

File:

- `frontend/src/app/history/page.tsx`

The page supports listing history, re-analysis, single delete, and clear all.

## Tests

Relevant backend test:

- `backend/src/tests/history.controller.test.ts`
