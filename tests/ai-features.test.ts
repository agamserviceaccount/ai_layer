import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { setGenerateFn, resetAiProvider, generateAllFilesWithAi, runAiAudit } from '../src/ai/index.js';
import { scanRepo } from '../src/scan/repo-scanner.js';

const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
const testDir = path.join(fixturesDir, 'chalk-ai-test');

// Files that AI generation might create
const generatedPaths = [
  'AGENTS.md',
  'CLAUDE.md',
  '.github/copilot-instructions.md',
  'ai/standards.md',
  'ai/project-context.md',
  'ai/skills/typescript.md',
];

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanupTestDir() {
  // Remove AI-generated files from the test directory
  for (const rel of generatedPaths) {
    const full = path.join(testDir, rel);
    try { fs.unlinkSync(full); } catch { /* doesn't exist */ }
  }
  // Remove generated directories if empty
  for (const dir of ['ai/skills', 'ai', '.github']) {
    const full = path.join(testDir, dir);
    try { fs.rmdirSync(full); } catch { /* not empty or doesn't exist */ }
  }
}

function resetTestDir() {
  // Nuke and recreate
  try { fs.rmSync(testDir, { recursive: true, force: true }); } catch { /* doesn't exist */ }
  copyDirSync(path.join(fixturesDir, 'chalk'), testDir);
}

describe('AI-Powered Features', () => {
  beforeEach(() => {
    resetTestDir();
    resetAiProvider();
  });

  afterEach(() => {
    cleanupTestDir();
    resetAiProvider();
  });

  describe('AI Generate', () => {
    it('should generate all 5 AI layer files when AI returns content', async () => {
      // Mock the AI to return deterministic content
      let callCount = 0;
      setGenerateFn(async (prompt: string) => {
        callCount++;
        if (prompt.includes('AGENTS.md')) return '# AI Agents Root Guide\nTest content for AGENTS.md';
        if (prompt.includes('standards')) return '# Standards\nTest standards content';
        if (prompt.includes('project context')) return '# Project Context\nTest context content';
        if (prompt.includes('CLAUDE.md')) return '# Claude\nTest claude content';
        if (prompt.includes('copilot')) return '# Copilot\nTest copilot content';
        return 'Fallback content';
      });

      const facts = await scanRepo(testDir);
      const files = await generateAllFilesWithAi(testDir, facts);

      expect(files.length).toBe(5);
      expect(files.map(f => f.path)).toContain('AGENTS.md');
      expect(files.map(f => f.path)).toContain('CLAUDE.md');
      expect(files.map(f => f.path)).toContain('.github/copilot-instructions.md');
      expect(files.map(f => f.path)).toContain('ai/standards.md');
      expect(files.map(f => f.path)).toContain('ai/project-context.md');

      // Verify content is from AI, not templates
      const agentsFile = files.find(f => f.path === 'AGENTS.md');
      expect(agentsFile?.content).toContain('Test content for AGENTS.md');
      expect(callCount).toBe(5);
    });

    it('should return empty array when AI returns null for everything', async () => {
      setGenerateFn(async () => null);

      const facts = await scanRepo(testDir);
      const files = await generateAllFilesWithAi(testDir, facts);

      expect(files.length).toBe(0);
    });

    it('should return partial results when AI fails for some files', async () => {
      let callIndex = 0;
      // Promise.all order: agents, standards, projectContext, claude, copilot
      setGenerateFn(async () => {
        callIndex++;
        // Return content only for call 1 (agents) and call 4 (claude)
        if (callIndex === 1) return '# Agents\nPartial result';
        if (callIndex === 4) return '# Claude\nPartial result';
        return null;
      });

      const facts = await scanRepo(testDir);
      const files = await generateAllFilesWithAi(testDir, facts);

      expect(files.length).toBe(2);
      expect(files.map(f => f.path)).toContain('AGENTS.md');
      expect(files.map(f => f.path)).toContain('CLAUDE.md');
    });

    it('should not leave any files on disk (generate only returns in-memory)', async () => {
      setGenerateFn(async () => '# Generated content');

      const facts = await scanRepo(testDir);
      await generateAllFilesWithAi(testDir, facts);

      // generateAllFilesWithAi should NOT write to disk — only return AiLayerFile[]
      expect(fs.existsSync(path.join(testDir, 'AGENTS.md'))).toBe(false);
      expect(fs.existsSync(path.join(testDir, 'CLAUDE.md'))).toBe(false);
    });

    it('should pass repo context (README, package.json) to the AI', async () => {
      const capturedPrompts: string[] = [];
      setGenerateFn(async (prompt: string) => {
        capturedPrompts.push(prompt);
        return '# Content';
      });

      const facts = await scanRepo(testDir);
      await generateAllFilesWithAi(testDir, facts);

      // Every prompt should contain repo context from the scanned directory
      for (const prompt of capturedPrompts) {
        expect(prompt).toContain('package.json');
      }
    });
  });

  describe('AI Audit', () => {
    it('should return structured insights when AI responds with valid JSON', async () => {
      const mockAuditResponse = JSON.stringify({
        overallAssessment: 'The AI layer is well-structured.',
        strengths: ['Good coverage', 'Thin adapters'],
        weaknesses: ['Missing scoped instructions'],
        recommendations: [
          { priority: 'high', action: 'Add scoped testing rules', reason: 'Tests need specific guidance' }
        ],
        tokenEfficiencyNotes: 'Token usage is within budget.'
      });

      setGenerateFn(async () => mockAuditResponse);

      const facts = await scanRepo(testDir);
      const insight = await runAiAudit(testDir, facts, {});

      expect(insight).not.toBeNull();
      expect(insight!.overallAssessment).toBe('The AI layer is well-structured.');
      expect(insight!.strengths).toHaveLength(2);
      expect(insight!.weaknesses).toHaveLength(1);
      expect(insight!.recommendations).toHaveLength(1);
      expect(insight!.recommendations[0].priority).toBe('high');
    });

    it('should return null when AI returns invalid JSON', async () => {
      setGenerateFn(async () => 'This is not JSON at all, just plain text.');

      const facts = await scanRepo(testDir);
      const insight = await runAiAudit(testDir, facts, {});

      expect(insight).toBeNull();
    });

    it('should return null when AI is unavailable', async () => {
      setGenerateFn(async () => null);

      const facts = await scanRepo(testDir);
      const insight = await runAiAudit(testDir, facts, {});

      expect(insight).toBeNull();
    });
  });

  describe('Fixture Reset', () => {
    it('should start with a clean test directory (no AI layer files)', () => {
      for (const rel of generatedPaths) {
        expect(fs.existsSync(path.join(testDir, rel))).toBe(false);
      }
    });

    it('should have the original chalk files intact', () => {
      expect(fs.existsSync(path.join(testDir, 'package.json'))).toBe(true);
    });
  });
});
