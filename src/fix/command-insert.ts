import { AiLayerFile } from '../core/types.js';

export function insertCommands(file: AiLayerFile, buildCmds: string[], testCmds: string[]): AiLayerFile {
  let newContent = file.content;
  
  const testCmdStr = testCmds.length > 0 ? testCmds[0] : null;
  const buildCmdStr = buildCmds.length > 0 ? buildCmds[0] : null;
  
  if (testCmdStr && !newContent.includes(testCmdStr)) {
    newContent += `\n\n## Commands\n- **Test:** \`${testCmdStr}\`\n`;
  }
  
  if (buildCmdStr && !newContent.includes(buildCmdStr)) {
    if (!newContent.includes('## Commands')) {
      newContent += `\n\n## Commands\n`;
    }
    newContent += `- **Build:** \`${buildCmdStr}\`\n`;
  }

  return {
    ...file,
    content: newContent
  };
}
