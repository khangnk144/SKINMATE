# Feature 03: Core INCI Analysis Engine

## 1. Overview
This is the heart of SKINMATE. The system takes a raw comma-separated INCI string from the user, normalizes it, queries the database, and applies safety rules based on the user's specific `skinType`.

## 2. Backend Requirements (/backend)
* **POST /api/v1/analysis/check:**
  * **Input:** `{ "inciString": "Water, Niacinamide, Salicylic Acid, Fragrance" }`
  * **Middleware:** Requires `authMiddleware` (to know the user's `skinType`).
  * **Logic Pipeline:**
    1. **Normalize:** Split the `inciString` by commas `,`. Trim leading/trailing whitespaces. Keep a reference to the original case, but convert to `lowercase` for database matching.
    2. **Query Ingredients:** Fetch all matching ingredients from the `Ingredient` table using the normalized names.
    3. **Query Rules:** For the matched ingredients, fetch their rules from `IngredientRule` specifically for the current user's `skinType`.
    4. **Evaluate:** Map each inputted ingredient to a result object. 
       * If a rule exists with effect `BAD` -> mark as `BAD`.
       * If a rule exists with effect `GOOD` -> mark as `GOOD`.
       * If no rule exists, or the ingredient is not in the DB -> mark as `NEUTRAL`.
  * **Response:** Array of objects. Example:
    `[{ "originalName": "Water", "mappedName": "water", "effect": "NEUTRAL", "description": "..." }, ...]`

## 3. Frontend Requirements (/frontend)
* **Page `/analysis` (or Home `/`):**
  * **Input Area:** A large `<textarea>` for pasting the INCI list and an "Analyze" button.
  * **Loading State:** Show a clear loading spinner while waiting for the backend.
  * **Results Display:** Render the returned array of ingredients as distinct visual tags/badges or list items.
    * 🔴 **BAD:** Apply a red styling (e.g., `bg-red-100 text-red-700 border-red-500`).
    * 🟢 **GOOD:** Apply a green styling (`bg-green-100 text-green-700 border-green-500`).
    * ⚪ **NEUTRAL:** Apply a gray styling (`bg-gray-100 text-gray-700 border-gray-500`).
  * **Interactivity:** Clicking an ingredient tag should open a small modal or tooltip showing its `description` (if available from the DB).

## 4. Database Seeding (Crucial for testing)
* Create a simple Prisma seed script (`prisma/seed.ts`) with some dummy ingredients (e.g., Water, Glycerin, Salicylic Acid, Fragrance) and rules (e.g., Salicylic Acid is BAD for DRY skin, Fragrance is BAD for SENSITIVE skin) so we can actually test the color-coding logic.

## 5. Testing
* Write unit tests for the string splitting and normalization logic.
* Mock the database to ensure the Good/Bad/Neutral mapping works correctly based on different skin types.