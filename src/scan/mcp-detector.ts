import fs from 'node:fs/promises';
import path from 'node:path';
import { McpServerEntry, McpFacts } from '../core/types.js';

const MCP_CONFIG_PATHS = [
  '.cursor/mcp.json',
  '.vscode/mcp.json',
  'mcp.json',
  '.claude/settings.local.json',
];

async function parseMcpConfig(filePath: string, sourceLabel: string): Promise<McpServerEntry[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);

    // Standard format: { "mcpServers": { "name": { ... } } }
    const servers = parsed.mcpServers || parsed.mcp_servers || {};
    
    return Object.entries(servers).map(([name, config]: [string, any]) => ({
      name,
      command: config.command,
      args: config.args,
      url: config.url,
      env: config.env,
      sourceFile: sourceLabel,
    }));
  } catch {
    return [];
  }
}

export async function detectMcpServers(dir: string): Promise<McpFacts> {
  const allServers: McpServerEntry[] = [];
  const configFiles: string[] = [];

  for (const configPath of MCP_CONFIG_PATHS) {
    const fullPath = path.join(dir, configPath);
    const servers = await parseMcpConfig(fullPath, configPath);
    if (servers.length > 0) {
      allServers.push(...servers);
      configFiles.push(configPath);
    }
  }

  return { servers: allServers, configFiles };
}
