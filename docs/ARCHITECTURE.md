# SKINMATE - System Architecture

## 1. High-Level Overview
SKINMATE follows a **Client-Server architecture** using a **Layered Pattern** to separate concerns.

* **Frontend:** Next.js (App Router) with TailwindCSS v4 - Responsible for UI/UX (Luxury Design System) and client-side logic.
* **Backend:** Node.js + Express.js - Responsible for business logic, database orchestration, and security.
* **Database:** MySQL via Prisma ORM.

## 2. Backend Layered Architecture
Each module in the Backend must follow this flow:
`Request -> Router -> Controller -> Service -> Repository (Prisma) -> DB`

* **Controller:** Handles HTTP requests, extracts parameters, and calls Services. No business logic here.
* **Service:** Contains the core business logic (e.g., the algorithm to split INCI strings and match rules).
* **Repository/Prisma:** Pure data access layer.
* **Middleware:** Handles Authentication (JWT), Error Handling, and Validation (Zod/Joi).

## 3. Frontend Structure
* **app/ (Next.js App Router):** Pages and Layouts.
* **components/:** Atomic UI components (Buttons, Inputs) and complex organisms (AnalysisCard).
* **hooks/:** Custom React hooks for logic reuse (e.g., `useAnalysis`).
* **services/:** API client functions using Axios or Fetch to communicate with the Backend.
* **store/:** Client-side state management (Zustand or Context API).

## 4. Key Logic: The Analysis Engine
1.  **Input:** Raw string from User.
2.  **Processing:** * Normalize string (lowercase).
    * Split by comma.
    * Trim whitespace.
3.  **Matching:** * Query `Ingredients` table for IDs.
    * Query `IngredientRule` table filtered by `User.skinType`.
4.  **Output:** JSON object mapping each ingredient to a safety effect (GOOD → Sage Green, BAD → Dusty Rose, NEUTRAL → Soft Gray).





