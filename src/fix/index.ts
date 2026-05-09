import { AiLayerFile, RepoFacts } from '../core/types.js';
import { slimAdapter } from './compress.js';
import { dedupeContent } from './dedupe.js';
import { insertCommands } from './command-insert.js';
import { splitScope } from './split-scope.js';

export function runDoctor(facts: RepoFacts, fileContents: Record<string, string>, fixes: string[]): AiLayerFile[] {
  let results: AiLayerFile[] = [];

  let filesToProcess: AiLayerFile[] = Object.keys(fileContents).map(path => ({
    path,
    content: fileContents[path],
    agentTarget: path.includes('copilot') ? 'copilot' : (path.includes('CLAUDE') ? 'claude' : 'shared')
  }));

  const canonicalShared = Object.keys(fileContents)
    .filter(k => k === 'AGENTS.md' || k.startsWith('ai/'))
    .map(k => fileContents[k])
    .join('\n\n');

  for (let file of filesToProcess) {
    let currentFiles = [file];

    if (fixes.includes('redundancy')) {
      if (file.agentTarget !== 'shared') {
        currentFiles[0] = dedupeContent(currentFiles[0], canonicalShared);
      }
    }

    if (fixes.includes('adapter-slimming')) {
      if (file.agentTarget === 'claude' || file.agentTarget === 'copilot') {
        currentFiles[0] = slimAdapter(currentFiles[0]);
      }
    }

    if (fixes.includes('command-insertion')) {
      if (file.agentTarget === 'claude' || file.agentTarget === 'copilot') {
        currentFiles[0] = insertCommands(currentFiles[0], facts.buildCommands, facts.testCommands);
      }
    }

    if (fixes.includes('scope-splitting')) {
      if (currentFiles[0].agentTarget === 'shared' && currentFiles[0].path === 'AGENTS.md') {
        currentFiles = splitScope(currentFiles[0]);
      }
    }

    results.push(...currentFiles);
  }

  return results.filter(f => f.content !== fileContents[f.path] && f.content !== undefined);
}
