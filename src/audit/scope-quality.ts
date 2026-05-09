import { AiLayerFacts, AuditIssue } from '../core/types.js';

export function auditScopeQuality(facts: AiLayerFacts): { score: number, issues: AuditIssue[] } {
  let score = 15;
  const issues: AuditIssue[] = [];

  if (facts.existingScopes.length > 5) {
    score -= 5;
    issues.push({ code: 'too_many_scopes', severity: 'low', message: 'More than 5 scoped instruction files found, which might fragment context.' });
  }

  return { score: Math.max(0, score), issues };
}
