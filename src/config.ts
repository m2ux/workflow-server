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
  /**
   * Fraction of a worker's declared `context_tokens` treated as available for
   * eager step-technique bundling on `get_activity` — the availability headroom
   * that keeps bundling well inside the window. Default 0.80 (see
   * DEFAULT_BUNDLE_HEADROOM_FRACTION). Env override: `BUNDLE_HEADROOM_FRACTION`.
   */
  bundleHeadroomFraction?: number;
  /**
   * Token→character conversion factor used to turn the headroom-adjusted token
   * budget into a character budget for eager bundling. Default 4 (see
   * DEFAULT_BUNDLE_CHARS_PER_TOKEN). Env override: `BUNDLE_CHARS_PER_TOKEN`.
   */
  bundleCharsPerToken?: number;
  /** In-process trace store for execution tracing. Created by createServer(). */
  traceStore?: TraceStore;
  /** Minimum seconds between checkpoint issuance and response. Default 3. Set to 0 for testing. */
  minCheckpointResponseSeconds?: number;
  /**
   * Per-model USD-per-MTok rates ({ input, output }) for cost estimation.
   * Cache rates are derived from base input via universal multipliers.
   */
  priceTable?: PriceTable;
  /** Version string stamped on each cost estimate; env-overridable via PRICE_TABLE_VERSION. */
  priceTableVersion?: string;
}

/** USD-per-MTok base input/output rates keyed by model id. */
export type PriceTable = Record<string, { input: number; output: number }>;

/** Config shape after startup — traceStore is guaranteed present. */
export interface ResolvedServerConfig extends ServerConfig {
  traceStore: TraceStore;
}

const PROJECT_ROOT = resolve(import.meta.dirname, '..');

/**
 * Eager step-technique bundling budget policy. The per-activity eager-delivery
 * budget on `get_activity` is `context_tokens × headroomFraction × charsPerToken`.
 * These are the server-owned defaults; both are env-overridable and both have an
 * in-code fallback so a config built without them (e.g. in tests) still bundles.
 */
export const DEFAULT_BUNDLE_HEADROOM_FRACTION = 0.8;
export const DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4;

/**
 * Build-time price table seeded from Anthropic pricing (2026-07-15).
 * Re-confirm figures at build time when pricing changes.
 */
export const DEFAULT_PRICE_TABLE: PriceTable = {
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-haiku-4-5': { input: 1, output: 5 },
  'claude-fable-5': { input: 10, output: 50 },
};

export const DEFAULT_PRICE_TABLE_VERSION = '2026-07-15';

function envOrDefault(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

/**
 * Read a positive numeric env var, falling back to `fallback` when unset,
 * blank, or not a finite positive number. Keeps bundling-budget policy as
 * config rather than inline constants while staying robust to bad input.
 */
function envNumberOrDefault(key: string, fallback: number): number {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
 * Resolve the workspace path with CLI > env precedence. Returns an absolute
 * path. Throws WorkspaceConfigError when neither source supplies a value — an
 * explicit failure beats silently defaulting to `process.cwd()`.
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
    serverVersion: envOrDefault('SERVER_VERSION', '2.1.0'),
    bundleHeadroomFraction: envNumberOrDefault('BUNDLE_HEADROOM_FRACTION', DEFAULT_BUNDLE_HEADROOM_FRACTION),
    bundleCharsPerToken: envNumberOrDefault('BUNDLE_CHARS_PER_TOKEN', DEFAULT_BUNDLE_CHARS_PER_TOKEN),
    priceTable: DEFAULT_PRICE_TABLE,
    priceTableVersion: envOrDefault('PRICE_TABLE_VERSION', DEFAULT_PRICE_TABLE_VERSION),
  };
}
