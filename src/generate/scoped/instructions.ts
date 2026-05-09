import { AiLayerFile } from '../../core/types.js';

export function generateScopedInstructions(): AiLayerFile[] {
  return [
    {
      path: '.github/instructions/testing.instructions.md',
      agentTarget: 'copilot',
      content: `# Testing Instructions\n\n- Apply these rules when working in test directories.\n`
    }
  ];
}
