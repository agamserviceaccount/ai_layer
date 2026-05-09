## Project Context: AI Layer CLI Tool

This project, `ai_layer`, is a TypeScript CLI tool (`ailayer`) designed to assist developers in building, maintaining, and auditing an "AI Layer" within their software projects. Its primary purpose is to streamline the integration and management of AI agents and Large Language Models (LLMs) by providing functionalities to scan, audit, generate, and fix AI-related code and configurations.

### Key Directories

-   **`src/cli`**: Contains the command-line interface logic, parsing user commands and orchestrating actions.
-   **`src/ai`**: Core modules for interacting with AI providers, managing prompts, and handling AI-generated content.
-   **`src/audit`**: Houses various audit modules to assess the quality, freshness, coverage, and token cost of AI layer components.
-   **`src/generate`**: Logic for generating structured AI-related code, such as adapters or canonical definitions.
-   **`src/fix`**: Modules designed to automatically identify and resolve common issues within the AI layer (e.g., deduplication, synchronizing adapters).
-   **`src/scan`**: Provides tools for scanning the repository to detect existing AI layer elements and project stacks.
-   **`src/core`**: Common utilities, configuration management, token estimation, and shared type definitions.
-   **`src/output`**: Handles formatting and rendering outputs in various formats (terminal, markdown, JSON, HTML).

### Operational Commands

-   **Build**: `npm run build` (Compiles TypeScript to JavaScript)
-   **Test**: `npm test` (Runs all unit tests using Vitest)
-   **Dev**: `npm run dev` (Executes the CLI tool directly using `tsx` for rapid development)

### Architecture Overview

The `ai_layer` tool follows a modular, CLI-driven architecture. It leverages `cac` for robust command-line parsing. The core logic is compartmentalized into distinct feature modules (`ai`, `audit`, `generate`, `fix`, `scan`), ensuring clear separation of concerns. It interacts with LLMs through dedicated `ai/provider.ts` modules and utilizes `js-tiktoken` for accurate token cost estimation. Configuration is centralized in `src/core/config.ts`, and `zod` is used for schema validation, enhancing type safety and data integrity. Output is rendered through a flexible `src/output` system.

### Key Dependencies

-   **`@google/genai`**: Provides an interface for interacting with Google's Generative AI models.
-   **`js-tiktoken`**: Essential for estimating token usage when working with LLMs, crucial for cost management and prompt optimization.
-   **`cac`**: A powerful and lightweight command-line argument parser, forming the backbone of the `ailayer` CLI.
-   **`zod`**: Used for schema declaration and validation, ensuring data consistency and reliability, especially for configurations and AI model interactions.
-   **`tsx`**: Facilitates a smooth development workflow by allowing direct execution of TypeScript files without manual compilation.
-   **`vitest`**: The chosen testing framework for robust and fast unit tests.