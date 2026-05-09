export type RepoType = 'monorepo' | 'single' | 'unknown';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'nuget';
export type TechStack = 'typescript' | 'javascript' | 'dotnet' | 'unknown';
export type TestFramework = 'playwright' | 'jest' | 'vitest' | 'xunit' | 'nunit' | 'mstest';

export interface AiLayerFacts {
  hasAgentsMd: boolean;
  hasClaudeMd: boolean;
  hasCopilotInstructions: boolean;
  hasAiLayerYaml: boolean;
  existingScopes: string[];
  existingPrompts: string[];
  existingSharedFiles: string[];
  existingSkills: string[];
}

export interface SubprojectAiLayer {
  /** Relative path from root (e.g., "packages/api") */
  path: string;
  aiLayer: AiLayerFacts;
}

export interface ContextQualityFacts {
  hasReadme: boolean;
  hasArchitectureMd: boolean;
  hasContributing: boolean;
  hasAdrs: boolean;
  hasChangelog: boolean;
  hasDesignDocs: boolean;
  hasApiDocs: boolean;
  readmeWordCount: number;
  detectedDocs: string[];
}

export interface McpServerEntry {
  name: string;
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  sourceFile: string;
}

export type McpReplacementType = 'skill' | 'script' | 'hook' | 'none';

export interface McpReplacementSuggestion {
  server: McpServerEntry;
  canReplace: boolean;
  replacementType: McpReplacementType;
  reason: string;
  skillContent?: string;
  scriptContent?: string;
}

export interface McpFacts {
  servers: McpServerEntry[];
  configFiles: string[];
}

export interface RepoFacts {
  type: RepoType;
  packageManagers: PackageManager[];
  stacks: TechStack[];
  testFrameworks: TestFramework[];
  hasGitHubActions: boolean;
  buildCommands: string[];
  testCommands: string[];
  aiLayer: AiLayerFacts;
  mcpFacts: McpFacts;
  subprojects: SubprojectAiLayer[];
  contextQuality: ContextQualityFacts;
}

export interface AiLayerFile {
  path: string;
  content: string;
  agentTarget?: 'copilot' | 'claude' | 'shared';
}

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditIssue {
  code: string;
  severity: IssueSeverity;
  message: string;
  file?: string;
}

export interface SubScores {
  coverage: number;
  specificity: number;
  freshness: number;
  scopeQuality: number;
  redundancy: number;
  tokenEfficiency: number;
  contextQuality: number;
  agentBestPractices: number;
}

export interface TokenBudgetReport {
  rootLoadTokens: number;
  rootBudget: number;
  scopedLoadTokens: number;
  duplicationWastePercent: number;
}

export interface AuditReport {
  score: number;
  subscores: SubScores;
  budgets: TokenBudgetReport;
  issues: AuditIssue[];
}
