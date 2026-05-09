# AI Layer Tool Plan for Repository Context Engineering

## Purpose
Build a small CLI-first tool that initializes, audits, syncs, and optimizes repository-level AI context for GitHub Copilot and Claude Code, while keeping token and request overhead low.[cite:45][cite:47][cite:75]

The tool should treat the repository AI layer as an operational system made of shared context, agent-specific adapter files, scoped instruction files, and optimization rules, rather than as a set of disconnected prompt documents.[cite:45][cite:74][cite:95]

## Product goals
- Bootstrap a usable AI layer in greenfield repositories.[cite:45][cite:52]
- Normalize and improve repositories that already use Copilot or Claude heavily.[cite:45][cite:47]
- Evaluate quality, drift, redundancy, and token overhead of the current AI layer.[cite:81][cite:95]
- Regenerate thin adapter files from canonical shared context.[cite:45][cite:74]
- Provide clear scores, fix suggestions, and optional autofix support.[cite:81][cite:84]

## Non-goals
- Building a general-purpose coding agent runtime.[cite:75]
- Replacing GitHub Copilot or Claude Code.[cite:75][cite:116]
- Solving model selection, billing aggregation, or full developer analytics in v1.[cite:75][cite:98]

## Core concepts
### Canonical context
Store the main repository guidance in shared, neutral markdown files, then generate thin wrappers for each agent so both tools consume the same source of truth.[cite:45][cite:47][cite:74]

### Thin adapters
Use `.github/copilot-instructions.md` for GitHub Copilot and `CLAUDE.md` for Claude Code as adapter layers that point to shared repository guidance and include only tool-specific behavior.[cite:45][cite:47]

### Scoped context
Place optional instructions in subdirectories or task-specific prompt files so only relevant context is brought into a task.[cite:45][cite:109][cite:110]

### Cost-aware context
Every context file should justify its token cost by being specific, actionable, and path-relevant, because repository-level context can increase cost and step count when bloated.[cite:95][cite:103][cite:101]

## Supported repository outputs
The generated AI layer should support at least these files:

- `AGENTS.md` as the shared cross-agent root guide where applicable.[cite:45][cite:74]
- `.github/copilot-instructions.md` for repository-wide Copilot behavior.[cite:45]
- `CLAUDE.md` for Claude Code project context and conventions.[cite:47]
- `.github/instructions/*.instructions.md` for scoped Copilot instructions when needed.[cite:45]
- `.github/prompts/*.prompt.md` for reusable task prompts in VS Code/Copilot workflows.[cite:109][cite:110]
- `ai-layer.yaml` as the tool's canonical configuration file.

## Recommended architecture
Start with a CLI application in TypeScript for fast delivery, cross-platform support, and easy file-system and markdown tooling integration.[cite:75][cite:109]

### Recommended tech stack
To ensure the tool feels premium, fast, and modern (similar to modern scaffolders like `create-t3-app` or `create-svelte`), the following stack is recommended over heavyweight frameworks (like Oclif) or complex terminal renderers (like Ink) which can be overkill for a top-to-bottom flow:

- **Command Parsing:** [`cac`](https://github.com/cacjs/cac) or [`citty`](https://github.com/unjs/citty) - Lightweight, fast, and modern alternatives to Commander.js.
- **Terminal UI & Prompts:** [`@clack/prompts`](https://github.com/natemoo-re/clack) - Provides beautiful, accessible, and seamless step-by-step interactive prompts (perfect for `init` and `doctor` flows).
- **Styling & Colors:** [`picocolors`](https://github.com/alexeyraspopov/picocolors) - The fastest and smallest library for terminal colors.
- **Configuration & Validation:** [`zod`](https://github.com/colinhacks/zod) - Essential for strictly parsing and validating `ai-layer.yaml` to ensure structural integrity.
- **Output Formatting:** [`cli-table3`](https://github.com/cli-table/cli-table3) - For rendering the clear, human-readable scoring tables during the `audit` command.

Suggested package layout:

```text
src/
  cli/
    index.ts
    commands/
      init.ts
      audit.ts
      sync.ts
      doctor.ts
      report.ts
  core/
    types.ts
    config.ts
    scoring.ts
    token-estimator.ts
    path-matcher.ts
  scan/
    repo-scanner.ts
    stack-detector.ts
    ai-layer-detector.ts
    command-detector.ts
  generate/
    canonical/
      agents.ts
      shared-context.ts
    adapters/
      copilot.ts
      claude.ts
    scoped/
      instructions.ts
      prompts.ts
  audit/
    coverage.ts
    specificity.ts
    freshness.ts
    redundancy.ts
    token-cost.ts
    scope-quality.ts
  fix/
    dedupe.ts
    compress.ts
    split-scope.ts
    sync-adapters.ts
  output/
    terminal.ts
    markdown.ts
    json.ts
```

## CLI surface
### `init`
Create a new AI layer from repository signals and optional flags.[cite:45][cite:52]

Example:

```bash
ailayer init --monorepo --stack dotnet,playwright --agents copilot,claude
```

Behavior:
- Scan the repo for tech stack, package manager, build commands, test commands, CI files, and common directories.[cite:45][cite:52]
- Detect whether the repo is greenfield or already contains an AI layer.
- Create `ai-layer.yaml`.
- Create shared context files and thin adapters.
- Offer interactive confirmation before write unless `--yes` is passed.

### `audit`
Evaluate the current AI layer and produce scores, warnings, and optimization opportunities.[cite:81][cite:95]

Example:

```bash
ailayer audit --format table
ailayer audit --json > ailayer-report.json
```

### `sync`
Regenerate adapter files from canonical shared sources so `CLAUDE.md` and Copilot instruction files stay aligned.[cite:45][cite:74]

Example:

```bash
ailayer sync --prefer canonical
```

### `doctor`
Explain issues and optionally apply safe fixes such as deduplication, command correction, or scope splitting.[cite:84][cite:81]

Example:

```bash
ailayer doctor --fix redundancy,freshness,token-bloat
```

### `report`
Emit markdown or JSON reports for CI, pull requests, or repo documentation.

## Canonical config design
Use one structured config file as the authoritative model.

Example `ai-layer.yaml`:

```yaml
version: 1
mode: canonical
repo:
  type: monorepo
  detectedStacks:
    - dotnet
    - playwright
    - typescript
agents:
  copilot:
    enabled: true
    adapter: .github/copilot-instructions.md
  claude:
    enabled: true
    adapter: CLAUDE.md
shared:
  rootGuide: AGENTS.md
  files:
    - ai/standards.md
    - ai/project-context.md
    - ai/skills/dotnet.md
    - ai/skills/playwright.md
scopes:
  - path: tests/
    files:
      - ai/skills/playwright.md
      - .github/instructions/testing.instructions.md
  - path: src/backend/
    files:
      - ai/skills/dotnet.md
budgets:
  rootTokensMax: 3000
  scopedTokensMax: 1500
  duplicationMaxPercent: 15
  commandCoverageMinPercent: 80
```

## File generation rules
### Shared files
Create these first:
- `ai/standards.md` for coding standards, validation expectations, and repo-wide rules.
- `ai/project-context.md` for business/domain context, important directories, local commands, and repo map.
- `ai/skills/*.md` for stack-specific guidance such as .NET, Playwright, SQL, frontend, infra.

### Copilot adapter
Generate `.github/copilot-instructions.md` as a concise file that summarizes project usage and points to shared context, because GitHub documents it as the main repository custom instructions file.[cite:45]

It should include:
- what the app/repo does,
- how to build/test/validate,
- coding constraints,
- where shared guidance lives,
- what to check before completion.[cite:45][cite:52]

### Claude adapter
Generate `CLAUDE.md` as a short operational guide with repo commands, guardrails, important paths, and references to shared files, because Claude Code uses project context files and works well with hooks and settings for enforcement.[cite:47][cite:84]

It should include:
- first files to read,
- build/test commands,
- path boundaries,
- planning expectations for multi-file changes,
- references to hooks or protected files if configured.[cite:47][cite:84]

### Scoped files
Only generate scoped files when the repository clearly contains distinct zones with different conventions, such as `tests/`, `infra/`, or `src/backend/`.[cite:45][cite:109]

## Scoring model
Score from 0 to 100 with weighted sub-scores.

Suggested weights:
- Coverage: 15
- Specificity: 20
- Freshness: 15
- Scope quality: 15
- Redundancy: 10
- Token efficiency: 15
- Validation clarity: 10

### Coverage
Check whether the repository has the expected root and scoped files for the agents in use.[cite:45][cite:47]

### Specificity
Reward exact commands, concrete file paths, explicit validation steps, and named tools.[cite:45][cite:52]

### Freshness
Penalize references to missing files, outdated package managers, invalid commands, or removed directories.[cite:47][cite:84]

### Scope quality
Reward instructions that apply to the correct folders and avoid global noise.[cite:45][cite:109]

### Redundancy
Penalize repeated instructions across shared files, Copilot files, and Claude files.[cite:74][cite:81]

### Token efficiency
Measure loaded tokens, duplicate token waste, and actionability per token.[cite:95][cite:103]

### Validation clarity
Reward context files that tell the agent how to verify changes before considering the task done.[cite:45][cite:47]

## Token and request optimization model
The tool should explicitly estimate the cost of carrying this AI layer in every request.[cite:95][cite:101]

Track these metrics:
- `file_tokens`: estimated tokens per file.
- `root_load_tokens`: tokens loaded for a root-level task.
- `scoped_load_tokens`: tokens loaded for a path-specific task.
- `duplicate_tokens`: semantically repeated content.
- `actionable_density`: commands, paths, and constraints per 100 tokens.
- `scope_hit_rate`: proportion of loaded instructions relevant to the current path.[cite:95][cite:103]

Suggested formulas:

```text
loaded_tokens(task) = sum(tokens in files likely loaded for that task)

duplicate_waste_percent = duplicate_tokens / total_loaded_tokens * 100

actionable_density = (commands + path_rules + validation_rules) / total_tokens * 100

context_roi_score = usefulness_score / (loaded_tokens + estimated_step_inflation)
```

The exact scoring can be heuristic in v1; precision is less important than comparability between current and proposed layouts.[cite:96][cite:98]

## Optimization actions
The tool should suggest or apply these fixes:
- Move repeated rules into shared canonical files.[cite:74][cite:81]
- Replace narrative paragraphs with compact bullet rules or checklists.[cite:52][cite:95]
- Split root files into scoped files when irrelevant instructions dominate.[cite:45][cite:109]
- Remove stale commands or paths.[cite:47][cite:84]
- Shorten adapter files and make them reference shared content instead of duplicating it.[cite:45][cite:74]
- Add missing validation commands when absent.[cite:45][cite:52]

## Repo scanning implementation
The scanner should inspect:
- `README*`, `CONTRIBUTING*`, and docs for repo purpose and setup.[cite:52]
- `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` for JS toolchain.
- `.sln`, `.csproj`, `Directory.Build.props`, `.editorconfig` for .NET conventions.
- `playwright.config.*`, test folders, lint configs, format configs.
- `.github/workflows/*` and CI scripts for validation commands.
- Existing `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.github/prompts`, and `.github/instructions` files.[cite:45][cite:109]

Detection outputs should include:
- repo type,
- package manager,
- test frameworks,
- build commands,
- quality gates,
- candidate scopes,
- AI layer maturity status.

## Audit output design
Provide both machine-readable and human-readable output.

### Terminal summary
```text
AI Layer Score: 71/100
Coverage: 9/10
Specificity: 14/20
Freshness: 10/15
Scope Quality: 8/15
Redundancy: 4/10
Token Efficiency: 16/30

Top Issues:
1. CLAUDE.md duplicates 43% of AGENTS.md
2. Root context load estimated at 1,980 tokens exceeds budget 1,200
3. Copilot instructions missing exact test command for tests/ scope
```

### JSON output
Emit structured data so CI or dashboards can consume the report:

```json
{
  "score": 71,
  "subscores": {
    "coverage": 9,
    "specificity": 14,
    "freshness": 10,
    "scopeQuality": 8,
    "redundancy": 4,
    "tokenEfficiency": 16
  },
  "budgets": {
    "rootLoadTokens": 1980,
    "rootBudget": 1200,
    "scopedLoadTokens": 620,
    "duplicationWastePercent": 22
  },
  "issues": [
    {
      "code": "duplicate_adapter_content",
      "severity": "high",
      "message": "CLAUDE.md duplicates AGENTS.md heavily"
    }
  ]
}
```

## Safe autofix policy
Allow autofix only for deterministic changes:
- generating missing files,
- syncing adapter files from canonical sections,
- removing exact duplicates,
- correcting commands when detection confidence is high,
- splitting files using configurable templates.

Do not autofix when business meaning is uncertain, especially for domain language or architecture guidance; in those cases emit suggestions and a patch preview.[cite:84][cite:83]

## Claude-specific support
Support optional generation of `.claude/settings.local.json` guidance and hooks recommendations for enforcement-heavy teams, because Claude hooks can inject context, block risky actions, and enforce workflows when prose guidance alone becomes unreliable under long contexts.[cite:84][cite:83][cite:112]

Examples your tool can recommend:
- block edits to protected files,
- run formatting after edits,
- inject session-start reminders,
- run a lightweight evaluation hook for protected commands.[cite:84][cite:83]

## Copilot-specific support
Support repository custom instructions and reusable prompt files, because GitHub documents both as supported customization mechanisms in IDE workflows.[cite:45][cite:109][cite:110]

Later, if needed, the tool can expose its audit engine through the Copilot SDK as an embedded agent or workflow service, because the SDK now exposes the production agent runtime in public preview.[cite:75]

## Implementation phases
### Phase 1: CLI skeleton
- Set up command parsing, config loading, file IO, and markdown rendering.
- Implement repo scan and stack detection.
- Implement `init` with static templates.
- Implement `audit` with basic presence and freshness checks.

### Phase 2: canonical model
- Add `ai-layer.yaml`.
- Add generation from canonical internal model.
- Add `sync` to regenerate adapters.
- Add markdown and JSON reports.

### Phase 3: scoring and optimization
- Add token estimation.
- Add duplication detection.
- Add scope quality scoring.
- Add optimization suggestions and budget checks.

### Phase 4: doctor and autofix
- Add safe autofix engine.
- Add diff previews.
- Add command correction and file splitting.

### Phase 5: integrations
- Add CI mode with non-zero exit on threshold failure.
- Add optional Claude hooks recommendations.
- Add optional SDK-backed integrations later for richer UIs.[cite:75][cite:84]

## Suggested coding-agent task sequence
Use this exact implementation sequence in your coding agent.

### Task 1: create project skeleton
Create a TypeScript CLI app with commands `init`, `audit`, `sync`, and `doctor`. Add linting, tests, and a small fixtures directory for sample repos.

### Task 2: build repo scanner
Implement scanners for:
- JS package manager files
- .NET solution and project files
- Playwright configs
- GitHub workflows
- existing AI-layer files

Output a normalized `RepoFacts` object.

### Task 3: define internal schema
Create types for:
- `RepoFacts`
- `AiLayerConfig`
- `AiLayerFile`
- `AuditIssue`
- `AuditReport`
- `TokenBudgetReport`

### Task 4: implement generators
Generate:
- `AGENTS.md`
- `ai/standards.md`
- `ai/project-context.md`
- `.github/copilot-instructions.md`
- `CLAUDE.md`
- optional scoped instruction files

### Task 5: implement audit engine
Check:
- file presence,
- missing commands,
- stale references,
- duplicated content,
- token size,
- path relevance,
- validation guidance.

### Task 6: implement token estimator
Use a tokenizer library and add heuristic inclusion rules for root tasks and scoped tasks. Produce root-vs-scoped cost comparisons.

### Task 7: implement doctor fixes
Add deterministic transforms for:
- adapter slimming,
- deduplication,
- command insertion,
- scope splitting,
- config sync.

### Task 8: implement reports
Create table output for terminal, JSON output for automation, and markdown output for repo documentation.

### Task 9: add tests
Cover:
- greenfield repo init,
- repo with only Copilot,
- repo with only Claude,
- repo with duplicated files,
- monorepo with scoped instructions,
- token budget violations.

### Task 10: polish UX
Add:
- `--dry-run`
- `--yes`
- `--json`
- `--fix`
- `--budget-root`
- `--budget-scoped`
- clear remediation suggestions.

## Prompt you can give your coding agent
Use this prompt as a starting instruction:

```text
Build a TypeScript CLI named ailayer.

Goal:
Create a repo tool that can initialize, audit, sync, and optimize repository AI context for GitHub Copilot and Claude Code.

Requirements:
- Use a canonical config file named ai-layer.yaml.
- Generate AGENTS.md, CLAUDE.md, and .github/copilot-instructions.md from shared source files.
- Support scoped instruction files and Copilot prompt files.
- Audit coverage, specificity, freshness, redundancy, validation clarity, scope quality, and token efficiency.
- Estimate token cost for root and scoped tasks.
- Recommend or safely apply fixes for duplication and context bloat.
- Output human-readable tables and JSON.
- Add tests with fixture repos for greenfield, Copilot-only, Claude-only, and monorepo cases.

Implementation order:
1. Define schema and CLI commands.
2. Implement repo scanning and existing AI-layer detection.
3. Implement file generators.
4. Implement audit engine.
5. Implement token estimator and optimization logic.
6. Implement doctor autofix.
7. Add tests and polish.

Quality bar:
- Keep adapters thin.
- Avoid duplicating shared guidance across files.
- Favor exact commands and file paths over generic prose.
- Keep root context under a configurable token budget.
- Produce deterministic output.
```

## v1 success criteria
Version 1 is successful if it can do all of the following on real repos:
- initialize a useful AI layer in a fresh repo,[cite:45][cite:52]
- detect and score an existing messy AI layer,[cite:81][cite:95]
- reduce duplicated instructions across Copilot and Claude files,[cite:74][cite:81]
- lower estimated root context cost through scope-aware restructuring,[cite:95][cite:103]
- produce output that a coding agent can implement and maintain predictably.[cite:75][cite:84]
