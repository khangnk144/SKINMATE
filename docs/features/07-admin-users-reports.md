# Feature 07: User Management & Statistical Reports (Admin)

> **Status: ✅ Implemented**

## 1. Overview

This feature completes the Admin Dashboard with two sections:
1. **User Management:** Admins can view, lock/unlock, or permanently delete user accounts.
2. **Statistical Reports:** A visual dashboard showing system usage metrics and skin type distribution.

## 2. Database Schema

The `User` model includes the `isActive` field (added via migration):

```prisma
model User {
  ...
  isActive  Boolean  @default(true)  // false = account locked
  ...
}
```

Locked users (`isActive: false`) are **blocked at login** — the `loginUser` service throws `'Your account has been locked by an Administrator.'` before issuing a JWT token.

## 3. Backend Implementation (`/backend`)

All routes are protected by both `authMiddleware` and `adminMiddleware`.

**User Management API (`/api/v1/admin/users`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/admin/users` | List all users. Excludes `passwordHash`. Includes `id`, `username`, `skinType`, `role`, `isActive`, `createdAt`. Ordered newest first. |
| `PATCH` | `/admin/users/:id/status` | Toggles `isActive` (true↔false). Finds user first to determine current state, then flips. |
| `DELETE` | `/admin/users/:id` | Permanently deletes the user and all their history (cascade). |

**Reports API (`/api/v1/admin/reports`):**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/admin/reports` | Aggregates: `totalUsers` (count), `totalAnalyses` (count), `skinTypeDistribution` (array of `{ type, count }` using `groupBy`) |

## 4. Frontend Implementation (`/frontend`)

**Users Tab (`/admin/users`):**
* Data table showing all users with their status (Active/Locked badge), skin type, role, and join date.
* **Lock/Unlock button:** Toggles `isActive` on the selected user.
* **Delete button:** Permanently removes the user account.
* **Confirmation Modal:** Both Lock and Delete actions trigger a modal: *"Are you sure you want to perform this action?"* before executing.

**Reports Tab (`/admin/reports`):**
* **Summary cards:** Total Users count, Total Analyses count.
* **Pie Chart:** Visual distribution of skin types among all registered users, powered by `recharts`.
* Empty-state handling if no data is available.

## 5. Testing

* `PATCH /admin/users/:id/status` correctly flips `isActive` in the database.
* `DELETE /admin/users/:id` removes the user record.
* `POST /api/v1/auth/login` with a locked account returns an appropriate error (not a token).
* All endpoints return `403 Forbidden` for non-admin users.