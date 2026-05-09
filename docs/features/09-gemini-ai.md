# Feature 09: AI-Powered Fallback Analysis (Gemini Integration)

> **Status: ✅ Implemented**

## 1. Overview

When the INCI analysis engine encounters ingredients that are **not in the local database**, it uses Google Gemini 1.5 Flash as a fallback AI evaluator. This prevents unknown ingredients from being incorrectly labeled as NEUTRAL and provides users with meaningful safety assessments for niche or newly-released cosmetic ingredients.

## 2. Backend Implementation (`/backend`)

**Integration Point:** `analysis.service.ts` → `utils/gemini.ts`

**Flow:**
1. During analysis, after the batch DB lookup, collect all unmatched ingredient names.
2. If unmatched ingredients exist, call `evaluateWithGemini(unknownIngredients, skinType)`.
3. Gemini receives a Vietnamese-language prompt instructing it to act as a dermatologist and evaluate each ingredient for the user's specific skin type.
4. The prompt enforces a strict JSON response format: `[{ mappedName, effect, description }]`.
5. Results are **auto-cached** via upsert:
   - `Ingredient` table: create if new, skip if exists.
   - `IngredientRule` table: create/update for the specific `(ingredientId, skinType)` pair.
6. Cached results ensure that future lookups for the same ingredient + skin type are instant (no API call).

**Error Handling:**
- If Gemini API fails (network error, quota exceeded, invalid JSON response), the function returns an **empty array**.
- The main analysis engine defaults those ingredients to `NEUTRAL` — the user still gets results; they're just less specific.

**Cost Control:**
- The rate limiter on the analysis endpoint (25/day per user) indirectly limits Gemini API usage.
- Auto-caching eliminates redundant API calls for previously evaluated ingredients.

## 3. Configuration

- **API Key:** Stored in `backend/.env` as `GEMINI_API_KEY`.
- **Model:** Gemini 1.5 Flash (optimized for speed and cost).
- **File:** `backend/src/utils/gemini.ts`.

## 4. Testing

- The Gemini integration is tested indirectly through the analysis service tests.
- Mock Gemini responses are used in `analysis.service.test.ts` to verify the upsert caching logic.
