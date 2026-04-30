# Feature 02: User Profile & Skin Type Management

## 1. Overview
Allow logged-in users to view their profile and update their `skinType`. This is a critical prerequisite for the core analysis engine (Feature 03).

## 2. Backend Requirements (/backend)
* **Auth Middleware:** Create an `authMiddleware.ts` to protect routes. It should verify the Bearer JWT, extract the `userId`, and attach it to the request object. If the token is invalid or missing, return a `401 Unauthorized`.
* **GET /api/v1/users/profile:**
  * **Action:** Fetch the current user's details (exclude `passwordHash`).
  * **Middleware:** Requires `authMiddleware`.
* **PUT /api/v1/users/profile:**
  * **Input:** `skinType` (Enum: OILY, DRY, SENSITIVE, COMBINATION, NORMAL).
  * **Action:** Update the user's `skinType` in the database.
  * **Middleware:** Requires `authMiddleware`.
  * **Response:** Return the updated user object.
* **PUT /api/v1/users/change-password:**
  * **Input:** `oldPassword` and `newPassword`.
  * **Action:** Verifies `oldPassword` using `bcrypt.compare`, hashes `newPassword`, and updates `passwordHash` in the database.
  * **Middleware:** Requires `authMiddleware`.
  * **Response:** Return success message or error (e.g., INVALID_PASSWORD).

## 3. Frontend Requirements (/frontend)
* **Protected Routes Logic:** Implement a Higher-Order Component (HOC), wrapper, or middleware in Next.js to protect the `/profile` page. If an unauthenticated user tries to access it, redirect them to `/login`.
* **Page `/profile`:**
  * **UI/UX:** Use TailwindCSS to create a clean, modern, and aesthetically pleasing layout (e.g., a centered card with nice padding, shadows, and clear typography).
  * **Content:** Display the user's `username`. Provide a styled `<select>` dropdown or interactive buttons to choose their `skinType`. Include a 'Security Settings' section below the skin type selection.
  * **Behavior:** Fetch the current profile on mount. When the user changes their skin type and clicks "Save", send the PUT request and display a success message (e.g., a toast notification or inline green text).
  * **Password Change Flow:** Provide a button to toggle a password change form containing Current Password, New Password, and Confirm New Password. Handle success/error messages clearly using the existing message state.

## 4. Testing
* Write unit tests for `authMiddleware`.
* Write tests for the `GET` and `PUT` `/api/v1/users/profile` endpoints, ensuring unauthenticated requests are blocked.