import path from 'node:path';
import os from 'node:os';
import { z } from 'zod';

const McpServerConfigSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).default([]),
  env: z.record(z.string()).optional(),
});

export interface McpServerConfig {
  command: string;
  args: string[];
  env: Record<string, string> | undefined;
}

const RunnerConfigSchema = z.object({
  slack: z.object({
    botToken: z.string().startsWith('xoxb-'),
    signingSecret: z.string().min(1),
    appToken: z.string().startsWith('xapp-'),
  }),
  cursor: z.object({
    apiKey: z.string().min(1),
    agentBinary: z.string(),
  }),
  repo: z.object({
    path: z.string().min(1),
    worktreeBaseDir: z.string().min(1),
  }),
  mcpServers: z.record(McpServerConfigSchema).default({}),
});

export type RunnerConfig = z.infer<typeof RunnerConfigSchema>;

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Required environment variable ${name} is not set`);
  return val;
}

export function loadRunnerConfig(): RunnerConfig {
  return RunnerConfigSchema.parse({
    slack: {
      botToken: requireEnv('SLACK_BOT_TOKEN'),
      signingSecret: requireEnv('SLACK_SIGNING_SECRET'),
      appToken: requireEnv('SLACK_APP_TOKEN'),
    },
    cursor: {
      apiKey: requireEnv('CURSOR_API_KEY'),
      agentBinary: process.env['CURSOR_AGENT_BINARY'] ?? 'agent',
    },
    repo: {
      path: requireEnv('REPO_PATH'),
      worktreeBaseDir: process.env['WORKTREE_BASE_DIR'] ?? path.join(os.homedir(), 'worktrees'),
    },
    mcpServers: parseMcpServers(),
  });
}

function parseMcpServers(): Record<string, McpServerConfig> {
  const raw = process.env['MCP_SERVERS_JSON'];
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, McpServerConfig>;
  } catch {
    throw new Error('MCP_SERVERS_JSON is not valid JSON');
  }
}
