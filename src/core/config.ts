import { z } from 'zod';

export const AgentConfigSchema = z.object({
  enabled: z.boolean().default(true),
  adapter: z.string()
});

export const ScopeConfigSchema = z.object({
  path: z.string(),
  files: z.array(z.string())
});

// Budget defaults derived from real-world analysis of popular open-source repos:
//   React CLAUDE.md:                      63 tokens (minimal pointer)
//   Anthropic Cookbook CLAUDE.md:         930 tokens (lean, operational)
//   VS Code copilot-instructions.md:   2,274 tokens (comprehensive)
//   TypeScript copilot-instructions.md: 2,925 tokens (detailed)
//   OpenAI Codex AGENTS.md:             4,164 tokens (full monorepo guide)
//   Next.js AGENTS.md:                  5,179 tokens (large monorepo)
//
// Median: 2,925 | P75: 4,164 | Max: 5,179
//
// rootTokensMax default = 3,000 (just above median — healthy for most repos)
// scopedTokensMax default = 1,500 (scoped files should be focused)
export const BudgetsConfigSchema = z.object({
  rootTokensMax: z.number().default(3000),
  scopedTokensMax: z.number().default(1500),
  duplicationMaxPercent: z.number().default(15),
  commandCoverageMinPercent: z.number().default(80)
});

export const AiLayerConfigSchema = z.object({
  version: z.number().default(1),
  mode: z.enum(['canonical']).default('canonical'),
  repo: z.object({
    type: z.enum(['monorepo', 'single', 'unknown']),
    detectedStacks: z.array(z.string())
  }),
  agents: z.object({
    copilot: AgentConfigSchema.optional(),
    claude: AgentConfigSchema.optional()
  }).optional(),
  shared: z.object({
    rootGuide: z.string().optional(),
    files: z.array(z.string()).default([])
  }).optional(),
  scopes: z.array(ScopeConfigSchema).default([]),
  budgets: BudgetsConfigSchema.optional()
});

export type AiLayerConfig = z.infer<typeof AiLayerConfigSchema>;
