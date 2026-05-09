# RFC-001: Context Quality Scoring

**Author:** AI Agent
**Date:** 2026-05-10

## Summary
Introduce a "Context Quality" dimension to the audit engine.

## Motivation
AI models perform significantly better when they have access to architectural intent, design decisions, and contribution workflows. By auditing for the presence of these "living documents", we incentivize repository owners to maintain them.

## Implementation
1. Add `ContextQualityFacts` to `RepoFacts` gathered during the scan phase.
2. Check for `README.md` length, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `docs/adr/`, `docs/rfc/`, and API documentation.
3. Score out of 10 and integrate into the main audit report.
