import { AuditIssue } from '../core/types.js';

export function auditFreshness(fileContents: Record<string, string>): { score: number, issues: AuditIssue[] } {
  let score = 15;
  const issues: AuditIssue[] = [];

  const combined = Object.values(fileContents).join('\n').toLowerCase();
  if (combined.includes('npm install -g') || combined.includes('yarn global add')) {
    score -= 5;
    issues.push({ code: 'stale_global_install', severity: 'low', message: 'Found potentially stale global install commands.' });
  }

  return { score: Math.max(0, score), issues };
}
