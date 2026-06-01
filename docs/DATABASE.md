# SKINMATE - Database Documentation

> Last verified against code: June 1, 2026

The source of truth is `backend/prisma/schema.prisma`.

## Database Setup

- Provider: PostgreSQL.
- ORM: Prisma Client.
- Development sync: `npx prisma db push`.
- Seed script: `backend/prisma/seed.ts`.
- No migrations folder is tracked in this repository.

## Enums

```prisma
enum SkinType {
  OILY
  DRY
  SENSITIVE
  COMBINATION
  NORMAL
}

enum UserRole {
  USER
  ADMIN
}

enum SafetyEffect {
  GOOD
  BAD
  NEUTRAL
}

enum ReportStatus {
  PENDING
  APPROVED
  REJECTED
}

enum VoteType {
  UP
  DOWN
}
```

## Models

### User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | UUID primary key |
| `username` | `String` | Unique login name |
| `displayName` | `String?` | Optional display name |
| `passwordHash` | `String` | bcrypt hash |
| `skinType` | `SkinType?` | Defaults to `NORMAL` |
| `role` | `UserRole` | Defaults to `USER` |
| `isActive` | `Boolean` | Defaults to `true`; false blocks login |
| `createdAt` | `DateTime` | Defaults to `now()` |
| `updatedAt` | `DateTime` | Auto-updated |

Relations: histories, ingredientReports, reportVotes, notifications.

### Ingredient

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `Int` | Auto-increment primary key |
| `name` | `String` | Unique, stored lowercase |
| `description` | `String?` | Text description |

Relations: rules, products, reports.

### IngredientRule

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `Int` | Auto-increment primary key |
| `ingredientId` | `Int` | Foreign key to Ingredient |
| `skinType` | `SkinType` | Rule target skin type |
| `effect` | `SafetyEffect` | Defaults to `NEUTRAL` |

Constraints:

- `@@unique([ingredientId, skinType])`
- Ingredient relation uses `onDelete: Cascade`

### Product

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | UUID primary key |
| `name` | `String` | Product name |
| `brand` | `String` | Brand name |
| `imageUrl` | `String?` | Optional image URL |
| `createdAt` | `DateTime` | Defaults to `now()` |

Relations: ingredients through `ProductIngredient`.

### ProductIngredient

| Field | Type | Notes |
| --- | --- | --- |
| `productId` | `String` | Foreign key to Product |
| `ingredientId` | `Int` | Foreign key to Ingredient |
| `position` | `Int` | Ingredient order in INCI list |

Constraints:

- Composite primary key: `@@id([productId, ingredientId])`
- Both relations use `onDelete: Cascade`

### AnalysisHistory

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | UUID primary key |
| `userId` | `String` | Foreign key to User |
| `rawInput` | `String` | Submitted INCI text |
| `createdAt` | `DateTime` | Defaults to `now()` |

User relation uses `onDelete: Cascade`.

### IngredientReport

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `Int` | Auto-increment primary key |
| `ingredientId` | `Int` | Reported ingredient |
| `userId` | `String` | Reporter |
| `skinType` | `SkinType` | Skin type being reported |
| `reportedEffect` | `SafetyEffect` | Effect user believes is correct |
| `reason` | `String` | Required text |
| `evidenceUrl` | `String?` | Optional URL |
| `status` | `ReportStatus` | Defaults to `PENDING` |
| `createdAt` | `DateTime` | Defaults to `now()` |
| `resolvedAt` | `DateTime?` | Set on admin resolution |
| `resolvedBy` | `String?` | Admin user id |
| `adminNote` | `String?` | Optional note |

Relations to Ingredient and User use `onDelete: Cascade`.

### ReportVote

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `Int` | Auto-increment primary key |
| `reportId` | `Int` | Foreign key to IngredientReport |
| `userId` | `String` | Voter |
| `voteType` | `VoteType` | `UP` or `DOWN` |
| `createdAt` | `DateTime` | Defaults to `now()` |

Constraints:

- `@@unique([reportId, userId])`
- Relations use `onDelete: Cascade`

### Notification

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | UUID primary key |
| `userId` | `String` | Recipient |
| `type` | `String` | Example: `REPORT_RESOLVED`, `ADMIN_MESSAGE` |
| `title` | `String` | Short title |
| `message` | `String` | Body text |
| `link` | `String?` | Optional navigation URL |
| `isRead` | `Boolean` | Defaults to `false` |
| `createdAt` | `DateTime` | Defaults to `now()` |

User relation uses `onDelete: Cascade`.

## Relationship Summary

```text
User 1--N AnalysisHistory
User 1--N IngredientReport
User 1--N ReportVote
User 1--N Notification

Ingredient 1--N IngredientRule
Ingredient 1--N IngredientReport
Ingredient N--N Product through ProductIngredient

IngredientReport 1--N ReportVote
```

## Implementation Rules

- Normalize ingredient names to lowercase before save/search.
- Use `IngredientRule` for skin-type-specific safety.
- Do not duplicate rules for the same `(ingredientId, skinType)`.
- Deleting users, ingredients, reports, or products cascades through dependent rows.
- Use `prisma db push` only after confirming schema changes with the user/team.
