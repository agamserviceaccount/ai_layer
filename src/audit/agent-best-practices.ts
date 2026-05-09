import { AuditIssue, AiLayerFacts } from '../core/types.js';

// Best practice rules derived from official documentation:
//
// CLAUDE.md — https://docs.anthropic.com/en/docs/claude-code/memory
//   ✓ Be specific: "Use 2-space indentation" not "Format code properly"
//   ✓ Include actionable commands: "Run npm test before committing"
//   ✓ Include file path references: "API handlers live in src/api/handlers/"
//   ✓ Use @imports to pull in context: @README, @package.json, @docs/...
//   ✓ Use .claude/rules/ for path-scoped rules
//   ✓ Keep it concise — loaded into every session's context window
//   ✓ Support AGENTS.md as cross-agent compatible root guide
//
// copilot-instructions.md — https://docs.github.com/en/copilot/customizing-copilot/
//   ✓ Use natural language, short paragraphs
//   ✓ Document coding conventions (naming, spacing, patterns)
//   ✓ Include test commands and validation steps
//   ✓ Use .github/instructions/*.instructions.md for scoped instructions
//   ✓ Keep instructions under 8K characters (GitHub enforced limit)
//   ✓ Avoid contradictory instructions

interface BestPracticeCheck {
  id: string;
  label: string;
  agent: 'claude' | 'copilot' | 'both';
  check: (content: string, allContents: Record<string, string>, aiLayer: AiLayerFacts) => boolean;
  failMessage: string;
  severity: 'low' | 'medium' | 'high';
}

const CHECKS: BestPracticeCheck[] = [
  // ─── CLAUDE.md best practices ───
  {
    id: 'claude_has_commands',
    label: 'CLAUDE.md mentions build/test commands',
    agent: 'claude',
    check: (content) => /\b(npm|yarn|pnpm|bun|dotnet|make|cargo|go)\s+(run\s+)?(build|test|dev|start|lint|check)\b/i.test(content),
    failMessage: 'CLAUDE.md should include explicit build/test commands (e.g., "npm run build", "npm test"). Anthropic docs: "Run npm test before committing" not "Test your changes".',
    severity: 'high',
  },
  {
    id: 'claude_has_file_paths',
    label: 'CLAUDE.md references specific file paths',
    agent: 'claude',
    check: (content) => /\b(src|lib|app|packages|api|components|utils|config|test)\/\S+/i.test(content),
    failMessage: 'CLAUDE.md should reference specific file/directory paths. Anthropic docs: "API handlers live in src/api/handlers/" not "Keep files organized".',
    severity: 'medium',
  },
  {
    id: 'claude_uses_imports',
    label: 'CLAUDE.md uses @imports for external context',
    agent: 'claude',
    check: (content) => /@\w+/.test(content) || /@\S+\.md/.test(content),
    failMessage: 'CLAUDE.md can use @imports to pull in additional context (e.g., "@README", "@package.json"). This keeps the file lean while providing rich context.',
    severity: 'low',
  },
  {
    id: 'claude_is_specific',
    label: 'CLAUDE.md uses specific instructions (not vague)',
    agent: 'claude',
    check: (content) => {
      const vague = /\b(format code properly|keep files organized|test your changes|write clean code|follow best practices)\b/i;
      return !vague.test(content);
    },
    failMessage: 'CLAUDE.md contains vague instructions. Anthropic best practice: use specific directives like "Use 2-space indentation" instead of "Format code properly".',
    severity: 'medium',
  },
  {
    id: 'claude_has_rules_dir',
    label: '.claude/rules/ directory exists for scoped rules',
    agent: 'claude',
    check: (_content, _all, aiLayer) => {
      // Check for .claude/ rules presence — indicated by existing scoped prompts
      return aiLayer.existingPrompts.length > 0 || aiLayer.existingSkills.length > 0;
    },
    failMessage: 'No .claude/rules/ directory found. Anthropic recommends using .claude/rules/ for path-specific rules (e.g., testing.md, api-design.md). These load only when relevant files are touched.',
    severity: 'low',
  },
  {
    id: 'claude_has_guardrails',
    label: 'CLAUDE.md includes guardrails or constraints',
    agent: 'claude',
    check: (content) => {
      return /\b(don't|do not|never|always|must|required|forbidden|avoid|guardrail)\b/i.test(content);
    },
    failMessage: 'CLAUDE.md should include guardrails — things the agent must always or never do. Example: "Always run tests before committing", "Never modify generated files".',
    severity: 'medium',
  },

  // ─── copilot-instructions.md best practices ───
  {
    id: 'copilot_has_conventions',
    label: 'Copilot instructions document coding conventions',
    agent: 'copilot',
    check: (content) => {
      return /\b(convention|style|naming|indent|spacing|format|pattern|prefer|camelCase|PascalCase|snake_case|kebab-case)\b/i.test(content);
    },
    failMessage: 'copilot-instructions.md should document coding conventions (naming, indentation, import style). GitHub docs: "Use natural language to describe coding standards."',
    severity: 'medium',
  },
  {
    id: 'copilot_has_test_command',
    label: 'Copilot instructions include test command',
    agent: 'copilot',
    check: (content) => /\b(npm|yarn|pnpm|bun|dotnet|make|cargo|go)\s+(run\s+)?(test|check)\b/i.test(content),
    failMessage: 'copilot-instructions.md should reference the test command so Copilot can validate changes.',
    severity: 'medium',
  },
  {
    id: 'copilot_under_8k',
    label: 'Copilot instructions under 8K characters',
    agent: 'copilot',
    check: (content) => content.length <= 8000,
    failMessage: 'copilot-instructions.md exceeds 8,000 characters. GitHub enforces this limit — content beyond 8K is silently truncated.',
    severity: 'high',
  },
  {
    id: 'copilot_uses_scoped_instructions',
    label: 'Scoped .github/instructions/ files exist',
    agent: 'copilot',
    check: (_content, _all, aiLayer) => aiLayer.existingScopes.length > 0,
    failMessage: 'No scoped instruction files found in .github/instructions/. GitHub supports *.instructions.md files with glob-based scoping for path-specific guidance.',
    severity: 'low',
  },

  // ─── Cross-agent best practices ───
  {
    id: 'agents_md_exists',
    label: 'AGENTS.md exists as cross-agent root guide',
    agent: 'both',
    check: (_content, _all, aiLayer) => aiLayer.hasAgentsMd,
    failMessage: 'AGENTS.md is the cross-agent compatible root guide recognized by Claude, Copilot CLI, Cursor, Windsurf, and others. Create one to serve all agents from a single source.',
    severity: 'high',
  },
  {
    id: 'no_duplicate_commands',
    label: 'Commands are not duplicated across files',
    agent: 'both',
    check: (_content, allContents) => {
      const files = Object.values(allContents);
      if (files.length < 2) return true;
      // Check if exact same command line appears in multiple files
      const commandRegex = /`((?:npm|yarn|pnpm|bun|dotnet)\s+(?:run\s+)?(?:build|test|dev|lint|start))`/gi;
      const commandsByFile = files.map(f => [...f.matchAll(commandRegex)].map(m => m[1].toLowerCase()));
      const allCommands = commandsByFile.flat();
      const unique = new Set(allCommands);
      return allCommands.length - unique.size <= 1; // Allow 1 overlap
    },
    failMessage: 'Build/test commands appear in multiple files. Centralize commands in AGENTS.md or ai/project-context.md and reference them from adapters to avoid drift.',
    severity: 'low',
  },
];

export function auditAgentBestPractices(
  fileContents: Record<string, string>,
  aiLayer: AiLayerFacts
): { score: number; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  let passed = 0;
  let applicable = 0;

  const claudeContent = fileContents['CLAUDE.md'] || '';
  const copilotContent = fileContents['.github/copilot-instructions.md'] || '';

  for (const check of CHECKS) {
    // Skip checks for agents whose files don't exist
    if (check.agent === 'claude' && !claudeContent) continue;
    if (check.agent === 'copilot' && !copilotContent) continue;

    applicable++;
    const content = check.agent === 'claude' ? claudeContent : (check.agent === 'copilot' ? copilotContent : '');
    const result = check.check(content, fileContents, aiLayer);

    if (result) {
      passed++;
    } else {
      issues.push({
        code: `bp_${check.id}`,
        severity: check.severity,
        message: check.failMessage,
        file: check.agent === 'claude' ? 'CLAUDE.md' : (check.agent === 'copilot' ? '.github/copilot-instructions.md' : undefined),
      });
    }
  }

  // Score: 0-10 based on percentage of checks passed
  const score = applicable > 0 ? Math.round((passed / applicable) * 10) : 0;
  return { score: Math.min(10, score), issues };
}
