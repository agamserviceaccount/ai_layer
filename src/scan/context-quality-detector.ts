import fs from 'node:fs/promises';
import path from 'node:path';
import { ContextQualityFacts } from '../core/types.js';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function dirHasFiles(dirPath: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dirPath);
    return entries.length > 0;
  } catch {
    return false;
  }
}

async function countWords(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split(/\s+/).filter(w => w.length > 0).length;
  } catch {
    return 0;
  }
}

// Architecture and design doc patterns
const ARCHITECTURE_PATTERNS = [
  'ARCHITECTURE.md', 'architecture.md',
  'DESIGN.md', 'design.md',
  'docs/architecture.md', 'docs/ARCHITECTURE.md',
  'docs/design.md', 'docs/DESIGN.md',
];

const CONTRIBUTING_PATTERNS = [
  'CONTRIBUTING.md', 'contributing.md',
  '.github/CONTRIBUTING.md',
];

const CHANGELOG_PATTERNS = [
  'CHANGELOG.md', 'changelog.md', 'HISTORY.md',
  'CHANGES.md', 'RELEASE_NOTES.md',
];

const ADR_PATTERNS = [
  'docs/adr', 'docs/adrs', 'docs/decisions',
  'adr', 'decisions',
];

const DESIGN_DOC_PATTERNS = [
  'docs/design', 'docs/rfcs', 'docs/proposals',
  'rfcs', 'design-docs',
];

const API_DOC_PATTERNS = [
  'docs/api', 'docs/openapi', 'openapi.yaml', 'openapi.json',
  'swagger.yaml', 'swagger.json', 'docs/api.md',
];

export async function detectContextQuality(dir: string): Promise<ContextQualityFacts> {
  const detectedDocs: string[] = [];

  // README
  const hasReadme = await fileExists(path.join(dir, 'README.md')) || await fileExists(path.join(dir, 'readme.md'));
  if (hasReadme) detectedDocs.push('README.md');
  const readmeWordCount = await countWords(path.join(dir, 'README.md'));

  // Architecture docs
  let hasArchitectureMd = false;
  for (const p of ARCHITECTURE_PATTERNS) {
    if (await fileExists(path.join(dir, p))) {
      hasArchitectureMd = true;
      detectedDocs.push(p);
      break;
    }
  }

  // Contributing guide
  let hasContributing = false;
  for (const p of CONTRIBUTING_PATTERNS) {
    if (await fileExists(path.join(dir, p))) {
      hasContributing = true;
      detectedDocs.push(p);
      break;
    }
  }

  // Changelog
  let hasChangelog = false;
  for (const p of CHANGELOG_PATTERNS) {
    if (await fileExists(path.join(dir, p))) {
      hasChangelog = true;
      detectedDocs.push(p);
      break;
    }
  }

  // ADRs (Architecture Decision Records)
  let hasAdrs = false;
  for (const p of ADR_PATTERNS) {
    if (await dirHasFiles(path.join(dir, p))) {
      hasAdrs = true;
      detectedDocs.push(p);
      break;
    }
  }

  // Design docs / RFCs
  let hasDesignDocs = false;
  for (const p of DESIGN_DOC_PATTERNS) {
    if (await dirHasFiles(path.join(dir, p))) {
      hasDesignDocs = true;
      detectedDocs.push(p);
      break;
    }
  }

  // API docs
  let hasApiDocs = false;
  for (const p of API_DOC_PATTERNS) {
    const fullPath = path.join(dir, p);
    if (await fileExists(fullPath) || await dirHasFiles(fullPath)) {
      hasApiDocs = true;
      detectedDocs.push(p);
      break;
    }
  }

  return {
    hasReadme,
    hasArchitectureMd,
    hasContributing,
    hasAdrs,
    hasChangelog,
    hasDesignDocs,
    hasApiDocs,
    readmeWordCount,
    detectedDocs,
  };
}
