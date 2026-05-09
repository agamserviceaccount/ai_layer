import { AuditIssue, ContextQualityFacts } from '../core/types.js';

// Context quality scoring (max 10 points):
//   README present & rich (>200 words):   +2
//   Architecture/design doc:              +2
//   Contributing guide:                   +1
//   ADRs (decisions documented):          +2
//   Design docs / RFCs:                   +2
//   API docs:                             +1
//
// This dimension rewards repos that provide "living documentation" —
// the kind of context that makes AI agents dramatically more effective
// because they understand intent, not just syntax.

export function auditContextQuality(context: ContextQualityFacts): { score: number, issues: AuditIssue[] } {
  let score = 0;
  const issues: AuditIssue[] = [];

  // README (2 points)
  if (context.hasReadme) {
    if (context.readmeWordCount >= 200) {
      score += 2;
    } else {
      score += 1;
      issues.push({
        code: 'readme_thin',
        severity: 'low',
        message: `README.md is only ${context.readmeWordCount} words. A richer README (>200 words) helps AI agents understand project purpose.`
      });
    }
  } else {
    issues.push({
      code: 'readme_missing',
      severity: 'high',
      message: 'No README.md found. This is the first file AI agents read to understand your project.'
    });
  }

  // Architecture doc (2 points)
  if (context.hasArchitectureMd) {
    score += 2;
  } else {
    issues.push({
      code: 'architecture_missing',
      severity: 'medium',
      message: 'No architecture doc found (ARCHITECTURE.md or docs/architecture.md). AI agents perform significantly better when they understand system design and component relationships.'
    });
  }

  // Contributing guide (1 point)
  if (context.hasContributing) {
    score += 1;
  } else {
    issues.push({
      code: 'contributing_missing',
      severity: 'low',
      message: 'No CONTRIBUTING.md found. This helps AI agents follow your team\'s workflow conventions.'
    });
  }

  // ADRs (2 points)
  if (context.hasAdrs) {
    score += 2;
  } else {
    issues.push({
      code: 'adrs_missing',
      severity: 'low',
      message: 'No Architecture Decision Records (ADRs) found. ADRs document why decisions were made, helping AI agents avoid re-litigating past choices.'
    });
  }

  // Design docs / RFCs (2 points)
  if (context.hasDesignDocs) {
    score += 2;
  }

  // API docs (1 point)
  if (context.hasApiDocs) {
    score += 1;
  }

  return { score: Math.min(10, score), issues };
}
