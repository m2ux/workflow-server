import { resolve } from 'node:path';
import type { TraceStore } from './trace.js';

export interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  /**
   * Absolute path to the workspace root the server is bound to. The workspace
   * is the repository (or working copy) whose `.engineering/artifacts/planning/`
   * subtree owns the per-session `session.json` + `.session-token` pairs. The
   * server resolves planning folders relative to this path on every
   * authenticated call.
   */
  workspaceDir: string;
  serverName: string;
  serverVersion: string;
  /** In-process trace store for execution tracing. Created by createServer(). */
  traceStore?: TraceStore;
  /** Minimum seconds between checkpoint issuance and response. Default 3. Set to 0 for testing. */
  minCheckpointResponseSeconds?: number;
}

/** Config shape after startup — traceStore is guaranteed present. */
export interface ResolvedServerConfig extends ServerConfig {
  traceStore: TraceStore;
}

const PROJECT_ROOT = resolve(import.meta.dirname, '..');

function envOrDefault(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

/**
 * Thrown by loadConfig when no workspace path can be resolved from CLI args or
 * environment. A workspace is required because every authenticated tool reads
 * and writes session state under `<workspaceDir>/.engineering/artifacts/planning/`.
 */
export class WorkspaceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkspaceConfigError';
  }
}

/**
 * Parse `--workspace=PATH` or `--workspace PATH` from a CLI argument vector.
 * Returns the first match, or `undefined` if absent. Empty values are ignored
 * (treated as absent) so they fall through to the env-var branch.
 */
function parseWorkspaceFlag(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg.startsWith('--workspace=')) {
      const value = arg.slice('--workspace='.length).trim();
      if (value) return value;
    } else if (arg === '--workspace') {
      const next = argv[i + 1]?.trim();
      if (next) return next;
    }
  }
  return undefined;
}

/**
 * Resolve the workspace path with CLI > env precedence (PD-1). Returns an
 * absolute path. Throws WorkspaceConfigError when neither source supplies a
 * value — an explicit failure beats silently defaulting to `process.cwd()`.
 */
function resolveWorkspaceDir(argv: readonly string[]): string {
  const fromCli = parseWorkspaceFlag(argv);
  if (fromCli) return resolve(fromCli);

  const fromEnv = process.env['WORKFLOW_WORKSPACE']?.trim();
  if (fromEnv) return resolve(fromEnv);

  throw new WorkspaceConfigError(
    'Workspace path is required. Pass --workspace=PATH on the command line or set WORKFLOW_WORKSPACE in the environment.',
  );
}

/**
 * Build the server configuration from CLI args and environment variables.
 *
 * `argv` defaults to `process.argv.slice(2)` so the function can be invoked
 * without arguments from `main()`; tests pass an explicit vector to exercise
 * the precedence rules deterministically.
 */
export function loadConfig(argv: readonly string[] = process.argv.slice(2)): ServerConfig {
  return {
    workflowDir: resolve(PROJECT_ROOT, envOrDefault('WORKFLOW_DIR', './workflows')),
    schemasDir: resolve(PROJECT_ROOT, envOrDefault('SCHEMAS_DIR', './schemas')),
    workspaceDir: resolveWorkspaceDir(argv),
    serverName: envOrDefault('SERVER_NAME', 'workflow-server'),
    serverVersion: envOrDefault('SERVER_VERSION', '1.0.0'),
  };
}
