import { AiLayerFile } from '../../core/types.js';

export function generateAgentsRoot(): AiLayerFile {
  return {
    path: 'AGENTS.md',
    agentTarget: 'shared',
    content: `# AI Agents Root Guide

This repository uses a canonical AI layer.
Please refer to the files in the \`ai/\` directory for shared context:
- [Standards](ai/standards.md)
- [Project Context](ai/project-context.md)

Agent-specific behaviors are defined in their respective adapter files (e.g., \`CLAUDE.md\` and \`.github/copilot-instructions.md\`).
`
  };
}
