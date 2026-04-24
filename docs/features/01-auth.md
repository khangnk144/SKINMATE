# Feature 01: Authentication (Register & Login)

## 1. Overview
Implement the authentication flow for SKINMATE. Users must be able to register an account with their skin type and log in to receive a JWT token.

## 2. Backend Requirements (/backend)
* **Packages:** Use `bcryptjs` for password hashing and `jsonwebtoken` for generating tokens.
* **POST /api/v1/auth/register:**
  * **Input:** `username`, `password`, `skinType` (Enum: OILY, DRY, SENSITIVE, COMBINATION, NORMAL).
  * **Validation:** * `username` must be unique.
    * `password` must be at least 6 characters long.
    * All fields are required.
  * **Action:** Hash the password, save to `User` table (Prisma), return success message (Do NOT return the password).
* **POST /api/v1/auth/login:**
  * **Input:** `username`, `password`.
  * **Action:** Check if user exists. Compare hashed password. If correct, generate a JWT token (include `userId`, `role`, `skinType` in payload).
  * **Response:** Return the token and basic user info.

## 3. Frontend Requirements (/frontend)
* **Pages:**
  * `/register`: A clean, modern form with fields for Username, Password, Confirm Password, and a dropdown for Skin Type.
  * `/login`: A form with Username and Password.
* **State Management:** Save the JWT token in `localStorage` or cookies after successful login. Create a reusable hook (e.g., `useAuth`) or Context to manage the user's logged-in state across the app.
* **UI/UX:** Use TailwindCSS v4 with the SKINMATE Luxury Design System (serif headings, rounded-3xl cards, rose-focused inputs, rounded-full buttons). Show clear error messages in rose-tinted alerts. Redirect to `/` (Home) after successful login.

## 4. Testing
* Write unit tests for the backend auth controllers to verify successful registration/login and error handling (e.g., duplicate username, wrong password).