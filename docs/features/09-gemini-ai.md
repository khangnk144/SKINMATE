# Feature 09 - Gemini AI Fallback

> Last verified against code: June 1, 2026

## Files

- `backend/src/utils/gemini.ts`
- `backend/src/services/analysis.service.ts`

## Environment

```env
GEMINI_API_KEY="replace_me"
```

## Model Endpoint

Code calls:

```text
https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent
```

## When Gemini Is Used

Gemini is called only by `analyzeIngredients()` when:

- The INCI list contains names not found in the local `Ingredient` table.
- The current user has a skin type.
- `GEMINI_API_KEY` is set.

## Expected AI Result

The helper expects JSON array items shaped as:

```json
{
  "mappedName": "ingredient name",
  "effect": "GOOD",
  "description": "short text"
}
```

`effect` must match `GOOD`, `BAD`, or `NEUTRAL`.

## Admin Review Queue

For each AI result, `analysis.service.ts`:

1. Returns the classification to the current user with `source: "AI"` and `isVerified: false`.
2. Upserts a pending `AiIngredientSuggestion` for the lowercase ingredient and current skin type.
3. Increments `occurrenceCount` when the same pending suggestion appears again.

If saving the suggestion fails, analysis still returns available AI results for the current request.

Official `Ingredient` and `IngredientRule` rows are updated only after an admin approves the pending suggestion.

## Failure Behavior

Missing key, API errors, parse errors, or empty responses return an empty AI result array. Analysis then falls back to `NEUTRAL` for unresolved ingredients.
