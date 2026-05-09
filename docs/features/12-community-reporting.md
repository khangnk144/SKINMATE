# Feature 12: Community Ingredient Reporting

> **Status: ✅ Implemented**

## 1. Overview

Users can report ingredient safety misclassifications they encounter during analysis. Reports are visible to the community, who can upvote or downvote them. Administrators can review and resolve reports — approved reports automatically update the ingredient safety rules in the database.

## 2. Database Schema

Three new models support this feature:

```prisma
enum ReportStatus { PENDING, APPROVED, REJECTED }
enum VoteType { UP, DOWN }

model IngredientReport {
  id             Int            @id @default(autoincrement())
  ingredientId   Int            // FK → Ingredient
  userId         String         // FK → User (reporter)
  skinType       SkinType       // Reporter's skin type
  reportedEffect SafetyEffect   // Effect the user believes is correct
  reason         String         @db.Text
  evidenceUrl    String?        // Optional supporting link
  status         ReportStatus   @default(PENDING)
  createdAt      DateTime       @default(now())
  resolvedAt     DateTime?
  resolvedBy     String?        // Admin user ID
  adminNote      String?        @db.Text
  votes          ReportVote[]
}

model ReportVote {
  id        Int    @id @default(autoincrement())
  reportId  Int    // FK → IngredientReport
  userId    String // FK → User (voter)
  voteType  VoteType
  @@unique([reportId, userId])  // One vote per user per report
}
```

## 3. Backend Implementation (`/backend`)

**Files:** `report.controller.ts`, `report.service.ts`, `report.routes.ts`

**User Endpoints (require `authMiddleware`):**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/reports` | Submit a report: `{ ingredientId, skinType, reportedEffect, reason, evidenceUrl? }` |
| `POST` | `/api/v1/reports/vote` | Vote on a report: `{ reportId, voteType }`. Same vote toggles off, different vote updates. |
| `GET` | `/api/v1/reports/pending` | List pending reports with sorting (`?sortBy=votes|newest`) and pagination (`?limit=&offset=`). Returns `{ data, total }`. |
| `GET` | `/api/v1/reports/vote/:reportId` | Get authenticated user's vote on a specific report. |

**Admin Endpoint (requires `authMiddleware` + `adminMiddleware`):**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/reports/resolve` | Resolve a report: `{ reportId, status, adminNote? }`. `APPROVED` auto-updates the `IngredientRule`. Creates notification for the reporter. |

**Vote Mechanics:**
- One vote per user per report (enforced by `@@unique([reportId, userId])`).
- Voting with the **same type** as existing vote → deletes the vote (toggle off).
- Voting with a **different type** → updates the vote.
- Returns current vote counts and the user's vote state.

**Report Resolution:**
- Only `PENDING` reports can be resolved.
- `APPROVED` status triggers `adminService.createOrUpdateRule()` to update the `IngredientRule` table.
- A `Notification` is created for the reporter with the resolution result (Vietnamese messages).

## 4. Frontend Implementation (`/frontend`)

**User-facing:**
- **Analysis page** (`/analysis`): After results, users can click a "report" button on each ingredient to submit a report with their suggested correction.
- **Community reports page** (`/community/reports`): Browse pending reports, vote, and see vote counts.

**Admin-facing:**
- **Admin community reports page** (`/admin/community-reports`): Review pending reports, approve/reject with optional admin notes.

**Supporting component:**
- **Ingredient Search** (`GET /api/v1/ingredients/search?name=...`): Used by the reporting UI to resolve ingredient names to IDs.
  - Files: `ingredient.routes.ts`, `ingredient.controller.ts`

## 5. Testing

- Report creation validates required fields and enum values.
- Vote toggle mechanics are tested for all edge cases.
- Resolve endpoint tests verify rule updates on approval and notification creation.
