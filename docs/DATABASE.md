# SKINMATE - Database Documentation

## 1. Overview
The database is designed to handle skincare ingredient analysis using a normalized relational model. It focuses on fast lookup for ingredient safety based on user skin types.

* **Engine:** MySQL.
* **ORM:** Prisma.
* **Naming Convention:** `snake_case` for database tables/columns, `PascalCase` for Prisma models.

## 2. Entity Relationship Diagram (Conceptual)
- **User** (1) ---- (N) **AnalysisHistory**
- **Ingredient** (1) ---- (N) **IngredientRule**
- **Ingredient** (1) ---- (N) **ProductIngredient**
- **Product** (1) ---- (N) **ProductIngredient**

## 3. Data Models (Prisma Schema)
Copy this content into your `prisma/schema.prisma` file. This is the source of truth for the database setup.

```prisma
// This is your Prisma schema file

datasource db {
  provider = "mysql"
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

model User {
  id            String            @id @default(uuid())
  username      String            @unique
  passwordHash  String
  skinType      SkinType?         @default(NORMAL)
  role          UserRole          @default(USER)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  histories     AnalysisHistory[]
}

model Ingredient {
  id          Int                 @id @default(autoincrement())
  name        String              @unique // INCI Name in lowercase for matching
  description String?             @db.Text
  rules       IngredientRule[]
  products    ProductIngredient[]
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
  position     Int // Order of ingredient in the list

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
```

## 4. Key Implementation Rules
* **Standardization:** All ingredient names must be converted to `lowercase` before being saved or queried to ensure matching accuracy.
* **Referential Integrity:** Use `onDelete: Cascade` for relationships so that deleting a user or ingredient cleans up related records.
* **Indexing:** The `name` field in the `Ingredient` table is indexed (Unique) to ensure O(1) or O(log n) lookup speed during analysis.

## 5. Migration Workflow
1. Modify the `schema.prisma` file.
2. Run `npx prisma migrate dev --name <migration_name>`.
3. AI must generate seed data for common ingredients to test the "Dusty Rose/Sage Green" (BAD/GOOD) logic.
