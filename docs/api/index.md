# API Documentation

## `runAudit(facts, fileContents, rootTokenBudget)`
The main entry point for the audit engine.
- **Parameters:**
  - `facts`: `RepoFacts` - The parsed metadata from the repository.
  - `fileContents`: `Record<string, string>` - The raw text content of AI configuration files.
  - `rootTokenBudget`: `number` - The threshold for token bloat evaluation.
- **Returns:**
  - `AuditReport` - Contains the overall score, subscores, token budgets, and a list of detected `AuditIssue` objects.

## `generateImprovementPlan(issues, facts)`
Maps audit issues to actionable prompts.
- **Parameters:**
  - `issues`: `AuditIssue[]` - The list of detected issues.
  - `facts`: `RepoFacts` - Used to inject project-specific context (like frameworks or build commands) into the prompts.
- **Returns:**
  - `ImprovementAction[]` - An array of prioritized prompts ready for output.
