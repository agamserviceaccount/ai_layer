import { AiLayerConfig } from '../core/config.js';
import { RepoFacts, AiLayerFile } from '../core/types.js';
import { generateAgentsRoot } from './canonical/agents.js';
import { generateProjectContext, generateSkills, generateStandards } from './canonical/shared-context.js';
import { generateCopilotAdapter } from './adapters/copilot.js';
import { generateClaudeAdapter } from './adapters/claude.js';
import { generateScopedInstructions } from './scoped/instructions.js';

export function generateAllFiles(facts: RepoFacts, config?: AiLayerConfig): AiLayerFile[] {
  const files: AiLayerFile[] = [];

  // Canonical Shared Context
  files.push(generateAgentsRoot());
  files.push(generateStandards(facts));
  files.push(generateProjectContext(facts));
  files.push(...generateSkills(facts));

  // Adapters
  files.push(generateCopilotAdapter(facts));
  files.push(generateClaudeAdapter(facts));

  // Scoped Instructions (Optional)
  if (facts.type === 'monorepo') {
    files.push(...generateScopedInstructions());
  }

  return files;
}
