This document outlines the coding standards for the `ai_layer` TypeScript project. Adherence ensures consistency, maintainability, and quality.

### 1. Language & Frameworks
*   **Language:** TypeScript
*   **Runtime:** Node.js
*   **Primary Libraries:** Zod for validation, Vitest for testing.

### 2. Formatting & Linting
*   **Type Checking:** All code must pass TypeScript compilation. Verify by running the build command found in `ai/project-context.md`.
*   **Code Style:** While no explicit linter or formatter is configured, adhere to a consistent and idiomatic TypeScript style, mirroring existing codebase patterns.

### 3. Naming Conventions
*   **Files:** Use `kebab-case` for all filenames (e.g., `token-estimator.ts`, `repo-scanner.ts`). Directory entry points should be named `index.ts`.
*   **Variables & Functions:** Use `camelCase` (e.g., `fetchUserData`, `calculateTotal`).
*   **Types & Interfaces:** Use `PascalCase` (e.g., `UserConfig`, `IAuditResult`).
*   **Constants:** Use `UPPER_SNAKE_CASE` or `PascalCase` if part of an exported object/enum.

### 4. Testing Expectations
*   **Framework:** Vitest.
*   **Test Files:** Place test files alongside the module they test, using the `.test.ts` suffix (e.g., `src/core/config.test.ts`).
*   **Execution:** All tests must pass. Verify by running the test command.
*   **Coverage:** Ensure new or modified logic is covered by unit tests.

### 5. Code Structure & Patterns
*   **Modularity:** Maintain the existing modular structure within `src/` (e.g., `src/ai`, `src/audit`, `src/cli`).
*   **Validation:** Utilize `zod` for input and output schema validation where applicable.
*   **CLI Interactions:** Use `@clack/prompts` for interactive command-line elements.

### 6. Validation Checklist
*   [ ] The project builds without errors.
*   [ ] The tests pass without failures.
*   [ ] File names are `kebab-case` (except `index.ts`).
*   [ ] Variables and functions are `camelCase`.
*   [ ] Types and interfaces are `PascalCase`.
*   [ ] New or modified code includes relevant unit tests (`.test.ts`).
*   [ ] `zod` is used for schema validation where appropriate.