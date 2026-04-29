# Feature 03: Core INCI Analysis Engine

> **Status: ✅ Implemented**

## 1. Overview
This is the heart of SKINMATE. The system takes a raw comma-separated INCI string from the user, normalizes it, queries the database, and applies safety rules based on the user's specific `skinType`.

## 2. Backend Requirements (/backend)
* **POST /api/v1/analysis/check:**
  * **Input:** `{ "inciString": "Water, Niacinamide, Salicylic Acid, Fragrance" }`
  * **Middleware:** Requires `authMiddleware` (to know the user's `skinType`). Also protected by `analysisRateLimiter` — standard users are capped at **25 analyses per 24 hours**; ADMIN users are exempt from this limit.
  * **Logic Pipeline:**
    1. **Normalize:** Split `inciString` by commas `,`. Trim whitespace. Keep original case for display; convert to `lowercase` for DB matching.
    2. **Query Ingredients:** Batch-fetch all matching ingredients from the `Ingredient` table with `WHERE name IN (...)`.
    3. **Query Rules:** For matched ingredients, fetch their `IngredientRule` filtered by the user's `skinType`.
    4. **AI Fallback (Gemini):** For ingredients **not found** in the local DB, call **Gemini 1.5 Flash API** (`src/utils/gemini.ts`). AI results are automatically upserted into `Ingredient` + `IngredientRule` tables (auto-caching for future requests). If the API fails → falls back to NEUTRAL gracefully.
    5. **Evaluate:** Map each ingredient to a result:
       * DB rule `BAD` → `BAD`
       * DB rule `GOOD` → `GOOD`
       * AI result available → use AI `effect` + `description`
       * No match anywhere → `NEUTRAL`
  * **Response:** Array of objects:
    ```json
    [{ "originalName": "Water", "mappedName": "water", "effect": "NEUTRAL", "description": "..." }]
    ```

## 3. Frontend Requirements (/frontend)
* **Page `/analysis`:**
  * **Input Area:** A large `<textarea>` for pasting the INCI list and an "Analyze" button.
  * **Loading State:** Animated spinner while waiting for the backend.
  * **Results Display:** Color-coded badges per ingredient:
    * 🌸 **BAD:** Dusty rose styling (rose palette).
    * 🌿 **GOOD:** Sage green styling (emerald palette).
    * ☁️ **NEUTRAL:** Soft gray styling.
  * **Interactivity:** Clicking a badge shows `description` in a tooltip/modal.
  * **Rate Limit UX:** If limit exceeded, display the Vietnamese error message returned by the backend.
  * **Recommendations:** After a successful analysis, the "Recommended for You" product section appears below the results.

## 4. Database Seeding
* `prisma/seed.ts` pre-populates sample ingredients and rules for development/testing (e.g., Salicylic Acid is BAD for DRY skin, Fragrance is BAD for SENSITIVE skin).

## 5. Testing
* Unit tests for string splitting and normalization logic.
* Mocked DB tests for Good/Bad/Neutral mapping across different skin types.
* See `backend/src/tests/analysis.controller.test.ts` and `analysis.service.test.ts`.