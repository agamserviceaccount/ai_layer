import { RepoFacts, AiLayerFile } from '../../core/types.js';

export function generateStandards(facts: RepoFacts): AiLayerFile {
  return {
    path: 'ai/standards.md',
    agentTarget: 'shared',
    content: `# Repository Standards

## Coding Constraints
- Follow standard formatting and linting rules.
- Write explicit types where applicable.
- Avoid repeating logic.

## Validation Expectations
- Ensure tests pass before considering a task complete.
- Check for performance and token overhead.
`
  };
}

export function generateProjectContext(facts: RepoFacts): AiLayerFile {
  const buildCmds = facts.buildCommands.map(cmd => `- \`${cmd}\``).join('\n');
  const testCmds = facts.testCommands.map(cmd => `- \`${cmd}\``).join('\n');
  
  return {
    path: 'ai/project-context.md',
    agentTarget: 'shared',
    content: `# Project Context

## Overview
This is a ${facts.type === 'monorepo' ? 'monorepo' : 'single-project'} repository.

## Commands
### Build
${buildCmds || 'No specific build command detected.'}

### Test
${testCmds || 'No specific test command detected.'}

## Architecture
- Please refer to specific folder scopes for more detailed architectural guidelines.
`
  };
}

export function generateSkills(facts: RepoFacts): AiLayerFile[] {
  const files: AiLayerFile[] = [];
  
  if (facts.stacks.includes('dotnet')) {
    files.push({
      path: 'ai/skills/dotnet.md',
      agentTarget: 'shared',
      content: `# .NET Skills\n\n- Use C# standard conventions.\n- Use dependency injection.\n`
    });
  }
  
  if (facts.stacks.includes('typescript')) {
    files.push({
      path: 'ai/skills/typescript.md',
      agentTarget: 'shared',
      content: `# TypeScript Skills\n\n- Use strict mode.\n- Prefer interfaces over types for object shapes.\n`
    });
  }

  if (facts.testFrameworks.includes('playwright')) {
    files.push({
      path: 'ai/skills/playwright.md',
      agentTarget: 'shared',
      content: `# Playwright Skills\n\n- Write resilient UI tests.\n- Use page object models.\n`
    });
  }

  return files;
}
