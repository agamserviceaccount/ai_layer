import { RepoFacts, AiLayerFile } from '../../core/types.js';

export function generateCopilotAdapter(facts: RepoFacts): AiLayerFile {
  return {
    path: '.github/copilot-instructions.md',
    agentTarget: 'copilot',
    content: `# GitHub Copilot Repository Instructions

This file serves as the Copilot adapter.
Please load the canonical guidance from [AGENTS.md](../AGENTS.md).

## Copilot Specific Behavior
- Provide concise code completion.
- Reference \`ai/standards.md\` for coding rules.
- To test changes, use: ${facts.testCommands.length > 0 ? facts.testCommands[0] : 'your test command'}.
`
  };
}
