import { resolve } from 'node:path';
import type { TraceStore } from './trace.js';

export interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  serverName: string;
  serverVersion: string;
  /** Schema preamble prepended to get_workflow responses. Built at startup. */
  schemaPreamble?: string;
  /** In-process trace store for execution tracing. Created by createServer(). */
  traceStore?: TraceStore;
  /** Minimum seconds between checkpoint issuance and response. Default 3. Set to 0 for testing. */
  minCheckpointResponseSeconds?: number;
}

/** Config shape after startup — schemaPreamble and traceStore are guaranteed present. */
export interface ResolvedServerConfig extends ServerConfig {
  schemaPreamble: string;
  traceStore: TraceStore;
}

const PROJECT_ROOT = resolve(import.meta.dirname, '..');

function envOrDefault(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

export function loadConfig(): ServerConfig {
  return {
    workflowDir: resolve(PROJECT_ROOT, envOrDefault('WORKFLOW_DIR', './workflows')),
    schemasDir: resolve(PROJECT_ROOT, envOrDefault('SCHEMAS_DIR', './schemas')),
    serverName: envOrDefault('SERVER_NAME', 'workflow-server'),
    serverVersion: envOrDefault('SERVER_VERSION', '1.0.0'),
  };
}
