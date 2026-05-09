import { AiLayerConfig } from '../core/config.js';
import { AiLayerFile, RepoFacts } from '../core/types.js';
import { generateClaudeAdapter } from '../generate/adapters/claude.js';
import { generateCopilotAdapter } from '../generate/adapters/copilot.js';

export function syncAdapters(config: AiLayerConfig, facts: RepoFacts): AiLayerFile[] {
  const synced: AiLayerFile[] = [];
  if (config.agents?.claude?.enabled) {
    synced.push(generateClaudeAdapter(facts));
  }
  if (config.agents?.copilot?.enabled) {
    synced.push(generateCopilotAdapter(facts));
  }
  return synced;
}
