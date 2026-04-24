# SKINMATE - Project Rules & Conventions

## 1. Coding Philosophy (CRITICAL)
* **Readability over Cleverness:** Prioritize easy-to-understand, maintainable, and predictable code over overly optimized, concise, or "clever" code. Write code as if the person maintaining it is a junior developer.
* **KISS (Keep It Simple, Stupid):** Avoid premature abstraction. Don't build complex generic factories if a simple function does the job.
* **Fail Fast & Loud:** Validate inputs early. Throw clear, descriptive errors immediately when something goes wrong instead of letting the app fail silently later.

## 2. Naming Conventions
* **Files & Folders:** * React Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`).
  * Hooks/Utils/Services: `camelCase.ts` (e.g., `useSkinAnalysis.ts`, `formatDate.ts`).
* **Variables & Functions:** `camelCase` (e.g., `isUserLoggedIn`, `calculateSafetyScore`). Use descriptive verbs for functions (`get`, `set`, `fetch`, `handle`, `calculate`).
* **Types & Interfaces:** `PascalCase` with NO 'I' prefix (e.g., `UserProfile`, `IngredientRule`, NOT `IUserProfile`).
* **Constants:** `UPPER_SNAKE_CASE` for global constants (e.g., `MAX_RETRY_COUNT`).

## 3. Code Style & Formatting
* **Quotes:** Use single quotes (`'`) for JS/TS strings, double quotes (`"`) for JSX attributes.
* **Semicolons:** Always use semicolons (`;`) at the end of statements.
* **Indentation:** 2 spaces.
* **Comments:** Explain the *WHY*, not the *WHAT*. (e.g., DO NOT comment `// Loop through ingredients`, DO comment `// Need to reverse loop to match the API priority requirement`). Use JSDoc for complex functions.

## 4. Architecture & Patterns
* **Functional Programming:** Favor pure functions. DO NOT use Class Components in React. Use Hooks.
* **Async/Await:** Always use `async/await` with `try/catch` blocks. Absolutely NO Promise chaining (`.then().catch()`).
* **Early Return (Guard Clauses):** Handle error/edge cases at the top of the function and return early to avoid deep nesting (Arrow Anti-Pattern).
* **State Management:** Use standard React Context/Hooks for local state. For server state/data fetching, use `SWR` or `React Query`.

## 5. The "Never Do" List (Anti-Patterns)
* **NO Magic Numbers/Strings:** Extract them into named constants.
* **NO Nested Ternaries:** Never nest `condition ? a : b` inside another ternary. Use `if/else` or separate variables for readability.
* **NO Inline Styles:** Use TailwindCSS v4 utility classes exclusively. Adhere to the SKINMATE Luxury Design System (rose accents, soft shadows, serif headings).
* **NO `any` Type:** This is a TypeScript project. Use explicit typing, generics, or `unknown` if absolutely necessary. Using `any` is a strict failure.

## 6. Mandatory AI Workflow Requirements
* **Test-Driven Delivery:** After generating a feature's code, you MUST automatically generate the corresponding Unit Tests (using Jest/React Testing Library) without waiting for the user to ask.
* **Linting:** Assume the project uses standard ESLint and Prettier. Do not output code that would fail basic linting rules (e.g., unused variables, missing dependencies in `useEffect` arrays).