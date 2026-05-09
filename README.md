# AI Layer Tool

A comprehensive CLI platform for AI-first software engineering, providing repository-aware context generation, AI layer auditing, and MCP server management.

## What is this?
AI Layer helps development teams manage their "AI context" — the hidden files (like `CLAUDE.md`, `.copilot-instructions.md`, `AGENTS.md`) that guide AI coding assistants. It ensures your AI context is healthy, token-efficient, and aligned with industry best practices.

## Quick Start

### Install via GitHub Packages
First, authenticate with GitHub Packages or add the registry to your `.npmrc`:
```bash
echo "@agamserviceaccount:https://npm.pkg.github.com" >> ~/.npmrc
```

Then install globally:
```bash
npm install -g @agamserviceaccount/ai_layer
```

Or run directly via `npx`:
```bash
npx @agamserviceaccount/ai_layer audit
```

## Architecture Overview
This is a robust TypeScript project engineered with a clear separation of concerns, designed specifically to operate as a self-contained AI-first engineering platform. The structure is divided as follows:
- `src/cli/` — The main CLI entry points, parsing user arguments with the `cac` library, formatting terminal output with `picocolors`, and routing commands to the correct sub-systems.
- `src/audit/` — The core rules and scoring logic engine. This directory evaluates AI context health across 8 dimensions (coverage, token efficiency, redundancy, context quality, and agent best practices).
- `src/scan/` — Recursive repository scanning. It walks the file system ignoring `.git` and `node_modules`, detecting monorepo subprojects and gathering `RepoFacts`.
- `src/output/` — Reporting and formatting layer. It converts raw audit data into actionable improvement plans, terminal tables, HTML dashboards, and JSON.
- `src/ai/` — Gemini AI integration layer. Used to power the `--ai` flag by reading local AI layer configurations and generating deep contextual insights.

## Features
- **Zero-Config Auditing**: Just run `ailayer audit` and get an instant score of your AI layer health out of 100.
- **Actionable Improvement Plans**: Every issue detected comes with a copy-pasteable prompt you can give to Claude or Copilot to fix the issue.
- **Monorepo Support**: Recursively scans down to 3 levels to find individual project adapters.
- **Agent Best Practices**: Checks configurations against the official Anthropic Claude Code and GitHub Copilot documentation.
- **Data-Driven Budgets**: Built on benchmark data from Next.js, React, and VS Code to establish realistic token limits.

## Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our workflow guidelines.
We welcome pull requests! Ensure you run the test suite and confirm all linters pass before submitting. Review our ADRs in `docs/adr/` to understand past architectural decisions.
