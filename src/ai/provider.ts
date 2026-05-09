import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

let client: GoogleGenAI | null = null;
let _generateFn: ((prompt: string) => Promise<string | null>) | null = null;
let _keyWarned = false;

export function getAiClient(): GoogleGenAI | null {
  if (client) return client;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Override the AI generation function for testing purposes.
 * Pass `null` to reset to default behavior.
 */
export function setGenerateFn(fn: ((prompt: string) => Promise<string | null>) | null): void {
  _generateFn = fn;
}

export async function generateWithAi(prompt: string): Promise<string | null> {
  // Allow test injection
  if (_generateFn) {
    return _generateFn(prompt);
  }

  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text ?? null;
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('API_KEY_INVALID')) {
      if (!_keyWarned) {
        console.warn('\n⚠️  Gemini API key is invalid. Check your .env file.\n');
        _keyWarned = true;
      }
    } else {
      console.warn(`\n⚠️  AI generation failed: ${msg.substring(0, 120)}\n`);
    }
    return null;
  }
}

export function isAiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Reset internal state (useful for tests).
 */
export function resetAiProvider(): void {
  client = null;
  _generateFn = null;
  _keyWarned = false;
}
