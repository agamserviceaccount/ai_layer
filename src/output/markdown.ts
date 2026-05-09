import { AuditReport } from '../core/types.js';

export function generateMarkdownReport(report: AuditReport): string {
  return `# AI Layer Audit Report
**Score:** ${report.score}/100

## Subscores
| Category | Score | Max |
|----------|-------|-----|
| Coverage | ${report.subscores.coverage} | 15 |
| Specificity | ${report.subscores.specificity} | 20 |
| Freshness | ${report.subscores.freshness} | 15 |
| Scope Quality | ${report.subscores.scopeQuality} | 15 |
| Redundancy | ${report.subscores.redundancy} | 10 |
| Token Efficiency | ${report.subscores.tokenEfficiency} | 15 |
| Context Quality | ${report.subscores.contextQuality} | 10 |
| Agent Best Practices | ${report.subscores.agentBestPractices} | 10 |

## Budgets
- **Root Load:** ${report.budgets.rootLoadTokens} (Budget: ${report.budgets.rootBudget})
- **Scoped Load:** ${report.budgets.scopedLoadTokens}

## Issues
${report.issues.map(i => `- **[${i.severity.toUpperCase()}]** ${i.code}: ${i.message}`).join('\n')}
`;
}
