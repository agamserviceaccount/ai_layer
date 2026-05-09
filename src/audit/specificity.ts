import { RepoFacts, AuditIssue } from '../core/types.js';

export function auditSpecificity(facts: RepoFacts, fileContents: Record<string, string>): { score: number, issues: AuditIssue[] } {
  let score = 20;
  const issues: AuditIssue[] = [];

  const combinedContent = Object.values(fileContents).join('\n');

  for (const cmd of facts.testCommands) {
    if (combinedContent && !combinedContent.includes(cmd)) {
      score -= 5;
      issues.push({ code: 'missing_test_command', severity: 'medium', message: `Test command '${cmd}' is not mentioned in any AI layer files.` });
    }
  }

  return { score: Math.max(0, score), issues };
}
