# Feature 13 - Notifications

> Last verified against code: June 1, 2026

## Backend Files

- `backend/src/routes/notification.routes.ts`
- `backend/src/controllers/notification.controller.ts`
- `backend/src/services/report.service.ts`

## Frontend File

- `frontend/src/components/NotificationBell.tsx`

## Data Model

`Notification` fields:

- `id`
- `userId`
- `type`
- `title`
- `message`
- `link`
- `isRead`
- `createdAt`

## Endpoints

All routes require auth. `/send` also requires admin.

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/read-all`
- `PATCH /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/send`

`GET /notifications` returns the newest 50 notifications for the current user.

`PATCH /:id/read` verifies ownership before updating.

`POST /send` creates an `ADMIN_MESSAGE` notification.

## Automatic Notifications

`report.service.ts` creates a notification when an admin resolves a community report.

Current notification controller creates a local `PrismaClient` instance instead of importing the shared `utils/prisma.ts` client.
