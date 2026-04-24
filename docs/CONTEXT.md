# SKINMATE - Project Context

## 1. Project Overview
* **Name:** SKINMATE - Skincare Ingredient Consulting & Checking Platform.
* **Target Audience:** Vietnamese Gen Z, high school/university students, and skincare beginners who lack deep chemical/dermatological knowledge.
* **Current Phase:** MVP (Minimum Viable Product). Speed and core functional completeness are prioritized over heavy micro-optimizations. 
* **Core Value:** Automate the tedious process of manually checking cosmetic ingredients (INCI lists). The system uses a Rule-based matching engine to evaluate ingredient safety based on the user's specific skin type.

## 2. Core Workflows (Do NOT deviate from this logic)
* **User Flow:** Register/Login -> Set Skin Type (Oily, Dry, Sensitive, Combination, Normal) -> Paste INCI string (comma-separated) -> System splits & trims -> System matches with `Ingredient_Rules` -> Return visual results.
* **Visual Evaluation System (Luxury Aesthetic):**
  * 🌸 **Dusty Rose (Bad):** Harmful/Irritating for the user's specific skin type.
  * 🌿 **Sage Green (Good):** Beneficial/Safe for the user's skin type.
  * ☁️ **Soft Gray (Neutral):** Neutral, or ingredient not found in the DB.
* **Recommendation Flow:** Automatically suggest Top 3 safe products (containing NO "Dusty Rose" ingredients for that user) after the analysis.

## 3. Tech Stack
* **Frontend:** Next.js (React), TailwindCSS v4, TypeScript. (Prioritize functional components and Hooks. Strict Luxury Design System applied).
* **Backend:** Node.js, Express.js, TypeScript.
* **Database:** MySQL managed via Prisma ORM.
* **Testing:** Jest & Supertest (Mandatory for testing features).
* **Package Manager:** `npm` or `pnpm`.

## 4. Absolute AI Directives (The "Never Do" List)
1. **NO Schema Alteration:** Never modify the Prisma/DB schema without explicit user confirmation.
2. **NO Ghost Dependencies:** Do not install new `npm` packages unless specifically requested or strictly necessary for the current task (must confirm first).
3. **MANDATORY Testing:** After writing code for a new feature or endpoint, you MUST provide the corresponding test cases (Unit/Integration) to verify it works.
4. **NO Environment Tampering:** Never modify `.env`, `.gitignore`, or core config files (e.g., `tsconfig.json`, `next.config.js`) outside of the initial setup scope.
5. **Scope Discipline:** Do NOT refactor code outside the immediate scope of the user's prompt. 
6. **API Contract Strictness:** Never change the JSON response format of existing APIs, as the Client application depends on strict contracts.