# Feature 13: In-App Notifications

> **Status: ✅ Implemented**

## 1. Overview

Users receive in-app notifications for important events, such as when their community ingredient report is resolved by an admin. Admins can also send custom messages to individual users. Notifications appear in a bell icon in the navbar with an unread count badge.

## 2. Database Schema

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String   // Recipient user
  type      String   // e.g., "REPORT_RESOLVED", "ADMIN_MESSAGE"
  title     String   // Short summary
  message   String   @db.Text
  link      String?  // Optional navigation URL
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 3. Backend Implementation (`/backend`)

**Files:** `notification.controller.ts`, `notification.routes.ts`

**User Endpoints (require `authMiddleware`):**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/notifications` | Get user's notifications (newest first, max 50) |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark a specific notification as read (verifies ownership) |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all unread notifications as read |

**Admin Endpoint (requires `authMiddleware` + `adminMiddleware`):**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/notifications/send` | Send a custom notification: `{ userId, title, message, link? }` |

**Auto-generated Notifications:**
- When a community report is resolved (`APPROVED` or `REJECTED`), `report.service.ts` automatically creates a `REPORT_RESOLVED` notification for the reporter with a Vietnamese message.

## 4. Frontend Implementation (`/frontend`)

**Component:** `src/components/NotificationBell.tsx`

- Displayed in the Navbar for authenticated users.
- Shows unread count badge on the bell icon.
- Dropdown panel lists recent notifications.
- Clicking a notification marks it as read and navigates to the linked page (if `link` is set).
- "Mark all as read" action available.

## 5. Notification Types

| Type | Trigger | Message |
|------|---------|---------|
| `REPORT_RESOLVED` | Admin approves/rejects an ingredient report | Vietnamese approval/rejection message |
| `ADMIN_MESSAGE` | Admin sends a custom message via the admin panel | Custom title and message |
