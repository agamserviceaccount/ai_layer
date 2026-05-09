import fs from 'node:fs/promises';
import path from 'node:path';
import { RepoFacts, AuditReport } from '../core/types.js';
import { generateWithAi } from './provider.js';
import { buildRepoContextBlock, promptForAuditAnalysis } from './prompts.js';

export interface AiAuditInsight {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: { priority: string; action: string; reason: string }[];
  tokenEfficiencyNotes: string;
}

async function safeReadFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export async function runAiAudit(dir: string, facts: RepoFacts, fileContents: Record<string, string>): Promise<AiAuditInsight | null> {
  const readmeContent = await safeReadFile(path.join(dir, 'README.md'));
  const packageJsonContent = await safeReadFile(path.join(dir, 'package.json'));

  const repoContext = buildRepoContextBlock(facts, readmeContent, packageJsonContent, '');
  const prompt = promptForAuditAnalysis(repoContext, fileContents);

  const result = await generateWithAi(prompt);
  if (!result) return null;

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as AiAuditInsight;
  } catch {
    return null;
  }
}
