# Feature 05: Analysis History

## 1. Overview
Users should be able to view their past INCI string analyses. This requires updating the core analysis engine to save the raw input to the database upon a successful check, and creating a new UI for users to browse their history.

## 2. Backend Requirements (/backend)
* **Update POST /api/v1/analysis/check:**
  * Modify the existing endpoint from Feature 03. After successfully calculating the results, asynchronously save the `rawInput` (the original INCI string) and the `userId` into the `AnalysisHistory` table (Prisma).
* **GET /api/v1/history:**
  * **Middleware:** Requires `authMiddleware`.
  * **Logic:** Fetch all records from `AnalysisHistory` for the authenticated user, ordered by `createdAt` descending (newest first).
  * **Response:** Array of history objects.

## 3. Frontend Requirements (/frontend)
* **Page `/history`:**
  * **Protection:** Must be protected (logged-in users only).
  * **UI/UX:** Use TailwindCSS. Display the history as a list of cards or a clean table. 
  * **Card Details:** Each item should show the formatted date (e.g., "Oct 24, 2023"), a truncated snippet of the `rawInput` (e.g., "Water, Niacinamide, ..."), and a "Re-analyze" button.
  * **Behavior:** Clicking "Re-analyze" should either route the user back to `/analysis` with the string pre-filled, or trigger the analysis calculation right there.
* **Navigation:** Add a link to the "History" page in the main navigation bar or profile dropdown.

## 4. Testing
* Update the analysis tests to verify that a history record is created in the database.
* Write a new test for the `GET /api/v1/history` endpoint to ensure it returns the correct user's history in the right order.