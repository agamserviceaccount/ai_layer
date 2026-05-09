import fs from 'node:fs/promises';
import path from 'node:path';
import { SubprojectAiLayer } from '../core/types.js';
import { detectAiLayer } from './ai-layer-detector.js';

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'coverage',
  '.next', '.nuxt', '.output', 'vendor', 'bin', 'obj', '__pycache__',
  'tests', 'test', '.cache', '.turbo',
]);

// Indicators that a directory is its own subproject
const SUBPROJECT_INDICATORS = [
  'package.json', '*.csproj', '*.fsproj', 'Cargo.toml',
  'go.mod', 'pyproject.toml', 'setup.py', 'build.gradle',
];

async function hasSubprojectIndicator(dir: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      if (entry === 'package.json' || entry.endsWith('.csproj') ||
          entry.endsWith('.fsproj') || entry === 'Cargo.toml' ||
          entry === 'go.mod' || entry === 'pyproject.toml' ||
          entry === 'setup.py' || entry === 'build.gradle') {
        return true;
      }
    }
  } catch { /* skip */ }
  return false;
}

export async function detectSubprojects(rootDir: string, maxDepth: number = 3): Promise<SubprojectAiLayer[]> {
  const subprojects: SubprojectAiLayer[] = [];

  async function scan(dir: string, depth: number, relPath: string) {
    if (depth <= 0) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

        const fullPath = path.join(dir, entry.name);
        const subRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;

        if (await hasSubprojectIndicator(fullPath)) {
          const aiLayer = await detectAiLayer(fullPath);
          subprojects.push({ path: subRelPath, aiLayer });
        }

        // Keep scanning deeper
        await scan(fullPath, depth - 1, subRelPath);
      }
    } catch { /* skip */ }
  }

  await scan(rootDir, maxDepth, '');
  return subprojects;
}
