# Feature 02: User Profile, Display Name & Skin Type Management

## 1. Overview
Allow logged-in users to view their profile and update their `displayName` and `skinType`. The `username` serves as the permanent, immutable login ID and cannot be changed. The `displayName` is the friendly name shown in the navbar greeting and can be set or updated at any time.

## 2. Backend Requirements (/backend)
* **Auth Middleware:** Create an `authMiddleware.ts` to protect routes. It should verify the Bearer JWT, extract the `userId`, and attach it to the request object. If the token is invalid or missing, return a `401 Unauthorized`.
* **GET /api/v1/users/profile:**
  * **Action:** Fetch the current user's details (excludes `passwordHash`). Returns `displayName` (nullable).
  * **Middleware:** Requires `authMiddleware`.
* **PUT /api/v1/users/profile:**
  * **Input:** `skinType` (required Enum), `displayName` (optional String — send `null` to clear).
  * **Action:** Update the user's `skinType` and/or `displayName` in the database atomically.
  * **Middleware:** Requires `authMiddleware`.
  * **Response:** Return the updated user object (includes `displayName`).
* **PUT /api/v1/users/change-password:**
  * **Input:** `oldPassword` and `newPassword`.
  * **Action:** Verifies `oldPassword` using `bcrypt.compare`, hashes `newPassword`, and updates `passwordHash` in the database.
  * **Middleware:** Requires `authMiddleware`.
  * **Response:** Return success message or error (e.g., INVALID_PASSWORD).
* **POST /api/v1/auth/register:**
  * **Input:** `username`, `password`, `skinType`, `displayName?` (optional).
  * **Action:** Creates the new user, storing `displayName` if provided.
  * **Response:** Returns the new user object including `displayName`.
* **POST /api/v1/auth/login:**
  * **Response:** Returns `{ token, user }` where `user` includes `displayName`.

## 3. Frontend Requirements (/frontend)
* **Protected Routes Logic:** Implement a Higher-Order Component (HOC), wrapper, or middleware in Next.js to protect the `/profile` page. If an unauthenticated user tries to access it, redirect them to `/login`.
* **AuthContext (`User` interface):** Must include `displayName: string | null` alongside the existing fields.
* **Register Page (`/register`):**
  * Add a **Họ và tên** (Full Name) input field **before** the username field. The field is optional — submitting without it leaves `displayName` as `null`.
* **Page `/profile`:**
  * **Username:** Displayed as a read-only, disabled field. A helper note confirms it cannot be changed.
  * **Display Name:** An editable input field below the username, labelled **Tên hiển thị**. Users can set or update this at any time. Saving with an empty value clears it to `null`.
  * **Skin Type:** A styled `<select>` dropdown to choose their skin type.
  * **Save Button:** Enabled when either `skinType` or `displayName` differs from the currently saved values. On success, the AuthContext is updated immediately so the navbar greeting reflects the change without a page reload.
  * **Security Settings:** A collapsible section with Current Password, New Password, and Confirm New Password. Handles success/error messages clearly.
* **Navbar:**
  * When logged in, show **Xin chào, [displayName]** (falls back to `username` if `displayName` is null) as a styled italic serif greeting in rose-400, followed by a `·` separator and a **Hồ sơ** link. Both form a single anchor that navigates to `/profile`.

## 4. Testing
* Write unit tests for `authMiddleware`.
* Write tests for the `GET` and `PUT` `/api/v1/users/profile` endpoints, ensuring unauthenticated requests are blocked.
* Verify that the login response includes `displayName` and that the frontend AuthContext stores it correctly.