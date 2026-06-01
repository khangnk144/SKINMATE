# SKINMATE - Project Context

> Last verified against code: June 1, 2026

## Product Goal

SKINMATE helps skincare beginners check cosmetic ingredient lists without manually researching every INCI ingredient. The app evaluates ingredients against a user's skin type, falls back to AI for unknown ingredients, and recommends products that avoid known bad matches.

## Target Users

- Vietnamese skincare beginners.
- Students and young users who want quick ingredient guidance.
- Admin users who maintain the ingredient/rule/product database.

## Core User Workflow

```text
Register or login
-> choose skin type and optional display name
-> paste INCI list or upload label image for OCR
-> analyze ingredients
-> save raw input to history
-> show product recommendations
-> optionally report wrong ingredient classifications
-> vote on pending community reports
-> receive notifications when reports are resolved
```

## Visual Result System

Analysis results use three conceptual labels:

| Effect | Meaning |
| --- | --- |
| `GOOD` | Ingredient is considered beneficial or safe for the user's skin type |
| `BAD` | Ingredient is considered risky or unsuitable for the user's skin type |
| `NEUTRAL` | Ingredient has no specific known positive/negative rule, AI failed, or no rule exists |

The frontend renders these as distinct visual states on the analysis page. Database values stay as English enum values.

## Core Admin Workflow

```text
Login as ADMIN
-> manage ingredients
-> manage safety rules
-> manage products
-> manage users
-> view dashboard stats and reports
-> import/export Excel data
-> moderate community reports
-> send notifications to users
```

## Business Rules In Code

- Skin types are `OILY`, `DRY`, `SENSITIVE`, `COMBINATION`, and `NORMAL`.
- Effects are `GOOD`, `BAD`, and `NEUTRAL`.
- Ingredient names are stored and matched in lowercase.
- One ingredient can have different effects for different skin types.
- Missing ingredients are sent to Gemini only during analysis and only when a skin type is available.
- Gemini results are cached as `Ingredient` plus `IngredientRule` rows.
- If AI fails or no rule exists, the ingredient result falls back to `NEUTRAL`.
- Product recommendations exclude products with any `BAD` ingredient for the user's skin type.
- Safe products are scored by number of `GOOD` ingredients; the service returns 3 randomly shuffled products from the top 6.
- Report approval updates or creates the matching `IngredientRule`.
- Report approval/rejection creates a notification for the reporter.
- Locked users cannot log in.
- Admins are exempt from the analysis rate limit.

## Important Non-Goals In Current Code

- No product-level Gemini analysis.
- No frontend test runner configured.
- No Prisma migrations folder tracked in the repository.
- No external i18n framework; user-facing text lives inline in components.
