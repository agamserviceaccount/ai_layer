# System Architecture

## System Overview
The AI Layer tool is a CLI platform that parses a repository's structure, extracts metadata, audits the health of AI customization files, and generates improvements. It uses a modular pipeline to process the repository state and provide actionable feedback.

## Component Map
- **\`src/cli/\`**: The user interface layer, parsing arguments and coordinating commands using `cac`.
- **\`src/scan/\`**: The extraction layer, responsible for traversing the file system, identifying subprojects, and parsing `.md` and `.json` AI files.
- **\`src/audit/\`**: The core business logic layer, containing pure functions that score various dimensions (coverage, token efficiency, best practices).
- **\`src/output/\`**: The presentation layer, transforming audit results into Terminal tables, Markdown, HTML, and JSON.
- **\`src/ai/\`**: The external integration layer, wrapping the Google Gen AI SDK to provide qualitative insights when `--ai` is passed.

## Data Flow
1. User invokes CLI command (e.g., `ailayer audit`).
2. `repo-scanner.ts` traverses the directory and returns `RepoFacts`.
3. `io.ts` reads the actual contents of the detected AI layer files.
4. `audit/index.ts` processes `RepoFacts` and file contents through all audit dimensions to produce an `AuditReport`.
5. `output/improvement-plan.ts` maps identified issues to actionable prompts.
6. Formatters render the `AuditReport` and plan to the user.

## Key Abstractions
- **\`RepoFacts\`**: The central data structure holding all extracted metadata.
- **\`AuditReport\`**: The unified output of the audit engine, containing numeric scores and categorized `AuditIssue` objects.

## Dependencies
- **\`cac\`**: Lightweight CLI framework chosen for its simplicity and speed.
- **\`zod\`**: Used for schema validation, especially when parsing MCP server configurations.
- **\`js-tiktoken\`**: Accurately estimates token usage locally without API calls.
- **\`@google/genai\`**: Provides deep qualitative analysis using Gemini 2.5 Flash.

## Extension Points
New audit rules can be added by creating a new file in `src/audit/`, implementing a function that returns an `{ score, issues }` object, and wiring it into `runAudit()` in `src/audit/index.ts`.
