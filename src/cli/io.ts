import fs from 'node:fs/promises';
import path from 'node:path';
import { AiLayerFile } from '../core/types.js';

export async function readAiLayerFiles(dir: string): Promise<Record<string, string>> {
  const contents: Record<string, string> = {};
  
  const safeRead = async (filePath: string) => {
    try {
      contents[filePath] = await fs.readFile(path.join(dir, filePath), 'utf-8');
    } catch (e) {
      // file doesn't exist, skip
    }
  };

  await safeRead('AGENTS.md');
  await safeRead('CLAUDE.md');
  await safeRead('.github/copilot-instructions.md');
  await safeRead('ai/standards.md');
  await safeRead('ai/project-context.md');
  
  const safeReadDir = async (subDir: string) => {
      try {
          const files = await fs.readdir(path.join(dir, subDir));
          for (let f of files) {
              if (f.endsWith('.md')) {
                  await safeRead(path.join(subDir, f));
              }
          }
      } catch (e) {}
  };
  await safeReadDir('ai');
  await safeReadDir('ai/skills');
  await safeReadDir('.github/instructions');

  return contents;
}

export async function writeAiLayerFiles(dir: string, files: AiLayerFile[], dryRun: boolean = false) {
  for (const file of files) {
    const fullPath = path.join(dir, file.path);
    if (!dryRun) {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file.content, 'utf-8');
    }
  }
}
