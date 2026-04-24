# Feature 06: Admin Dashboard & CRUD Operations

## 1. Overview
The system requires an admin panel to manage the core data: Ingredients, Rules, and Products. This ensures the database can scale and be updated without manual SQL queries. Only users with the `ADMIN` role can access these features.

## 2. Backend Requirements (/backend)
* **Admin Middleware:** Create `adminMiddleware.ts` that runs after `authMiddleware`. It should check if `req.user.role === 'ADMIN'`. If not, return a `403 Forbidden`.
* **Admin Endpoints (Base path: `/api/v1/admin`):**
  * **Ingredients:**
    * `GET /ingredients`: List all ingredients.
    * `POST /ingredients`: Create a new ingredient (name must be converted to lowercase).
    * `PUT /ingredients/:id`: Update an ingredient.
    * `DELETE /ingredients/:id`: Delete an ingredient.
  * **Rules:**
    * `POST /rules`: Create/Update a safety rule (Good/Bad/Neutral) for a specific ingredient and skin type.
  * **Products (Optional for MVP, but good to have):**
    * `POST /products`: Add a new product and link its ingredients.

## 3. Frontend Requirements (/frontend)
* **Protected Admin Layout:** Create an `/admin` route. Use client-side logic to redirect users to `/` if their `role` is not `ADMIN`.
* **UI/UX (Dashboard - Luxury Design System):**
  * Use TailwindCSS v4 with the SKINMATE Luxury Design System (soft rose accents, serif headings, rounded-3xl cards, soft shadows).
  * Admin sidebar with sage green (`emerald`) active states.
* **Data Management Views:**
  * **Data Table:** Display lists in clean tables with soft rose dividers.
  * **Actions:** Add "Edit" (sage green) and "Delete" (dusty rose) buttons to each row.
  * **Modals/Forms:** Use backdrop-blur modals with rounded-3xl cards and rose-focused inputs.
* **Notifications:** Show success (emerald) / error (rose) toast alerts.

## 4. Testing
* **Security Testing:** This is critical. Write tests to verify that a normal `USER` receives a 403 Forbidden error when trying to access ANY `/api/v1/admin/*` route.
* Write basic tests for the Ingredient creation endpoint to ensure it correctly normalizes the data (lowercasing).