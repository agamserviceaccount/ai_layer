# AI Agent Guidance

This repository provides an `ai_layer` CLI tool designed to manage and interact with AI agents within a repository context. It offers functionalities for auditing, generating, and fixing AI-related code and configurations.

## Shared Context

For foundational understanding of this project's AI architecture and principles, refer to the following files:

*   [`ai/project-context.md`](./ai/project-context.md): Core project information and architectural overview relevant to AI agents.
*   [`ai/standards.md`](./ai/standards.md): Guidelines and best practices for developing and interacting with AI agents in this repository.
*   [`ai/skills/typescript.md`](./ai/skills/typescript.md): Specific guidance for AI agents interacting with TypeScript code.

## Agent Implementations

The `ai_layer` CLI orchestrates various conceptual agents. Their primary implementation (adapter) files include:

*   **Repository Scanner Agent:** [`src/scan/repo-scanner.ts`](./src/scan/repo-scanner.ts)