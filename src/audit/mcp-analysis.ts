import { McpServerEntry, McpReplacementSuggestion, McpReplacementType } from '../core/types.js';

// Well-known MCP servers that can be replaced by skills/scripts
const REPLACEABLE_SERVERS: Record<string, { type: McpReplacementType; reason: string }> = {
  'filesystem': {
    type: 'skill',
    reason: 'AI agents (Copilot/Claude) already have native file access. A skill file documenting project structure replaces this.'
  },
  'server-filesystem': {
    type: 'skill',
    reason: 'AI agents (Copilot/Claude) already have native file access. A skill file documenting project structure replaces this.'
  },
  'memory': {
    type: 'skill',
    reason: 'A structured AGENTS.md or ai/project-context.md provides persistent context without a running server.'
  },
  'server-memory': {
    type: 'skill',
    reason: 'A structured AGENTS.md or ai/project-context.md provides persistent context without a running server.'
  },
  'fetch': {
    type: 'script',
    reason: 'A simple curl/fetch wrapper script achieves the same result without an always-running MCP server.'
  },
  'server-fetch': {
    type: 'script',
    reason: 'A simple curl/fetch wrapper script achieves the same result without an always-running MCP server.'
  },
  'postgres': {
    type: 'script',
    reason: 'A database query script (e.g., psql wrapper) is lighter than running a persistent MCP server for DB access.'
  },
  'sqlite': {
    type: 'script',
    reason: 'A sqlite3 CLI wrapper script is lighter than running a persistent MCP server.'
  },
  'github': {
    type: 'script',
    reason: 'The gh CLI provides the same functionality. A script wrapping `gh` commands is simpler and more maintainable.'
  },
  'server-github': {
    type: 'script',
    reason: 'The gh CLI provides the same functionality. A script wrapping `gh` commands is simpler and more maintainable.'
  },
  'git': {
    type: 'skill',
    reason: 'AI agents already execute git commands natively. A skill file with git workflow conventions replaces this.'
  },
  'sequential-thinking': {
    type: 'skill',
    reason: 'A structured prompt or skill file with step-by-step thinking patterns achieves the same without server overhead.'
  },
  'brave-search': {
    type: 'script',
    reason: 'A simple script calling the Brave Search API directly is lighter than an MCP server wrapper.'
  },
  'slack': {
    type: 'hook',
    reason: 'A Claude hook or a simple webhook script can post to Slack without needing a persistent MCP server.'
  },
  'puppeteer': {
    type: 'script',
    reason: 'A Playwright/Puppeteer script in the repo gives more control and is version-locked to the project.'
  },
  'server-puppeteer': {
    type: 'script',
    reason: 'A Playwright/Puppeteer script in the repo gives more control and is version-locked to the project.'
  },
};

// Patterns in args that suggest the server is doing something complex (harder to replace)
const COMPLEX_INDICATORS = ['--transport', 'sse', 'wss', 'websocket', 'grpc'];

function classifyServer(server: McpServerEntry): { type: McpReplacementType; reason: string } {
  // Check by exact name
  const nameKey = server.name.toLowerCase();
  if (REPLACEABLE_SERVERS[nameKey]) {
    return REPLACEABLE_SERVERS[nameKey];
  }

  // Check by package name in args (e.g., npx -y @modelcontextprotocol/server-filesystem)
  const argsStr = (server.args || []).join(' ').toLowerCase();
  for (const [key, value] of Object.entries(REPLACEABLE_SERVERS)) {
    if (argsStr.includes(key)) {
      return value;
    }
  }

  // Check if it's a remote/complex server (harder to replace)
  if (server.url) {
    return { type: 'none', reason: 'Remote MCP servers with custom APIs are not easily replaceable by skills/scripts.' };
  }

  if (COMPLEX_INDICATORS.some(ind => argsStr.includes(ind))) {
    return { type: 'none', reason: 'This server uses advanced transport mechanisms that require a running process.' };
  }

  // Default: suggest investigation
  return { type: 'skill', reason: `Unknown MCP server "${server.name}". Review if a skill file or script can replace its functionality.` };
}

function generateSkillContent(server: McpServerEntry): string {
  return `# Skill: ${server.name}

This skill replaces the \`${server.name}\` MCP server.

## What it did
The MCP server "${server.name}" was previously configured in \`${server.sourceFile}\`.
${server.command ? `It ran: \`${server.command} ${(server.args || []).join(' ')}\`` : ''}

## How to achieve the same result
<!-- Document the equivalent workflow, commands, or conventions here -->

## When to use
<!-- Describe the scenarios where this skill applies -->
`;
}

function generateScriptContent(server: McpServerEntry): string {
  return `#!/bin/bash
# Script replacement for MCP server: ${server.name}
# Previously configured in: ${server.sourceFile}
#
# Usage: ./scripts/${server.name}.sh [args]

set -euo pipefail

# TODO: Implement the equivalent functionality
# Original command: ${server.command || 'N/A'} ${(server.args || []).join(' ')}

echo "Running ${server.name} replacement script..."
`;
}

export function analyzeMcpServers(servers: McpServerEntry[]): McpReplacementSuggestion[] {
  return servers.map(server => {
    const { type, reason } = classifyServer(server);
    const canReplace = type !== 'none';

    return {
      server,
      canReplace,
      replacementType: type,
      reason,
      skillContent: type === 'skill' ? generateSkillContent(server) : undefined,
      scriptContent: type === 'script' ? generateScriptContent(server) : undefined,
    };
  });
}
