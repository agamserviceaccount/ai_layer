import { AiLayerFile } from '../core/types.js';

export function splitScope(file: AiLayerFile): AiLayerFile[] {
  const regex = /## (Testing|Infra|Backend) Rules\n([^#]+)/;
  const match = file.content.match(regex);
  
  if (match) {
    const scopeName = match[1].toLowerCase();
    const scopeContent = match[2].trim();
    
    const newRootContent = file.content.replace(match[0], `\n> See \`.github/instructions/${scopeName}.instructions.md\` for rules.\n`);
    
    return [
      { ...file, content: newRootContent },
      { path: `.github/instructions/${scopeName}.instructions.md`, content: `# ${match[1]} Rules\n\n${scopeContent}`, agentTarget: 'shared' }
    ];
  }

  return [file];
}
