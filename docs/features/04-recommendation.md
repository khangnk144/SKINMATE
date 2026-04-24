# Feature 04: Safe Product Recommendations

## 1. Overview
After analyzing ingredients or based on the user's profile, the system should recommend the Top 3 skincare products that are completely safe for their specific `skinType`. A product is considered "safe" if it does NOT contain any ingredients marked as `BAD` for that user's skin type.

## 2. Backend Requirements (/backend)
* **GET /api/v1/products/recommendations:**
  * **Middleware:** Requires `authMiddleware` (to extract the user's `skinType`).
  * **Logic Pipeline:**
    1. Query the `Product` table.
    2. Join the `ProductIngredient` and `Ingredient` tables.
    3. **Crucial Filtering:** Exclude any product that contains an ingredient where the `IngredientRule` for the user's `skinType` is `BAD`. 
    4. Limit the result to 3 products.
  * **Response:** Array of product objects including `id`, `name`, `brand`, and `imageUrl`.

## 3. Database Seeding Update
* Update `prisma/seed.ts` to include at least 5 dummy `Product` records.
* Link these products to ingredients via the `ProductIngredient` table. Ensure some products contain "BAD" ingredients for certain skin types, and some are completely safe, so the filtering logic can be accurately tested.

## 4. Frontend Requirements (/frontend)
* **Integration:** Display this feature on the `/analysis` page, right below the INCI analysis results.
* **UI/UX:** Use TailwindCSS to build a "Recommended for You" section.
  * Display the 3 products using a clean `ProductCard` component.
  * Each card should show a placeholder image (e.g., using a generic UI avatars/images service or a gray block), the product `brand` (small text), and `name` (bold text).
  * Use a responsive grid (1 column on mobile, 3 columns on desktop).
* **Behavior:** Fetch these recommendations automatically when the user visits the page or finishes an analysis.

## 5. Testing
* Write backend tests to verify that the returned products DO NOT contain any "BAD" ingredients for the mocked user's skin type.