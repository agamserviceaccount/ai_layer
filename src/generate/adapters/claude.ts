import { RepoFacts, AiLayerFile } from '../../core/types.js';

export function generateClaudeAdapter(facts: RepoFacts): AiLayerFile {
  return {
    path: 'CLAUDE.md',
    agentTarget: 'claude',
    content: `# Claude Code Repository Instructions

This is the adapter file for Claude Code.
Canonical guidance is located in [AGENTS.md](AGENTS.md).

## Operational Guide
- **First files to read:** \`ai/project-context.md\` and \`ai/standards.md\`
- **Build command:** \`${facts.buildCommands.join('` or `') || 'N/A'}\`
- **Test command:** \`${facts.testCommands.join('` or `') || 'N/A'}\`

## Guardrails
- Always plan multi-file changes before executing them.
- Ensure all test commands pass before claiming a task is done.
`
  };
}
