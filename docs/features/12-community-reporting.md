# Feature 12 - Community Reporting

> Last verified against code: June 1, 2026

## Backend Files

- `backend/src/routes/report.routes.ts`
- `backend/src/controllers/report.controller.ts`
- `backend/src/services/report.service.ts`
- `backend/src/controllers/ingredient.controller.ts`

## Frontend Pages

- `frontend/src/app/community/reports/page.tsx`
- `frontend/src/app/admin/community-reports/page.tsx`
- Report entry points on `frontend/src/app/analysis/page.tsx`

## Data Models

- `IngredientReport`
- `ReportVote`
- `Notification`

Enums:

- `ReportStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `VoteType`: `UP`, `DOWN`

## User Endpoints

- `POST /api/v1/reports`
- `POST /api/v1/reports/vote`
- `GET /api/v1/reports/pending`
- `GET /api/v1/reports/vote/:reportId`
- `GET /api/v1/ingredients/search?name=...`

All require auth.

Voting behavior is handled by the service:

- First vote creates a row.
- Same vote type toggles off.
- Different vote type updates the row.

## Admin Endpoint

- `POST /api/v1/reports/resolve`

Requires admin. Body includes `reportId`, `status`, and optional `adminNote`. `status` must be `APPROVED` or `REJECTED`.

Approval updates or creates the matching `IngredientRule` with the report's `reportedEffect`.

Approval or rejection creates a notification for the reporter.
