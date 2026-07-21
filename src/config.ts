import { resolve } from 'node:path';
import type { TraceStore } from './trace.js';
import { setPlanningRelativeDir } from './utils/session/store.js';

export interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  /**
   * Absolute path to the worktree / workspace root the server is bound to.
   * This is the required startup root (CLI `--workspace`, `WORKFLOW_WORKSPACE`,
   * or `WORKTREE_ROOT` alias). Planning folders are derived under this path
   * (default `.engineering/artifacts/planning/`); session state
   * (`session.json` + `.session-token`) lives under that planning tree.
   */
  workspaceDir: string;
  /**
   * Relative planning directory under `workspaceDir`. Default
   * `.engineering/artifacts/planning`. Override with `PLANNING_SLUG`.
   * `loadConfig` always populates this; optional on the interface so test
   * literals may omit it. Applied once at startup via `setPlanningRelativeDir`
   * so `planningRoot` keeps its one-argument call-site signature.
   */
  planningRelativeDir?: string;
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
   * Which transport connects the server built by createServer(). Optional on
   * the interface — a config literal that omits it (as pre-existing tests
   * and scripts do) is still valid — but `loadConfig` always populates it
   * (default 'stdio') so real CLI startup never sees `undefined` here.
   */
  transport?: Transport;
  /** Port the HTTP transport listens on. Default 3000. Ignored under stdio. */
  port?: number;
  /** Host the HTTP transport binds to. Default 'localhost'. Ignored under stdio. */
  host?: string;
}

/** Transports the server can be connected to; see src/transports/. */
export type Transport = 'stdio' | 'http';

const VALID_TRANSPORTS: readonly Transport[] = ['stdio', 'http'];

function isTransport(value: string): value is Transport {
  return (VALID_TRANSPORTS as readonly string[]).includes(value);
}

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
 * Thrown by loadConfig when no workspace / worktree root can be resolved from
 * CLI args or environment. A root is required because every authenticated tool
 * reads and writes session state under the configured planning tree.
 */
export class WorkspaceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkspaceConfigError';
  }
}

/** Default relative planning directory under the worktree / workspace root. */
export const DEFAULT_PLANNING_RELATIVE_DIR = '.engineering/artifacts/planning';

/**
 * Resolve `PLANNING_SLUG`: trim; empty / whitespace falls back to the monorepo
 * default `.engineering/artifacts/planning`.
 */
export function resolvePlanningRelativeDir(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const raw = env['PLANNING_SLUG']?.trim();
  return raw || DEFAULT_PLANNING_RELATIVE_DIR;
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
 * Resolve the worktree / workspace root with
 * CLI `--workspace` > `WORKFLOW_WORKSPACE` > `WORKTREE_ROOT` precedence.
 * Returns an absolute path. Throws WorkspaceConfigError when no source
 * supplies a value — an explicit failure beats silently defaulting to
 * `process.cwd()`. The resolved path is stored as `ServerConfig.workspaceDir`
 * and is the configured worktree root for readiness and planning derivation.
 */
function resolveWorkspaceDir(argv: readonly string[]): string {
  const fromCli = parseWorkspaceFlag(argv);
  if (fromCli) return resolve(fromCli);

  const fromEnv = process.env['WORKFLOW_WORKSPACE']?.trim();
  if (fromEnv) return resolve(fromEnv);

  // Alias for the same required root bind (brief naming / container layouts).
  const fromWorktreeRoot = process.env['WORKTREE_ROOT']?.trim();
  if (fromWorktreeRoot) return resolve(fromWorktreeRoot);

  throw new WorkspaceConfigError(
    'Workspace / worktree root is required. Pass --workspace=PATH on the command line, or set WORKFLOW_WORKSPACE or WORKTREE_ROOT in the environment. The resolved path is ServerConfig.workspaceDir (the configured worktree root).',
  );
}

/**
 * Parse `--transport=stdio|http` or `--transport stdio|http`, mirroring
 * `parseWorkspaceFlag`. Returns `undefined` when absent so the caller can
 * fall through to the env var and then the 'stdio' default.
 */
function parseTransportFlag(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg.startsWith('--transport=')) {
      const value = arg.slice('--transport='.length).trim();
      if (value) return value;
    } else if (arg === '--transport') {
      const next = argv[i + 1]?.trim();
      if (next) return next;
    }
  }
  return undefined;
}

/**
 * Resolve the transport with CLI > env > 'stdio' default precedence. Throws
 * WorkspaceConfigError on an unrecognized value — an explicit failure beats
 * silently falling back to stdio when the caller made a typo.
 */
function resolveTransport(argv: readonly string[]): Transport {
  const raw = parseTransportFlag(argv) ?? process.env['TRANSPORT']?.trim();
  if (!raw) return 'stdio';
  if (!isTransport(raw)) {
    throw new WorkspaceConfigError(
      `Unrecognized --transport value '${raw}'. Valid values: ${VALID_TRANSPORTS.join(', ')}.`,
    );
  }
  return raw;
}

/**
 * Parse `--port=N` or `--port N`, mirroring `parseWorkspaceFlag`.
 */
function parsePortFlag(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg.startsWith('--port=')) {
      const value = arg.slice('--port='.length).trim();
      if (value) return value;
    } else if (arg === '--port') {
      const next = argv[i + 1]?.trim();
      if (next) return next;
    }
  }
  return undefined;
}

const DEFAULT_HTTP_PORT = 3000;

/**
 * Resolve the HTTP port with CLI > env > default precedence. Falls back to
 * the default on a missing or non-positive-integer value rather than
 * throwing — the port only matters when `--transport=http` is selected, so a
 * bad value here shouldn't block stdio users.
 */
function resolvePort(argv: readonly string[]): number {
  const raw = parsePortFlag(argv) ?? process.env['PORT']?.trim();
  if (!raw) return DEFAULT_HTTP_PORT;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_HTTP_PORT;
}

/**
 * Parse `--host=HOST` or `--host HOST`, mirroring `parseWorkspaceFlag`.
 */
function parseHostFlag(argv: readonly string[]): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg.startsWith('--host=')) {
      const value = arg.slice('--host='.length).trim();
      if (value) return value;
    } else if (arg === '--host') {
      const next = argv[i + 1]?.trim();
      if (next) return next;
    }
  }
  return undefined;
}

function resolveHost(argv: readonly string[]): string {
  return parseHostFlag(argv) ?? envOrDefault('HOST', 'localhost');
}

/**
 * Build the server configuration from CLI args and environment variables.
 *
 * `argv` defaults to `process.argv.slice(2)` so the function can be invoked
 * without arguments from `main()`; tests pass an explicit vector to exercise
 * the precedence rules deterministically.
 */
export function loadConfig(argv: readonly string[] = process.argv.slice(2)): ServerConfig {
  const planningRelativeDir = resolvePlanningRelativeDir();
  // Pin the active planning relative dir at config load so planningRoot()
  // callers see the configured slug without a second argument.
  setPlanningRelativeDir(planningRelativeDir);
  return {
    workflowDir: resolve(PROJECT_ROOT, envOrDefault('WORKFLOW_DIR', './workflows')),
    schemasDir: resolve(PROJECT_ROOT, envOrDefault('SCHEMAS_DIR', './schemas')),
    workspaceDir: resolveWorkspaceDir(argv),
    planningRelativeDir,
    serverName: envOrDefault('SERVER_NAME', 'workflow-server'),
    serverVersion: envOrDefault('SERVER_VERSION', '2.1.0'),
    bundleHeadroomFraction: envNumberOrDefault('BUNDLE_HEADROOM_FRACTION', DEFAULT_BUNDLE_HEADROOM_FRACTION),
    bundleCharsPerToken: envNumberOrDefault('BUNDLE_CHARS_PER_TOKEN', DEFAULT_BUNDLE_CHARS_PER_TOKEN),
    transport: resolveTransport(argv),
    port: resolvePort(argv),
    host: resolveHost(argv),
  };
}
