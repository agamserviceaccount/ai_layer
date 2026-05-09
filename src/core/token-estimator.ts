import { getEncoding } from 'js-tiktoken';

// We use cl100k_base (used by GPT-4) as a strong proxy for token counting across modern models.
let enc: ReturnType<typeof getEncoding>;

function getEnc() {
  if (!enc) {
    enc = getEncoding("cl100k_base");
  }
  return enc;
}

export function countTokens(text: string): number {
  if (!text) return 0;
  return getEnc().encode(text).length;
}
