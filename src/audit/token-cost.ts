import { countTokens } from '../core/token-estimator.js';
import { AuditIssue, TokenBudgetReport } from '../core/types.js';

// Data-driven budget tiers based on analysis of popular open-source repos:
//   React (63), Anthropic Cookbook (930), VS Code (2274),
//   TypeScript (2925), OpenAI Codex (4164), Next.js (5179)
//
// Tiers:
//   Lean:       < 1,000 tokens  (React-level, minimal)
//   Healthy:    < 3,000 tokens  (median of popular repos)
//   Heavy:      < 5,000 tokens  (P75-Max range, large monorepos)
//   Bloated:    > 5,000 tokens  (exceeds all sampled repos)

export function auditTokenCost(fileContents: Record<string, string>, rootBudget: number = 3000): { score: number, issues: AuditIssue[], budgets: TokenBudgetReport } {
  let score = 15;
  const issues: AuditIssue[] = [];

  const rootKeys = Object.keys(fileContents).filter(k => 
    k === 'AGENTS.md' || k === 'CLAUDE.md' || k === '.github/copilot-instructions.md' || 
    k.startsWith('ai/') || k.startsWith('ai/skills/')
  );

  const rootContent = rootKeys.map(k => fileContents[k]).join('\n');
  const rootLoadTokens = countTokens(rootContent);

  const scopedKeys = Object.keys(fileContents).filter(k => k.startsWith('.github/instructions/'));
  let maxScopedTokens = 0;
  
  for (const k of scopedKeys) {
    const tokens = countTokens(fileContents[k] || '');
    if (tokens > maxScopedTokens) {
      maxScopedTokens = tokens;
    }
  }

  const scopedLoadTokens = rootLoadTokens + maxScopedTokens;

  const budgets: TokenBudgetReport = {
    rootLoadTokens,
    rootBudget,
    scopedLoadTokens,
    duplicationWastePercent: 0
  };

  // Tiered scoring based on real-world data
  if (rootLoadTokens > 5000) {
    // Bloated: exceeds all sampled repos
    score -= 12;
    issues.push({ code: 'token_budget_bloated', severity: 'critical', message: `Root context (${rootLoadTokens} tokens) exceeds all popular repo benchmarks (max: 5,179). Aggressive trimming needed.` });
  } else if (rootLoadTokens > rootBudget) {
    // Heavy: above the configured budget
    score -= 7;
    issues.push({ code: 'token_budget_exceeded', severity: 'medium', message: `Root context (${rootLoadTokens} tokens) exceeds budget of ${rootBudget}. Consider splitting into scoped files.` });
  } else if (rootLoadTokens > 1000) {
    // Healthy: within budget, normal range
    // No penalty
  } else {
    // Lean: very small, could be too sparse
    if (rootLoadTokens < 100 && rootKeys.length > 0) {
      score -= 3;
      issues.push({ code: 'token_budget_sparse', severity: 'low', message: `Root context is only ${rootLoadTokens} tokens. Consider adding more actionable guidance.` });
    }
  }

  return { score: Math.max(0, score), issues, budgets };
}
