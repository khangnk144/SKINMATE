# Feature 03 - Core INCI Analysis

> Last verified against code: June 1, 2026

## Backend

Files:

- `backend/src/routes/analysis.routes.ts`
- `backend/src/controllers/analysis.controller.ts`
- `backend/src/services/analysis.service.ts`
- `backend/src/utils/gemini.ts`

Endpoint:

- `POST /api/v1/analysis/check`

Middleware:

- `authMiddleware`
- `analysisRateLimiter`

Controller behavior:

- Validates `inciString`.
- Refreshes the current user from DB.
- Uses the DB skin type, not only the JWT value.
- Calls `analyzeIngredients`.
- Saves `rawInput` to `AnalysisHistory`.

Service behavior:

- Splits input by comma.
- Trims blanks.
- Lowercases names for DB matching.
- Fetches known ingredients and rules for the user's skin type.
- Calls Gemini for missing ingredients when a skin type exists.
- Returns Gemini results to the user with `source: "AI"` and `isVerified: false`.
- Upserts Gemini results into pending `AiIngredientSuggestion` records for admin review, not into official `Ingredient` or `IngredientRule`.
- Returns `NEUTRAL` with `source: "FALLBACK"` when no DB rule or AI result exists.

## Frontend

File:

- `frontend/src/app/analysis/page.tsx`

The page supports direct INCI input, OCR upload, analysis results, product recommendations, and report actions.

## Tests

Relevant backend tests:

- `backend/src/tests/analysis.controller.test.ts`
- `backend/src/tests/analysis.service.test.ts`
