import { AuditIssue, RepoFacts } from '../core/types.js';

interface ImprovementAction {
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  prompt: string;
}

const ISSUE_ACTIONS: Record<string, (facts: RepoFacts) => ImprovementAction> = {
  readme_missing: (facts) => ({
    title: 'Create README.md',
    priority: 'critical',
    prompt: `Create a README.md for this ${facts.stacks.join('/')} project. Include:
- Project name and one-line description
- What problem it solves and who it's for
- Quick start instructions (install, build, run)
- Build command: ${facts.buildCommands[0] || 'N/A'}
- Test command: ${facts.testCommands[0] || 'N/A'}
- High-level architecture overview (list key directories and their purpose)
- Contributing guidelines summary
Keep it under 500 words. Use badges if applicable.`
  }),

  readme_thin: (facts) => ({
    title: 'Expand README.md',
    priority: 'medium',
    prompt: `The README.md is too thin. Expand it to include:
- A clear "What is this?" section explaining the project purpose
- Architecture overview listing key directories: ${facts.stacks.join(', ')} project
- Getting started with exact commands: build (${facts.buildCommands[0] || 'N/A'}), test (${facts.testCommands[0] || 'N/A'})
- Key design decisions or trade-offs
Aim for 200-400 words. Every section should help an AI agent understand context faster.`
  }),

  architecture_missing: (facts) => ({
    title: 'Create ARCHITECTURE.md',
    priority: 'high',
    prompt: `Create an ARCHITECTURE.md document for this ${facts.type} ${facts.stacks.join('/')} repository. Include:
1. **System Overview** — What the system does at a high level (2-3 sentences)
2. **Component Map** — List each top-level directory and its responsibility
3. **Data Flow** — How data moves through the system (request → processing → response)
4. **Key Abstractions** — The core interfaces, patterns, or domain models
5. **Dependencies** — Why each major dependency was chosen
6. **Extension Points** — How to add new features without modifying core code

This document is critical for AI agents — it lets them understand WHERE to make changes and HOW components relate to each other. Keep it under 600 words.`
  }),

  contributing_missing: () => ({
    title: 'Create CONTRIBUTING.md',
    priority: 'low',
    prompt: `Create a CONTRIBUTING.md that covers:
- Branch naming convention
- Commit message format (conventional commits recommended)
- PR process and review expectations
- Code style requirements
- How to run tests locally before submitting
- What NOT to do (e.g., don't modify generated files, lock files)

Keep it focused and actionable. AI agents use this to follow your team's workflow.`
  }),

  adrs_missing: () => ({
    title: 'Start Architecture Decision Records',
    priority: 'low',
    prompt: `Create a docs/adr/ directory and add your first ADR using this template:

# ADR-001: [Decision Title]

**Status:** Accepted
**Date:** [Today's date]

## Context
[What problem or question prompted this decision?]

## Decision
[What was decided and why?]

## Consequences
[What are the trade-offs? What becomes easier/harder?]

---

Start with 2-3 ADRs covering your most important past decisions (e.g., choice of framework, database, architecture pattern). AI agents reference ADRs to avoid suggesting changes that contradict deliberate past decisions.`
  }),

  missing_agents_md: (facts) => ({
    title: 'Create AGENTS.md',
    priority: 'critical',
    prompt: `Create an AGENTS.md file — this is the canonical root guide for all AI agents. Include:
- One-line project description
- Pointers to shared context files (ai/standards.md, ai/project-context.md)
- List of agent adapter files (CLAUDE.md, .github/copilot-instructions.md)
- Build: ${facts.buildCommands[0] || 'N/A'} | Test: ${facts.testCommands[0] || 'N/A'}
Keep it under 300 words. This file is loaded into every AI interaction — be concise.`
  }),

  missing_claude_md: (facts) => ({
    title: 'Create CLAUDE.md',
    priority: 'high',
    prompt: `Create a CLAUDE.md adapter file for Claude Code. It must be:
- Under 200 words (loaded into every session)
- Operational: first files to read, build/test commands
- Guardrails: what Claude should NOT do
- Pointer to AGENTS.md and ai/ shared context
Build: ${facts.buildCommands[0] || 'N/A'} | Test: ${facts.testCommands[0] || 'N/A'}
Do NOT duplicate content from AGENTS.md — reference it instead.`
  }),

  missing_copilot_instructions: (facts) => ({
    title: 'Create .github/copilot-instructions.md',
    priority: 'high',
    prompt: `Create .github/copilot-instructions.md for GitHub Copilot. Include:
- Preferred coding patterns and naming conventions for ${facts.stacks.join(', ')}
- Import style preferences
- Test command: ${facts.testCommands[0] || 'N/A'}
- Reference to AGENTS.md for full context
Keep under 200 words — this is loaded into every Copilot suggestion.`
  }),

  missing_test_command: (facts) => ({
    title: 'Document test commands',
    priority: 'medium',
    prompt: `Your AI layer files don't mention the test command. Add "${facts.testCommands[0] || 'npm test'}" to your CLAUDE.md and copilot-instructions.md files. AI agents need to know how to verify their changes.`
  }),

  missing_build_command: (facts) => ({
    title: 'Document build commands',
    priority: 'medium',
    prompt: `Your AI layer files don't mention the build command. Add "${facts.buildCommands[0] || 'npm run build'}" to your CLAUDE.md and ai/project-context.md files.`
  }),

  redundant_content: () => ({
    title: 'Remove duplicated content',
    priority: 'medium',
    prompt: `Your adapter files (CLAUDE.md or copilot-instructions.md) are duplicating content from AGENTS.md or ai/ shared files. Replace the duplicated sections with a pointer like:

> For coding standards, see [ai/standards.md](ai/standards.md)

This saves tokens and ensures a single source of truth. Run \`ailayer doctor --fix redundancy\` to auto-fix.`
  }),

  token_budget_exceeded: () => ({
    title: 'Reduce root context size',
    priority: 'medium',
    prompt: `Your root AI context exceeds the recommended budget (3,000 tokens based on popular repo benchmarks). To reduce it:
1. Move detailed rules from root files into scoped files (.github/instructions/*.md)
2. Replace verbose explanations with concise bullet points
3. Ensure adapters point to shared context instead of duplicating it
4. Run \`ailayer doctor --fix adapter-slimming\` to auto-trim adapters`
  }),

  token_budget_bloated: () => ({
    title: 'Aggressively trim root context',
    priority: 'critical',
    prompt: `Your root AI context exceeds 5,000 tokens — larger than every popular open-source repo we benchmarked (React, Next.js, VS Code, TypeScript, OpenAI Codex). Actions:
1. Split monolithic files into scoped instructions per directory
2. Remove all duplicate content between files
3. Convert prose to terse bullet points
4. Move implementation details to ai/skills/ files (only loaded when relevant)
5. Run \`ailayer doctor --fix adapter-slimming,redundancy\``
  }),

  token_budget_sparse: () => ({
    title: 'Add more actionable guidance',
    priority: 'low',
    prompt: `Your AI layer files are very sparse (under 100 tokens). Consider adding:
- Exact build and test commands
- Key directories and their purposes
- Coding conventions and patterns to follow
- Common mistakes to avoid
Run \`ailayer init --ai\` to generate context-aware files using Gemini.`
  }),

  stale_npm_install_g: () => ({
    title: 'Remove stale npm patterns',
    priority: 'medium',
    prompt: `Your AI layer references \`npm install -g\`. Modern Node.js projects use \`npx\` or project-local installs. Update your documentation to use current patterns.`
  }),

  subproject_no_context: () => ({
    title: 'Add AI context to subprojects',
    priority: 'low',
    prompt: `Some subprojects in your monorepo have no AI layer files. Add a CLAUDE.md or .github/instructions/<project>.instructions.md to each subproject with:
- What this subproject does
- How to build/test it independently
- Key files and patterns specific to this subproject`
  }),

  missing_validation: () => ({
    title: 'Add validation instructions',
    priority: 'medium',
    prompt: `Your AI layer doesn't tell agents how to validate their work. Add a section like:

## Validation
Before completing any task:
1. Run \`npm run build\` — must compile without errors
2. Run \`npm test\` — all tests must pass
3. Check for lint errors if applicable

This prevents AI agents from declaring tasks "done" without verification.`
  }),

  // Agent Best Practices
  bp_claude_has_commands: (facts) => ({
    title: 'Add actionable commands to CLAUDE.md',
    priority: 'high',
    prompt: `Update CLAUDE.md to include explicit execution commands. Anthropic recommends actionable instructions like "Run ${facts.testCommands[0] || 'npm test'} before committing" instead of vague phrases like "Test your changes".`
  }),
  bp_claude_has_file_paths: () => ({
    title: 'Add file path references to CLAUDE.md',
    priority: 'medium',
    prompt: `Update CLAUDE.md to reference specific directory paths for architecture components. Anthropic recommends explicit paths like "API handlers live in src/api/handlers/" instead of "Keep files organized".`
  }),
  bp_claude_uses_imports: () => ({
    title: 'Use @imports in CLAUDE.md',
    priority: 'low',
    prompt: `Consider using @imports in your CLAUDE.md to pull in external context (e.g., "@README.md", "@docs/architecture.md"). This keeps the file lean while providing rich context when needed.`
  }),
  bp_claude_is_specific: () => ({
    title: 'Use specific directives in CLAUDE.md',
    priority: 'medium',
    prompt: `CLAUDE.md contains vague instructions. Anthropic best practice: use specific directives like "Use 2-space indentation" instead of "Format code properly". Revise vague guidance to be explicit.`
  }),
  bp_claude_has_rules_dir: () => ({
    title: 'Create .claude/rules/ directory',
    priority: 'low',
    prompt: `Anthropic recommends using a .claude/rules/ directory for path-specific rules (e.g., .claude/rules/testing.md). These rules load automatically when relevant files are touched, saving tokens on unrelated tasks.`
  }),
  bp_claude_has_guardrails: () => ({
    title: 'Add guardrails to CLAUDE.md',
    priority: 'medium',
    prompt: `CLAUDE.md should include explicit guardrails—constraints the agent must always respect. Example: "Never modify generated files," or "Always run tests before committing."`
  }),
  bp_copilot_has_conventions: () => ({
    title: 'Document coding conventions for Copilot',
    priority: 'medium',
    prompt: `copilot-instructions.md should explicitly document coding conventions (e.g., naming, indentation, pattern preferences). GitHub's best practice is to "Use natural language to describe coding standards."`
  }),
  bp_copilot_has_test_command: (facts) => ({
    title: 'Add test command to Copilot instructions',
    priority: 'medium',
    prompt: `copilot-instructions.md should reference the test command (${facts.testCommands[0] || 'npm test'}) so Copilot can validate or suggest test executions.`
  }),
  bp_copilot_under_8k: () => ({
    title: 'Truncate Copilot instructions under 8K characters',
    priority: 'high',
    prompt: `Your copilot-instructions.md exceeds 8,000 characters. GitHub enforces this limit and silently truncates anything beyond 8K. Split it into scoped instructions (.github/instructions/*.instructions.md) or trim verbosity.`
  }),
  bp_copilot_uses_scoped_instructions: () => ({
    title: 'Use scoped Copilot instructions',
    priority: 'low',
    prompt: `Consider adding scoped instruction files (.github/instructions/*.instructions.md) to provide path-specific guidance without bloating the root instructions file.`
  }),
  bp_agents_md_exists: () => ({
    title: 'Create an AGENTS.md file',
    priority: 'high',
    prompt: `AGENTS.md is the emerging standard cross-agent root guide (recognized by Claude, Copilot, Cursor, Windsurf). Create it to centralize core pointers rather than repeating them across all agent adapters.`
  }),
  bp_no_duplicate_commands: () => ({
    title: 'De-duplicate commands across adapters',
    priority: 'low',
    prompt: `Build/test commands are duplicated across multiple AI adapter files. Centralize them in AGENTS.md or ai/project-context.md to maintain a single source of truth.`
  }),
};

export function generateImprovementPlan(issues: AuditIssue[], facts: RepoFacts): ImprovementAction[] {
  const actions: ImprovementAction[] = [];
  const seen = new Set<string>();

  for (const issue of issues) {
    if (seen.has(issue.code)) continue;
    seen.add(issue.code);

    const generator = ISSUE_ACTIONS[issue.code];
    if (generator) {
      actions.push(generator(facts));
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actions;
}

export function formatImprovementPlan(actions: ImprovementAction[]): string {
  if (actions.length === 0) return '';

  const lines: string[] = [
    '\n📋 Improvement Plan',
    '═'.repeat(50),
    ''
  ];

  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    const badge = a.priority === 'critical' ? '🔴' : a.priority === 'high' ? '🟠' : a.priority === 'medium' ? '🟡' : '🔵';
    lines.push(`${badge} ${i + 1}. ${a.title} [${a.priority.toUpperCase()}]`);
    lines.push('─'.repeat(40));
    lines.push(a.prompt);
    lines.push('');
  }

  return lines.join('\n');
}

export function formatImprovementPlanMarkdown(actions: ImprovementAction[]): string {
  if (actions.length === 0) return '';

  let md = '\n## 📋 Improvement Plan\n\n';

  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    md += `### ${i + 1}. ${a.title}\n`;
    md += `**Priority:** ${a.priority.toUpperCase()}\n\n`;
    md += `${a.prompt}\n\n---\n\n`;
  }

  return md;
}
