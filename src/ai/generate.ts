import fs from 'node:fs/promises';
import path from 'node:path';
import { RepoFacts, AiLayerFile } from '../core/types.js';
import { generateWithAi } from './provider.js';
import {
  buildRepoContextBlock,
  promptForAgentsMd,
  promptForStandards,
  promptForProjectContext,
  promptForClaudeAdapter,
  promptForCopilotAdapter,
} from './prompts.js';

async function safeReadFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

async function getSourceTree(dir: string, prefix: string = '', depth: number = 3): Promise<string> {
  if (depth <= 0) return '';
  const lines: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', '.git', 'dist', 'tests', 'coverage'].includes(entry.name)) continue;
      if (entry.isDirectory()) {
        lines.push(`${prefix}${entry.name}/`);
        const sub = await getSourceTree(path.join(dir, entry.name), prefix + '  ', depth - 1);
        if (sub) lines.push(sub);
      } else {
        lines.push(`${prefix}${entry.name}`);
      }
    }
  } catch { /* ignore */ }
  return lines.join('\n');
}

export async function generateAllFilesWithAi(dir: string, facts: RepoFacts): Promise<AiLayerFile[]> {
  const readmeContent = await safeReadFile(path.join(dir, 'README.md'));
  const packageJsonContent = await safeReadFile(path.join(dir, 'package.json'));
  const sourceTree = await getSourceTree(dir);

  const repoContext = buildRepoContextBlock(facts, readmeContent, packageJsonContent, sourceTree);

  const [agentsContent, standardsContent, projectContextContent, claudeContent, copilotContent] =
    await Promise.all([
      generateWithAi(promptForAgentsMd(repoContext)),
      generateWithAi(promptForStandards(repoContext)),
      generateWithAi(promptForProjectContext(repoContext)),
      generateWithAi(promptForClaudeAdapter(repoContext)),
      generateWithAi(promptForCopilotAdapter(repoContext)),
    ]);

  const files: AiLayerFile[] = [];

  if (agentsContent) {
    files.push({ path: 'AGENTS.md', content: agentsContent, agentTarget: 'shared' });
  }
  if (standardsContent) {
    files.push({ path: 'ai/standards.md', content: standardsContent, agentTarget: 'shared' });
  }
  if (projectContextContent) {
    files.push({ path: 'ai/project-context.md', content: projectContextContent, agentTarget: 'shared' });
  }
  if (claudeContent) {
    files.push({ path: 'CLAUDE.md', content: claudeContent, agentTarget: 'claude' });
  }
  if (copilotContent) {
    files.push({ path: '.github/copilot-instructions.md', content: copilotContent, agentTarget: 'copilot' });
  }

  return files;
}
