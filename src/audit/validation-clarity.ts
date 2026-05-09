import { AuditIssue } from '../core/types.js';

export function auditValidationClarity(fileContents: Record<string, string>): { score: number, issues: AuditIssue[] } {
  let score = 10;
  const issues: AuditIssue[] = [];

  const combined = Object.values(fileContents).join('\n').toLowerCase();
  
  if (!combined.includes('test') && !combined.includes('validate') && !combined.includes('check')) {
    score -= 5;
    issues.push({ code: 'missing_validation', severity: 'medium', message: 'No clear validation or testing guidance found in AI layer files.' });
  }

  return { score: Math.max(0, score), issues };
}
