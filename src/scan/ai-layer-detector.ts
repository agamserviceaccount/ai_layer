import fs from 'node:fs/promises';
import path from 'node:path';
import { AiLayerFacts } from '../core/types.js';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listMdFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(f => f.endsWith('.md'));
  } catch {
    return [];
  }
}

export async function detectAiLayer(dir: string): Promise<AiLayerFacts> {
  const hasAgentsMd = await fileExists(path.join(dir, 'AGENTS.md'));
  const hasClaudeMd = await fileExists(path.join(dir, 'CLAUDE.md'));
  const hasCopilotInstructions = await fileExists(path.join(dir, '.github', 'copilot-instructions.md'));
  const hasAiLayerYaml = await fileExists(path.join(dir, 'ai-layer.yaml'));
  
  const existingScopes = await listMdFiles(path.join(dir, '.github', 'instructions'));
  const existingPrompts = await listMdFiles(path.join(dir, '.github', 'prompts'));
  
  const aiDirFiles = await listMdFiles(path.join(dir, 'ai'));
  const existingSharedFiles = aiDirFiles.map(f => `ai/${f}`);
  
  const skillsDirFiles = await listMdFiles(path.join(dir, 'ai', 'skills'));
  const existingSkills = skillsDirFiles.map(f => `ai/skills/${f}`);
  
  return {
    hasAgentsMd,
    hasClaudeMd,
    hasCopilotInstructions,
    hasAiLayerYaml,
    existingScopes,
    existingPrompts,
    existingSharedFiles,
    existingSkills
  };
}
