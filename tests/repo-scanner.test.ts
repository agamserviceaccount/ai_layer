import { describe, it, expect } from 'vitest';
import { scanRepo } from '../src/scan/repo-scanner.js';
import * as path from 'path';

const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');

describe('Repo Scanner', () => {
  it('should detect greenfield repo (chalk)', async () => {
    const facts = await scanRepo(path.join(fixturesDir, 'chalk'));
    expect(facts.stacks).toContain('javascript');
    expect(facts.type).toBe('single');
    // Chalk doesn't have an AI layer
    expect(facts.aiLayer.hasClaudeMd).toBe(false);
    expect(facts.aiLayer.hasCopilotInstructions).toBe(false);
  });

  it('should detect repo with only Claude', async () => {
    const facts = await scanRepo(path.join(fixturesDir, 'chalk-with-claude'));
    expect(facts.aiLayer.hasClaudeMd).toBe(true);
    expect(facts.aiLayer.hasCopilotInstructions).toBe(false);
  });

  it('should detect repo with only Copilot', async () => {
    const facts = await scanRepo(path.join(fixturesDir, 'chalk-with-copilot'));
    expect(facts.aiLayer.hasClaudeMd).toBe(false);
    expect(facts.aiLayer.hasCopilotInstructions).toBe(true);
  });
});
