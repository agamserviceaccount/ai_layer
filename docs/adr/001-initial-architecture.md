# ADR-001: Data-Driven Token Budget Limits

**Status:** Accepted
**Date:** 2026-05-10

## Context
When auditing AI layer configurations, we needed a way to score token efficiency. Initially, we used an arbitrary cutoff limit (e.g., pass/fail if over X tokens). This proved inflexible and not reflective of real-world usage. 

## Decision
We decided to adopt a tiered scoring system based on real-world benchmarks derived from analyzing popular open-source repositories (Next.js, React, VS Code, TypeScript, OpenAI Codex).
- **Root Budget Limit**: Set to 3,000 tokens (the median across healthy open-source projects).
- **Scoped Budget Limit**: Set to 1,500 tokens.

## Consequences
- **Positive**: The audit tool now provides nuanced feedback (Lean vs. Healthy vs. Heavy vs. Bloated) instead of a binary pass/fail, making it much more actionable for developers.
- **Negative**: The calculation requires tracking both root context size and scoped context sizes, increasing the complexity of the audit logic.
