import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { scanRepo } from '../src/scan/repo-scanner.js';
import { analyzeMcpServers } from '../src/audit/mcp-analysis.js';
import { McpServerEntry } from '../src/core/types.js';

const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
const testDir = path.join(fixturesDir, 'mcp-test-repo');

function resetTestDir() {
  try { fs.rmSync(testDir, { recursive: true, force: true }); } catch {}
  fs.mkdirSync(testDir, { recursive: true });
  // Minimal package.json so scanner recognizes it as a repo
  fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({ name: 'mcp-test', version: '1.0.0' }));
}

function cleanupTestDir() {
  try { fs.rmSync(testDir, { recursive: true, force: true }); } catch {}
}

describe('MCP Detection & Analysis', () => {
  beforeEach(() => {
    resetTestDir();
  });

  afterEach(() => {
    cleanupTestDir();
  });

  describe('MCP Detection', () => {
    it('should detect MCP servers from .cursor/mcp.json', async () => {
      const cursorDir = path.join(testDir, '.cursor');
      fs.mkdirSync(cursorDir, { recursive: true });
      fs.writeFileSync(path.join(cursorDir, 'mcp.json'), JSON.stringify({
        mcpServers: {
          filesystem: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/user/project']
          },
          github: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: { GITHUB_TOKEN: 'xxx' }
          }
        }
      }));

      const facts = await scanRepo(testDir);

      expect(facts.mcpFacts.servers.length).toBe(2);
      expect(facts.mcpFacts.configFiles).toContain('.cursor/mcp.json');
      expect(facts.mcpFacts.servers[0].name).toBe('filesystem');
      expect(facts.mcpFacts.servers[1].name).toBe('github');
    });

    it('should detect MCP servers from .vscode/mcp.json', async () => {
      const vscodeDir = path.join(testDir, '.vscode');
      fs.mkdirSync(vscodeDir, { recursive: true });
      fs.writeFileSync(path.join(vscodeDir, 'mcp.json'), JSON.stringify({
        mcpServers: {
          postgres: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost/mydb']
          }
        }
      }));

      const facts = await scanRepo(testDir);

      expect(facts.mcpFacts.servers.length).toBe(1);
      expect(facts.mcpFacts.servers[0].name).toBe('postgres');
    });

    it('should return empty when no MCP configs exist', async () => {
      const facts = await scanRepo(testDir);
      expect(facts.mcpFacts.servers.length).toBe(0);
      expect(facts.mcpFacts.configFiles.length).toBe(0);
    });

    it('should merge servers from multiple config files', async () => {
      const cursorDir = path.join(testDir, '.cursor');
      const vscodeDir = path.join(testDir, '.vscode');
      fs.mkdirSync(cursorDir, { recursive: true });
      fs.mkdirSync(vscodeDir, { recursive: true });

      fs.writeFileSync(path.join(cursorDir, 'mcp.json'), JSON.stringify({
        mcpServers: { filesystem: { command: 'npx', args: ['server-filesystem'] } }
      }));
      fs.writeFileSync(path.join(vscodeDir, 'mcp.json'), JSON.stringify({
        mcpServers: { github: { command: 'npx', args: ['server-github'] } }
      }));

      const facts = await scanRepo(testDir);

      expect(facts.mcpFacts.servers.length).toBe(2);
      expect(facts.mcpFacts.configFiles.length).toBe(2);
    });
  });

  describe('MCP Analysis', () => {
    it('should recommend replacing filesystem server with a skill', () => {
      const servers: McpServerEntry[] = [{
        name: 'filesystem',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/project'],
        sourceFile: '.cursor/mcp.json'
      }];

      const suggestions = analyzeMcpServers(servers);

      expect(suggestions.length).toBe(1);
      expect(suggestions[0].canReplace).toBe(true);
      expect(suggestions[0].replacementType).toBe('skill');
      expect(suggestions[0].skillContent).toBeDefined();
      expect(suggestions[0].reason).toContain('native file access');
    });

    it('should recommend replacing github server with a script', () => {
      const servers: McpServerEntry[] = [{
        name: 'github',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        sourceFile: '.cursor/mcp.json'
      }];

      const suggestions = analyzeMcpServers(servers);

      expect(suggestions[0].canReplace).toBe(true);
      expect(suggestions[0].replacementType).toBe('script');
      expect(suggestions[0].scriptContent).toBeDefined();
      expect(suggestions[0].reason).toContain('gh CLI');
    });

    it('should NOT recommend replacing remote MCP servers', () => {
      const servers: McpServerEntry[] = [{
        name: 'custom-api',
        url: 'https://my-mcp-server.example.com/mcp',
        sourceFile: '.cursor/mcp.json'
      }];

      const suggestions = analyzeMcpServers(servers);

      expect(suggestions[0].canReplace).toBe(false);
      expect(suggestions[0].replacementType).toBe('none');
    });

    it('should classify memory server as replaceable by skill', () => {
      const servers: McpServerEntry[] = [{
        name: 'memory',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        sourceFile: '.cursor/mcp.json'
      }];

      const suggestions = analyzeMcpServers(servers);

      expect(suggestions[0].canReplace).toBe(true);
      expect(suggestions[0].replacementType).toBe('skill');
      expect(suggestions[0].reason).toContain('AGENTS.md');
    });

    it('should handle mixed replaceable and non-replaceable servers', () => {
      const servers: McpServerEntry[] = [
        { name: 'filesystem', command: 'npx', args: ['server-filesystem'], sourceFile: '.cursor/mcp.json' },
        { name: 'custom-llm', url: 'https://llm.internal.co/mcp', sourceFile: '.cursor/mcp.json' },
        { name: 'github', command: 'npx', args: ['server-github'], sourceFile: '.cursor/mcp.json' },
      ];

      const suggestions = analyzeMcpServers(servers);
      const replaceable = suggestions.filter(s => s.canReplace);
      const nonReplaceable = suggestions.filter(s => !s.canReplace);

      expect(replaceable.length).toBe(2);
      expect(nonReplaceable.length).toBe(1);
    });

    it('should generate valid skill file content', () => {
      const servers: McpServerEntry[] = [{
        name: 'filesystem',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
        sourceFile: '.cursor/mcp.json'
      }];

      const suggestions = analyzeMcpServers(servers);
      const skill = suggestions[0].skillContent!;

      expect(skill).toContain('# Skill: filesystem');
      expect(skill).toContain('.cursor/mcp.json');
      expect(skill).toContain('npx');
    });

    it('should generate valid script file content', () => {
      const servers: McpServerEntry[] = [{
        name: 'github',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        sourceFile: '.cursor/mcp.json'
      }];

      const suggestions = analyzeMcpServers(servers);
      const script = suggestions[0].scriptContent!;

      expect(script).toContain('#!/bin/bash');
      expect(script).toContain('github');
      expect(script).toContain('set -euo pipefail');
    });
  });
});
