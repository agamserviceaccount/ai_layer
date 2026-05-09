import { getEncoding } from 'js-tiktoken';
import { readFileSync } from 'fs';

const enc = getEncoding('cl100k_base');

const files = [
  { label: 'Next.js AGENTS.md', path: '/Users/nandy/.gemini/antigravity/brain/7c521900-16c1-44fe-a106-dab4a1a09110/.system_generated/steps/411/content.md' },
  { label: 'TypeScript copilot-instructions.md', path: '/Users/nandy/.gemini/antigravity/brain/7c521900-16c1-44fe-a106-dab4a1a09110/.system_generated/steps/412/content.md' },
  { label: 'React CLAUDE.md', path: '/Users/nandy/.gemini/antigravity/brain/7c521900-16c1-44fe-a106-dab4a1a09110/.system_generated/steps/416/content.md' },
  { label: 'OpenAI Codex AGENTS.md', path: '/Users/nandy/.gemini/antigravity/brain/7c521900-16c1-44fe-a106-dab4a1a09110/.system_generated/steps/417/content.md' },
  { label: 'Anthropic Cookbook CLAUDE.md', path: '/Users/nandy/.gemini/antigravity/brain/7c521900-16c1-44fe-a106-dab4a1a09110/.system_generated/steps/418/content.md' },
  { label: 'VS Code copilot-instructions.md', path: '/Users/nandy/.gemini/antigravity/brain/7c521900-16c1-44fe-a106-dab4a1a09110/.system_generated/steps/419/content.md' },
];

console.log('| Repository | File | Bytes | Tokens |');
console.log('|------------|------|-------|--------|');

const tokenCounts = [];
for (const f of files) {
  const content = readFileSync(f.path, 'utf-8');
  const tokens = enc.encode(content).length;
  tokenCounts.push(tokens);
  console.log(`| ${f.label} | ${content.length} bytes | ${tokens} tokens |`);
}

const sorted = [...tokenCounts].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const avg = Math.round(tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length);
const p75 = sorted[Math.floor(sorted.length * 0.75)];
const max = sorted[sorted.length - 1];

console.log('');
console.log(`Median: ${median} tokens`);
console.log(`Average: ${avg} tokens`);
console.log(`P75: ${p75} tokens`);
console.log(`Max: ${max} tokens`);
