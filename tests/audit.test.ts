import { describe, it, expect } from 'vitest';
import { runAudit } from '../src/audit/index.js';
import { scanRepo } from '../src/scan/repo-scanner.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');

async function getFileContents(dir: string): Promise<Record<string, string>> {
  const contents: Record<string, string> = {};
  
  const safeRead = async (filePath: string, key: string) => {
    try {
      contents[key] = await fs.readFile(path.join(dir, filePath), 'utf-8');
    } catch (e) {
      // file doesn't exist, skip
    }
  };

  await safeRead('AGENTS.md', 'AGENTS.md');
  await safeRead('CLAUDE.md', 'CLAUDE.md');
  await safeRead('.github/copilot-instructions.md', '.github/copilot-instructions.md');
  await safeRead('ai/standards.md', 'ai/standards.md');
  
  return contents;
}

describe('Audit Engine', () => {
  it('should flag token budget violations on bloated repo', async () => {
    const bloatedDir = path.join(fixturesDir, 'chalk-bloated');
    const facts = await scanRepo(bloatedDir);
    const contents = await getFileContents(bloatedDir);
    
    // Use default budget of 3000 (data-driven from real repos)
    const report = runAudit(facts, contents, 3000);
    
    expect(report.budgets.rootLoadTokens).toBeGreaterThan(3000);
    
    // Should flag as either exceeded or bloated depending on size
    const hasTokenIssue = report.issues.some(i => 
      i.code === 'token_budget_exceeded' || i.code === 'token_budget_bloated'
    );
    expect(hasTokenIssue).toBe(true);
  });
});
