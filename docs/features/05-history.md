# Feature 05: Analysis History

> **Status: ✅ Implemented**

## 1. Overview

Every time a user submits an INCI string for analysis, the raw input is automatically saved to their `AnalysisHistory`. Users can view their past analyses, re-run them, delete individual entries, or clear all history at once.

## 2. Backend Implementation (`/backend`)

**Auto-save on Analysis:**
* `POST /api/v1/analysis/check` — after computing the analysis results, the `rawInput` string and `userId` are saved to the `AnalysisHistory` table before the response is sent.

**History Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/history` | Returns all history entries for the authenticated user, ordered by `createdAt` descending (newest first) |
| `DELETE` | `/api/v1/history/:id` | Deletes a specific history entry. Authorization check ensures users can only delete their own records. |
| `DELETE` | `/api/v1/history` | Clears ALL history entries for the authenticated user |

All routes are protected by `authMiddleware`.

## 3. Frontend Implementation (`/frontend`)

**Page `/history`** — Protected route (logged-in users only):
* Displays a list of past analyses as luxury-styled cards.
* Each card shows: formatted timestamp, truncated INCI string preview.
* **Re-analyze** button: navigates back to `/analysis` with the INCI string pre-populated.
* **Delete** button: triggers a confirmation prompt before deleting the individual entry.
* **Clear All** button: triggers a confirmation prompt before clearing all history.
* Smooth animations and fully responsive layout.

**Navigation:**
* Link to `/history` is included in the main `Navbar.tsx`.

## 4. Testing

Tests in `history.controller.test.ts` verify:
* `GET /history` returns the correct user's history in newest-first order.
* `DELETE /history/:id` removes the correct entry.
* `DELETE /history` removes all entries for the user.
* Authorization: users cannot delete another user's history entries.