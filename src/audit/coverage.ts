import { AiLayerFacts, AuditIssue } from '../core/types.js';

export function auditCoverage(facts: AiLayerFacts): { score: number, issues: AuditIssue[] } {
  let score = 15;
  const issues: AuditIssue[] = [];

  if (!facts.hasAgentsMd) {
    score -= 5;
    issues.push({ code: 'missing_agents_md', severity: 'medium', message: 'Missing AGENTS.md canonical guide.' });
  }

  if (!facts.hasClaudeMd && !facts.hasCopilotInstructions) {
    score -= 10;
    issues.push({ code: 'missing_adapters', severity: 'high', message: 'No AI agent adapters found (CLAUDE.md or .github/copilot-instructions.md).' });
  }

  return { score: Math.max(0, score), issues };
}
