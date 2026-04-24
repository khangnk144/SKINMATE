# Feature 07: User Management & Statistical Reports (Admin)

## 1. Overview
This feature completes the Admin Dashboard by adding two critical capabilities: 
1. **User Management:** Allowing the Admin to view, lock/unlock, or delete user accounts to maintain system security.
2. **Statistical Reports:** Providing visual charts to track system usage, user growth, and popular analysis trends.

## 2. Database Schema Update (Prisma)
* Update the `User` model in `schema.prisma` to include an account status field:
  `isActive Boolean @default(true)`
* *Action Required:* Run a migration after updating the schema.

## 3. Backend Requirements (/backend)
* All routes below must be protected by `authMiddleware` AND `adminMiddleware`.
* **User Management API (`/api/v1/admin/users`):**
  * `GET /`: Fetch a list of all users (exclude passwordHash). Include their `skinType`, `role`, and `isActive` status.
  * `PATCH /:id/status`: Toggle the `isActive` status (Lock/Unlock).
  * `DELETE /:id`: Permanently delete a user account.
* **Reports API (`/api/v1/admin/reports`):**
  * `GET /`: Aggregate and return statistical data. For the MVP, return:
    * Total number of users.
    * User distribution by `skinType`.
    * Total number of analyses performed (from `AnalysisHistory`).

## 4. Frontend Requirements (/frontend)
* **Dependencies:** Install a charting library like `recharts` for rendering graphs.
* **User Management Tab (in Admin Dashboard):**
  * Display users in a data table.
  * Add an action column with a "Lock/Unlock" toggle button and a "Delete" button.
  * **Confirmation Modal:** As explicitly required by the use case, deleting or changing a user's status MUST trigger a confirmation dialog ("Are you sure you want to perform this action?").
* **Reports Tab (in Admin Dashboard):**
  * Create a dashboard view with visual cards for summary metrics (Total Users, Total Analyses).
  * Render a Pie Chart showing the distribution of Skin Types among users.
  * *Optional (if time permits):* Render a Bar Chart showing user registrations over time.

## 5. Testing
* Ensure the `PATCH` and `DELETE` endpoints correctly modify the database.
* Verify that a locked user (`isActive: false`) cannot log in. (Update the `POST /api/v1/auth/login` endpoint logic to reject locked accounts with a clear message).