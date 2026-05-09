import { AuditReport, RepoFacts } from '../core/types.js';
import { auditCoverage } from './coverage.js';
import { auditFreshness } from './freshness.js';
import { auditRedundancy } from './redundancy.js';
import { auditScopeQuality } from './scope-quality.js';
import { auditSpecificity } from './specificity.js';
import { auditTokenCost } from './token-cost.js';
import { auditValidationClarity } from './validation-clarity.js';
import { auditContextQuality } from './context-quality.js';
import { auditAgentBestPractices } from './agent-best-practices.js';

// Scoring breakdown (total may exceed 100, capped):
//   Coverage:             15  (AI layer files present)
//   Specificity:          20  (commands documented)
//   Freshness:            15  (no stale patterns)
//   Scope Quality:        15  (clean scope structure)
//   Redundancy:           10  (no duplication)
//   Token Efficiency:     15  (within budget)
//   Context Quality:      10  (living docs: architecture, ADRs, README)
//   Agent Best Practices: 10  (adherence to official Claude/Copilot guides)
//   Validation:           10  (test/validation instructions)
//   ─────────────────────────
//   Total max:           120 → capped at 100

export function runAudit(facts: RepoFacts, fileContents: Record<string, string>, rootTokenBudget: number = 3000): AuditReport {
  const coverageResult = auditCoverage(facts.aiLayer);
  const specificityResult = auditSpecificity(facts, fileContents);
  const freshnessResult = auditFreshness(fileContents);
  const redundancyResult = auditRedundancy(fileContents);
  const scopeQualityResult = auditScopeQuality(facts.aiLayer);
  const validationResult = auditValidationClarity(fileContents);
  const tokenCostResult = auditTokenCost(fileContents, rootTokenBudget);
  const contextQualityResult = auditContextQuality(facts.contextQuality);
  const agentBpResult = auditAgentBestPractices(fileContents, facts.aiLayer);

  // Check subproject coverage
  const subprojectIssues = facts.subprojects
    .filter(sp => !sp.aiLayer.hasClaudeMd && !sp.aiLayer.hasCopilotInstructions && !sp.aiLayer.hasAgentsMd)
    .map(sp => ({
      code: 'subproject_no_context' as const,
      severity: 'low' as const,
      message: `Subproject "${sp.path}" has no AI layer files. Consider adding scoped instructions.`
    }));

  const rawScore = 
    coverageResult.score + 
    specificityResult.score + 
    freshnessResult.score + 
    scopeQualityResult.score + 
    redundancyResult.score + 
    tokenCostResult.score + 
    validationResult.score +
    contextQualityResult.score +
    agentBpResult.score;

  const issues = [
    ...coverageResult.issues,
    ...specificityResult.issues,
    ...freshnessResult.issues,
    ...scopeQualityResult.issues,
    ...redundancyResult.issues,
    ...tokenCostResult.issues,
    ...validationResult.issues,
    ...contextQualityResult.issues,
    ...agentBpResult.issues,
    ...subprojectIssues
  ];

  return {
    score: Math.min(100, rawScore),
    subscores: {
      coverage: coverageResult.score,
      specificity: specificityResult.score,
      freshness: freshnessResult.score,
      scopeQuality: scopeQualityResult.score,
      redundancy: redundancyResult.score,
      tokenEfficiency: tokenCostResult.score,
      contextQuality: contextQualityResult.score,
      agentBestPractices: agentBpResult.score
    },
    budgets: tokenCostResult.budgets,
    issues
  };
}
