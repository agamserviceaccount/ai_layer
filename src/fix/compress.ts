import { AiLayerFile } from '../core/types.js';

export function slimAdapter(adapter: AiLayerFile): AiLayerFile {
  if (adapter.content.length < 300) {
    return adapter;
  }

  const slimmedContent = `# AI Agent Instructions\n\nThis is a slimmed adapter.\nPlease load the canonical guidance from [AGENTS.md](AGENTS.md) or \`ai/standards.md\`.\n\n## Guardrails\n- Always plan before executing.\n- Run tests before completing tasks.\n`;

  return {
    ...adapter,
    content: slimmedContent
  };
}
