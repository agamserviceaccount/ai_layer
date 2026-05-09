import { RepoFacts } from '../core/types.js';
import { detectAiLayer } from './ai-layer-detector.js';
import { detectGitHubActions, detectPackageManagers, detectRepoType, detectStacks, detectTestFrameworks } from './stack-detector.js';
import { detectMcpServers } from './mcp-detector.js';
import { detectSubprojects } from './subproject-scanner.js';
import { detectContextQuality } from './context-quality-detector.js';

export async function scanRepo(dir: string): Promise<RepoFacts> {
  const [
    type,
    packageManagers,
    stacks,
    testFrameworks,
    hasGitHubActions,
    aiLayer,
    mcpFacts,
    subprojects,
    contextQuality
  ] = await Promise.all([
    detectRepoType(dir),
    detectPackageManagers(dir),
    detectStacks(dir),
    detectTestFrameworks(dir),
    detectGitHubActions(dir),
    detectAiLayer(dir),
    detectMcpServers(dir),
    detectSubprojects(dir),
    detectContextQuality(dir)
  ]);

  const buildCommands: string[] = [];
  const testCommands: string[] = [];

  for (const pm of packageManagers) {
    if (pm === 'npm' || pm === 'yarn' || pm === 'pnpm' || pm === 'bun') {
      buildCommands.push(`${pm} run build`);
      testCommands.push(`${pm} test`);
    }
  }

  if (stacks.includes('dotnet')) {
    buildCommands.push('dotnet build');
    testCommands.push('dotnet test');
  }

  return {
    type,
    packageManagers,
    stacks,
    testFrameworks,
    hasGitHubActions,
    buildCommands,
    testCommands,
    aiLayer,
    mcpFacts,
    subprojects,
    contextQuality
  };
}
