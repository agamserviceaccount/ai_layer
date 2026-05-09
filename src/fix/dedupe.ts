import { AiLayerFile } from '../core/types.js';

export function dedupeContent(targetFile: AiLayerFile, canonicalContent: string): AiLayerFile {
  let newContent = targetFile.content;
  const canonicalParagraphs = canonicalContent.split('\n\n').filter(p => p.trim().length > 50);

  for (const para of canonicalParagraphs) {
    if (newContent.includes(para)) {
      newContent = newContent.replace(para, `<!-- Deduped canonical content -->`);
    }
  }

  return {
    ...targetFile,
    content: newContent
  };
}
