import { AuditIssue } from '../core/types.js';

export function auditRedundancy(fileContents: Record<string, string>): { score: number, issues: AuditIssue[] } {
  let score = 10;
  const issues: AuditIssue[] = [];

  const claudeMd = fileContents['CLAUDE.md'] || '';
  const copilotMd = fileContents['.github/copilot-instructions.md'] || '';
  
  const sharedKeys = Object.keys(fileContents).filter(k => k === 'AGENTS.md' || k.startsWith('ai/'));
  const sharedContent = sharedKeys.map(k => fileContents[k]).join('\n');

  if (sharedContent.length > 100) {
    if (claudeMd && claudeMd.includes(sharedContent.substring(0, 50))) {
      score -= 5;
      issues.push({ code: 'redundant_content', severity: 'medium', message: 'CLAUDE.md duplicates canonical shared content.', file: 'CLAUDE.md' });
    }
    if (copilotMd && copilotMd.includes(sharedContent.substring(0, 50))) {
      score -= 5;
      issues.push({ code: 'redundant_content', severity: 'medium', message: 'copilot-instructions.md duplicates canonical shared content.', file: '.github/copilot-instructions.md' });
    }
  }

  return { score: Math.max(0, score), issues };
}
