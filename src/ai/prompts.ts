import { RepoFacts } from '../core/types.js';

export function buildRepoContextBlock(facts: RepoFacts, readmeContent: string, packageJsonContent: string, sourceTree: string): string {
  return `
## Repository Analysis

**Type:** ${facts.type}
**Stacks:** ${facts.stacks.join(', ') || 'unknown'}
**Package Managers:** ${facts.packageManagers.join(', ') || 'none detected'}
**Test Frameworks:** ${facts.testFrameworks.join(', ') || 'none detected'}
**Build Commands:** ${facts.buildCommands.join(', ') || 'none detected'}
**Test Commands:** ${facts.testCommands.join(', ') || 'none detected'}
**GitHub Actions:** ${facts.hasGitHubActions ? 'Yes' : 'No'}

### Existing AI Layer
- AGENTS.md: ${facts.aiLayer.hasAgentsMd ? 'Exists' : 'Missing'}
- CLAUDE.md: ${facts.aiLayer.hasClaudeMd ? 'Exists' : 'Missing'}
- Copilot Instructions: ${facts.aiLayer.hasCopilotInstructions ? 'Exists' : 'Missing'}
- Shared Files: ${facts.aiLayer.existingSharedFiles.join(', ') || 'none'}
- Skills: ${facts.aiLayer.existingSkills.join(', ') || 'none'}

### README.md (excerpt)
${readmeContent.substring(0, 3000)}

### package.json (excerpt)
${packageJsonContent.substring(0, 2000)}

### Source Tree
${sourceTree.substring(0, 2000)}
`.trim();
}

export function promptForAgentsMd(repoContext: string): string {
  return `You are an expert at writing repository-level AI agent guidance files.

Given the following repository analysis, generate a high-quality AGENTS.md file.

This file is the canonical root guide that both GitHub Copilot and Claude Code will read first.
It must:
- Explain what the project does (1-2 sentences)
- Point to shared context files in ai/ directory
- List the adapter files for each agent
- Be concise (under 300 words)
- Use bullet points and markdown headers
- Never duplicate content that belongs in ai/standards.md or ai/project-context.md

${repoContext}

Respond ONLY with the raw markdown content for AGENTS.md. No code fences, no explanation.`;
}

export function promptForStandards(repoContext: string): string {
  return `You are an expert at writing coding standards documentation for AI coding agents.

Given the following repository analysis, generate a high-quality ai/standards.md file.

This file tells AI agents the coding rules, conventions, and validation expectations for this specific repository.
It must:
- Be specific to THIS project (reference actual tools, frameworks, patterns detected)
- Include exact linting/formatting commands if detectable
- Define naming conventions based on the stack
- Specify testing expectations
- Be actionable (every rule should be verifiable)
- Be concise (under 400 words)
- Use bullet points and checklists

${repoContext}

Respond ONLY with the raw markdown content for ai/standards.md. No code fences, no explanation.`;
}

export function promptForProjectContext(repoContext: string): string {
  return `You are an expert at writing project context documentation for AI coding agents.

Given the following repository analysis, generate a high-quality ai/project-context.md file.

This file gives AI agents the business/domain context, architecture overview, and operational commands.
It must:
- Explain the project purpose and domain
- List important directories and their roles
- Include exact build, test, and dev commands
- Describe the architecture at a high level
- Mention key dependencies and why they're used
- Be concise (under 500 words)

${repoContext}

Respond ONLY with the raw markdown content for ai/project-context.md. No code fences, no explanation.`;
}

export function promptForClaudeAdapter(repoContext: string): string {
  return `You are an expert at writing CLAUDE.md files for Claude Code.

Given the following repository analysis, generate a thin CLAUDE.md adapter file.

CLAUDE.md is read by Claude Code at the start of every session. It must be:
- SHORT (under 200 words) — Claude loads this into every request, so token efficiency matters
- Operational: list the first files to read, exact commands to build/test/lint
- Guardrails: state what Claude should NOT do (e.g., don't modify lock files, don't edit generated files)
- A pointer to shared context: reference AGENTS.md and ai/ files, don't duplicate their content
- Planning: require Claude to plan before multi-file changes

${repoContext}

Respond ONLY with the raw markdown content for CLAUDE.md. No code fences, no explanation.`;
}

export function promptForCopilotAdapter(repoContext: string): string {
  return `You are an expert at writing .github/copilot-instructions.md files for GitHub Copilot.

Given the following repository analysis, generate a thin Copilot adapter file.

This file is loaded by GitHub Copilot as repository custom instructions. It must be:
- SHORT (under 200 words) — loaded into every Copilot interaction
- Focused on code completion behavior: preferred patterns, naming conventions, imports
- Reference shared context in AGENTS.md and ai/ directory
- Include the test command so Copilot can verify suggestions
- Never duplicate detailed rules that belong in ai/standards.md

${repoContext}

Respond ONLY with the raw markdown content for .github/copilot-instructions.md. No code fences, no explanation.`;
}

export function promptForAuditAnalysis(repoContext: string, existingFiles: Record<string, string>): string {
  const fileList = Object.entries(existingFiles)
    .map(([path, content]) => `### ${path}\n${content.substring(0, 1500)}`)
    .join('\n\n');

  return `You are an expert at evaluating AI layer quality in code repositories.

Given the following repository analysis and existing AI layer files, provide a detailed quality assessment.

${repoContext}

## Existing AI Layer Files
${fileList}

Analyze the AI layer and respond with a JSON object (no code fences) containing:
{
  "overallAssessment": "A 2-3 sentence summary of the AI layer quality",
  "strengths": ["list of things done well"],
  "weaknesses": ["list of things that need improvement"],
  "recommendations": [
    { "priority": "high|medium|low", "action": "specific actionable fix", "reason": "why this matters" }
  ],
  "tokenEfficiencyNotes": "assessment of whether the context is bloated or lean"
}`;
}
