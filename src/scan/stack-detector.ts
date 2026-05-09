import fs from 'node:fs/promises';
import path from 'node:path';
import { PackageManager, TechStack, TestFramework, RepoType } from '../core/types.js';

export async function detectPackageManagers(dir: string): Promise<PackageManager[]> {
  const managers: PackageManager[] = [];
  const files = await fs.readdir(dir);
  
  if (files.includes('package-lock.json')) managers.push('npm');
  if (files.includes('yarn.lock')) managers.push('yarn');
  if (files.includes('pnpm-lock.yaml')) managers.push('pnpm');
  if (files.includes('bun.lockb') || files.includes('bun.lock')) managers.push('bun');
  
  if (files.some(f => f.endsWith('.sln') || f.endsWith('.csproj'))) {
    managers.push('nuget');
  }
  
  return managers;
}

export async function detectStacks(dir: string): Promise<TechStack[]> {
  const stacks: TechStack[] = [];
  const files = await fs.readdir(dir);
  
  if (files.includes('tsconfig.json')) {
    stacks.push('typescript');
  } else if (files.includes('package.json')) {
    stacks.push('javascript');
  }
  
  if (files.some(f => f.endsWith('.sln') || f.endsWith('.csproj'))) {
    stacks.push('dotnet');
  }
  
  return stacks;
}

export async function detectTestFrameworks(dir: string): Promise<TestFramework[]> {
  const frameworks: TestFramework[] = [];
  const files = await fs.readdir(dir);
  
  if (files.some(f => f.includes('playwright.config'))) frameworks.push('playwright');
  if (files.some(f => f.includes('jest.config'))) frameworks.push('jest');
  if (files.some(f => f.includes('vitest.config'))) frameworks.push('vitest');
  
  return frameworks;
}

export async function detectGitHubActions(dir: string): Promise<boolean> {
  try {
    const workflowsDir = path.join(dir, '.github', 'workflows');
    const stat = await fs.stat(workflowsDir);
    if (stat.isDirectory()) {
      const files = await fs.readdir(workflowsDir);
      return files.some(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    }
  } catch (e) {
    return false;
  }
  return false;
}

export async function detectRepoType(dir: string): Promise<RepoType> {
  const files = await fs.readdir(dir);
  
  if (files.includes('pnpm-workspace.yaml') || files.includes('lerna.json')) {
    return 'monorepo';
  }
  
  if (files.includes('package.json')) {
    try {
      const pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf-8'));
      if (pkg.workspaces) {
        return 'monorepo';
      }
    } catch (e) {
      // ignore
    }
  }
  
  if (files.some(f => f.endsWith('.sln'))) {
    return 'monorepo'; 
  }
  
  if (files.includes('package.json') || files.some(f => f.endsWith('.csproj'))) {
    return 'single';
  }
  
  return 'unknown';
}
