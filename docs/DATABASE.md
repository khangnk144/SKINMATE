# SKINMATE - Database Documentation

> **Last Updated:** May 9, 2026

## 1. Overview

The database is designed to handle skincare ingredient analysis using a normalized relational model. It focuses on fast lookup for ingredient safety based on user skin types, and supports community-driven ingredient reporting with voting.

* **Engine:** PostgreSQL 15 (running via Docker container `skinmate-postgres`).
* **ORM:** Prisma 5.
* **Schema Management:** Uses `prisma db push` for development (no migration files tracked in the repository).
* **Naming Convention:** `snake_case` for database tables/columns, `PascalCase` for Prisma models.

## 2. Entity Relationship Diagram

```
User (1) ──────────────── (N) AnalysisHistory
  │ id, username, displayName,
  │ passwordHash, skinType,
  │ role, isActive, createdAt, updatedAt
  │
  ├─── (N) IngredientReport       ← Community reports submitted by users
  ├─── (N) ReportVote             ← Votes on community reports
  └─── (N) Notification           ← In-app notifications

Ingredient (1) ──────────── (N) IngredientRule
  │ id, name, description          │ id, ingredientId, skinType, effect
  │                                │ UNIQUE(ingredientId, skinType)
  │
  ├─── (N) IngredientReport       ← Reports targeting this ingredient

Ingredient (1) ──────────── (N) ProductIngredient (N) ──────────── (1) Product
                                  │ productId, ingredientId, position
                                  │ PRIMARY KEY(productId, ingredientId)

IngredientReport (1) ──────── (N) ReportVote
  │ id, ingredientId, userId,      │ id, reportId, userId, voteType
  │ skinType, reportedEffect,      │ UNIQUE(reportId, userId)
  │ reason, evidenceUrl, status,
  │ resolvedAt, resolvedBy, adminNote
```

## 3. Data Models (Live Prisma Schema)

This is the current source-of-truth `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

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

model User {
  id            String            @id @default(uuid())
  username      String            @unique
  displayName   String?
  passwordHash  String
  skinType      SkinType?         @default(NORMAL)
  role          UserRole          @default(USER)
  isActive      Boolean           @default(true)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  histories     AnalysisHistory[]
  ingredientReports IngredientReport[]
  reportVotes   ReportVote[]
  notifications Notification[]
}

model Ingredient {
  id          Int                 @id @default(autoincrement())
  name        String              @unique // INCI Name in lowercase for matching
  description String?             @db.Text
  rules       IngredientRule[]
  products    ProductIngredient[]
  reports     IngredientReport[]
}

model IngredientRule {
  id           Int          @id @default(autoincrement())
  ingredientId Int
  skinType     SkinType
  effect       SafetyEffect @default(NEUTRAL)
  
  ingredient   Ingredient   @relation(fields: [ingredientId], references: [id], onDelete: Cascade)

  @@unique([ingredientId, skinType]) // One rule per ingredient per skin type
}

model Product {
  id          String              @id @default(uuid())
  name        String
  brand       String
  imageUrl    String?
  ingredients ProductIngredient[]
  createdAt   DateTime            @default(now())
}

model ProductIngredient {
  productId    String
  ingredientId Int
  position     Int // Order of ingredient in the list (1-indexed)

  product      Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id], onDelete: Cascade)

  @@id([productId, ingredientId])
}

model AnalysisHistory {
  id        String   @id @default(uuid())
  userId    String
  rawInput  String   @db.Text
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model IngredientReport {
  id             Int            @id @default(autoincrement())
  ingredientId   Int
  ingredient     Ingredient     @relation(fields: [ingredientId], references: [id], onDelete: Cascade)
  userId         String
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  skinType       SkinType       // The reporter's skin type when reporting
  reportedEffect SafetyEffect   // The effect the user believes is correct
  reason         String         @db.Text
  evidenceUrl    String?        // Optional link to image or study
  status         ReportStatus   @default(PENDING)
  createdAt      DateTime       @default(now())
  resolvedAt     DateTime?
  resolvedBy     String?        // admin user id
  adminNote      String?        @db.Text
  votes          ReportVote[]
}

model ReportVote {
  id           Int        @id @default(autoincrement())
  reportId     Int
  report       IngredientReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  voteType     VoteType
  createdAt    DateTime   @default(now())

  @@unique([reportId, userId])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   // user who receives the notification
  type      String   // e.g., "REPORT_RESOLVED", "ADMIN_MESSAGE"
  title     String   // short summary
  message   String   @db.Text
  link      String?  // optional URL to navigate when clicked
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 4. Field Reference

### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID string | Primary key |
| `username` | String | Unique, immutable login ID |
| `displayName` | String? | Optional friendly name shown in the navbar and profile page |
| `passwordHash` | String | bcryptjs hash, never exposed via API |
| `skinType` | Enum (SkinType?) | Nullable; defaults to `NORMAL` |
| `role` | Enum (UserRole) | `USER` or `ADMIN`; defaults to `USER` |
| `isActive` | Boolean | `false` = locked. Login is rejected for locked accounts |
| `createdAt` | DateTime | Auto-set on creation |
| `updatedAt` | DateTime | Auto-updated on every change |

### Ingredient

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int | Auto-increment primary key |
| `name` | String | Unique, **always lowercase** for matching accuracy |
| `description` | Text? | Optional explanation for display in analysis results |

### IngredientRule

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int | Auto-increment primary key |
| `ingredientId` | Int | FK → Ingredient |
| `skinType` | Enum (SkinType) | Which skin type this rule applies to |
| `effect` | Enum (SafetyEffect) | `GOOD`, `BAD`, or `NEUTRAL` |
| *(unique)* | — | `(ingredientId, skinType)` is unique — one rule per pair |

### Product

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID string | Primary key |
| `name` | String | Product display name |
| `brand` | String | Brand name |
| `imageUrl` | String? | Optional URL to product image |
| `createdAt` | DateTime | Auto-set on creation |

### ProductIngredient (Junction Table)

| Field | Type | Notes |
|-------|------|-------|
| `productId` | String | FK → Product |
| `ingredientId` | Int | FK → Ingredient |
| `position` | Int | 1-indexed order in the INCI list |
| *(PK)* | — | Composite PK: `(productId, ingredientId)` |

### AnalysisHistory

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID string | Primary key |
| `userId` | String | FK → User |
| `rawInput` | Text | The original INCI string the user submitted |
| `createdAt` | DateTime | Timestamp of the analysis |

### IngredientReport

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int | Auto-increment primary key |
| `ingredientId` | Int | FK → Ingredient |
| `userId` | String | FK → User (the reporter) |
| `skinType` | Enum (SkinType) | The reporter's skin type at time of report |
| `reportedEffect` | Enum (SafetyEffect) | The effect the user believes is correct (`GOOD`/`BAD`/`NEUTRAL`) |
| `reason` | Text | Explanation for why the user thinks the current classification is wrong |
| `evidenceUrl` | String? | Optional link to supporting evidence (image, study) |
| `status` | Enum (ReportStatus) | `PENDING`, `APPROVED`, or `REJECTED`; defaults to `PENDING` |
| `createdAt` | DateTime | Auto-set on creation |
| `resolvedAt` | DateTime? | Timestamp when an admin resolved the report |
| `resolvedBy` | String? | Admin user ID who resolved the report |
| `adminNote` | Text? | Optional admin note explaining the resolution |

### ReportVote

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int | Auto-increment primary key |
| `reportId` | Int | FK → IngredientReport |
| `userId` | String | FK → User (the voter) |
| `voteType` | Enum (VoteType) | `UP` or `DOWN` |
| `createdAt` | DateTime | Auto-set on creation |
| *(unique)* | — | `(reportId, userId)` is unique — one vote per user per report |

### Notification

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID string | Primary key |
| `userId` | String | FK → User (recipient) |
| `type` | String | Notification type (e.g., `REPORT_RESOLVED`, `ADMIN_MESSAGE`) |
| `title` | String | Short summary displayed in the notification bell |
| `message` | Text | Full notification message body |
| `link` | String? | Optional URL for navigation when notification is clicked |
| `isRead` | Boolean | `false` = unread; defaults to `false` |
| `createdAt` | DateTime | Auto-set on creation |

## 5. Key Implementation Rules

* **Ingredient Name Normalization:** All ingredient names MUST be converted to `lowercase` before being saved or queried. This is enforced in `admin.service.ts` (`createIngredient`, `updateIngredient`, `findOrCreateIngredients`), `analysis.service.ts`, and `excel.service.ts` (import functions).
* **Referential Integrity:** `onDelete: Cascade` is used on all foreign key relations to ensure that deleting a parent record (User, Ingredient, Product, IngredientReport) automatically cleans up all dependent child records.
* **Unique Rule Constraint:** The `@@unique([ingredientId, skinType])` constraint on `IngredientRule` prevents duplicate rules. The admin service uses an upsert pattern (find → update if exists, else create).
* **Unique Vote Constraint:** The `@@unique([reportId, userId])` constraint on `ReportVote` ensures each user can only vote once per report. Re-voting with the same type toggles the vote off.
* **Indexing:** The `name` field in `Ingredient` is indexed (Unique) to ensure O(log n) lookup speed during analysis.

## 6. Schema Update Workflow

This project uses `prisma db push` for schema synchronization (no migration files are tracked):

1. Modify `prisma/schema.prisma`.
2. Run `npx prisma db push` to sync the schema to the database.
3. Run `npx prisma generate` to regenerate the Prisma Client.
4. Run `npx prisma db seed` to (re-)populate sample data if needed.

> ⚠️ **Never modify the schema without explicit user confirmation.** Schema changes affect the live database.
