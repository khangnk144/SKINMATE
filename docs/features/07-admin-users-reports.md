# Feature 07 - Admin Users And Reports

> Last verified against code: June 1, 2026

## User Management

Backend endpoints:

- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/status`
- `DELETE /api/v1/admin/users/:id`

`GET /users` excludes `passwordHash` and supports optional pagination/search.

`PATCH /users/:id/status` toggles `isActive`. Locked users cannot log in.

`DELETE /users/:id` deletes the user; related rows cascade through Prisma relations.

Frontend page:

- `frontend/src/app/admin/users/page.tsx`

## Dashboard Stats

Backend endpoint:

- `GET /api/v1/admin/stats`

Response:

```json
{
  "ingredients": 0,
  "rules": 0,
  "products": 0,
  "users": 0,
  "analyses": 0
}
```

Frontend page:

- `frontend/src/app/admin/page.tsx`

## Reports Dashboard

Backend endpoint:

- `GET /api/v1/admin/reports`

Response contains `totalUsers`, `totalAnalyses`, and `skinTypeDistribution`.

Frontend files:

- `frontend/src/app/admin/reports/page.tsx`
- `frontend/src/components/AdminReportsCharts.tsx`

Charts use Recharts.
