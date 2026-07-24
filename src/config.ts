import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { TraceStore } from './trace.js';
import { PLANNING_RELATIVE_DIR, setPlanningRelativeDir } from './utils/session/store.js';

/**
 * Planning path under an engineering-branch checkout (init-repo layout).
 * The engineering branch root already *is* the engineering tree, so planning
 * lives at `artifacts/planning` rather than `.engineering/artifacts/planning`.
 */
export const REPO_PLANNING_RELATIVE_DIR = 'artifacts/planning';

export interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  /**
   * Absolute path to the worktree / workspace root the server is bound to.
   * Feature worktrees live under this path. With `--repo=owner/repo`, this is
   * `$INSTALL/workspace/<owner>/<repo>`.
   */
  workspaceDir: string;
  /**
   * Absolute path to the engineering checkout used for planning artifacts.
   * Optional on literals (tests/scripts): `createServer` / callers treat a
   * missing value as `workspaceDir` (legacy single-root layout).
   * With `--repo=owner/repo`, this is `$INSTALL/engineering/<owner>/<repo>`.
   */
  engineeringDir?: string;
  /**
   * Normalised `owner/repo` when the server was bound via `--repo` /
   * `WORKFLOW_SERVER_REPO`. Absent when bound by an explicit workspace path.
   */
  repo?: string;
  /**
   * Absolute install root used to derive repo paths. Present when bound via
   * `--repo` or when `WORKFLOW_SERVER_INSTALL_DIR` is set.
   */
  installDir?: string;
  /**
   * Relative planning directory under the engineering root
   * (`engineeringDir` when set, else `workspaceDir`).
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

/** Config shape after startup — traceStore and engineeringDir are guaranteed. */
export interface ResolvedServerConfig extends ServerConfig {
  traceStore: TraceStore;
  engineeringDir: string;
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

/**
 * Resolve `PLANNING_SLUG`: trim; empty / whitespace falls back to `fallback`
 * (legacy monorepo default `.engineering/artifacts/planning`, or
 * `artifacts/planning` under a repo-bound engineering checkout).
 */
export function resolvePlanningRelativeDir(
  env: NodeJS.ProcessEnv = process.env,
  fallback: string = PLANNING_RELATIVE_DIR,
): string {
  const raw = env['PLANNING_SLUG']?.trim();
  return raw || fallback;
}

/** Default install root: `$XDG_DATA_HOME/workflow-server` or `~/.local/share/workflow-server`. */
export function defaultInstallDir(env: NodeJS.ProcessEnv = process.env): string {
  const xdg = env['XDG_DATA_HOME']?.trim();
  if (xdg) return resolve(xdg, 'workflow-server');
  return resolve(homedir(), '.local/share/workflow-server');
}

/**
 * Parse a single `--flag=VALUE` / `--flag VALUE` style option from argv.
 * Empty values are ignored so callers fall through to env defaults.
 */
function parseFlag(argv: readonly string[], name: string): string | undefined {
  const eq = `--${name}=`;
  const bare = `--${name}`;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg.startsWith(eq)) {
      const value = arg.slice(eq.length).trim();
      if (value) return value;
    } else if (arg === bare) {
      const next = argv[i + 1]?.trim();
      if (next) return next;
    }
  }
  return undefined;
}

/**
 * Normalize a repo identifier to `owner/repo`. Accepts:
 *   m2ux/workflow-server
 *   https://github.com/m2ux/workflow-server[.git]
 *   git@github.com:m2ux/workflow-server.git
 * Throws WorkspaceConfigError on invalid input.
 */
export function normalizeRepoPath(raw: string): string {
  let value = raw.trim();
  if (!value) {
    throw new WorkspaceConfigError(
      "Invalid --repo value: empty. Expected owner/repo (e.g. m2ux/workflow-server).",
    );
  }
  value = value.replace(/\/+$/, '');
  value = value.replace(/\.git$/i, '');

  const httpsMatch = value.match(/^https?:\/\/[^/]+\/([^/]+)\/([^/]+)$/i);
  if (httpsMatch?.[1] && httpsMatch[2]) {
    return `${httpsMatch[1]}/${httpsMatch[2]}`;
  }
  const sshMatch = value.match(/^git@[^:]+:([^/]+)\/([^/]+)$/i);
  if (sshMatch?.[1] && sshMatch[2]) {
    return `${sshMatch[1]}/${sshMatch[2]}`;
  }
  if (/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(value)) {
    return value;
  }
  throw new WorkspaceConfigError(
    `Invalid --repo value '${raw}'. Expected owner/repo (e.g. m2ux/workflow-server), or a github https/ssh URL.`,
  );
}

/** Install root: CLI `--install-dir` > `WORKFLOW_SERVER_INSTALL_DIR` > XDG default. */
export function resolveInstallDir(
  argv: readonly string[] = [],
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromCli = parseFlag(argv, 'install-dir');
  if (fromCli) return resolve(fromCli);
  const fromEnv = env['WORKFLOW_SERVER_INSTALL_DIR']?.trim();
  if (fromEnv) return resolve(fromEnv);
  return defaultInstallDir(env);
}

export interface RepoPaths {
  repo: string;
  installDir: string;
  engineeringDir: string;
  workspaceDir: string;
}

/**
 * Derive the canonical per-repo paths under the install root:
 *   $INSTALL/engineering/<owner>/<repo>
 *   $INSTALL/workspace/<owner>/<repo>
 */
export function resolveRepoPaths(
  repoRaw: string,
  installDir: string,
): RepoPaths {
  const repo = normalizeRepoPath(repoRaw);
  const root = resolve(installDir);
  return {
    repo,
    installDir: root,
    engineeringDir: resolve(root, 'engineering', repo),
    workspaceDir: resolve(root, 'workspace', repo),
  };
}

/** Engineering root used for planning: explicit field or workspace fallback. */
export function resolveEngineeringDir(config: ServerConfig): string {
  return config.engineeringDir ?? config.workspaceDir;
}

interface ResolvedRoots {
  workspaceDir: string;
  engineeringDir: string;
  repo?: string;
  installDir?: string;
  /** Planning relative-dir fallback before PLANNING_SLUG is applied. */
  planningFallback: string;
}

/**
 * Resolve workspace + engineering roots.
 *
 * Precedence:
 *   1. `--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT` (explicit path).
 *      Docker start.sh binds install multi-roots (`$INSTALL/workspace` +
 *      `$INSTALL/engineering`). Repo is chosen at `start_session` time, not
 *      process start.
 *   2. Optional `--repo` / `WORKFLOW_SERVER_REPO` pins a single owner/repo under
 *      the install root (stdio single-tenant). Prefer session-time `repo` when
 *      serving multiple init-repo checkouts from one process.
 *   3. Error if neither workspace nor repo can be resolved.
 *
 * Split engineering root defaults planning to `artifacts/planning`.
 * Legacy single-root defaults to `.engineering/artifacts/planning`.
 */
function resolveRoots(argv: readonly string[]): ResolvedRoots {
  const fromWorkspaceCli = parseFlag(argv, 'workspace');
  const fromWorkspaceEnv = process.env['WORKFLOW_WORKSPACE']?.trim();
  const fromWorktreeRoot = process.env['WORKTREE_ROOT']?.trim();
  const explicitWorkspace = fromWorkspaceCli || fromWorkspaceEnv || fromWorktreeRoot;

  const fromRepoCli = parseFlag(argv, 'repo');
  const fromRepoEnv = process.env['WORKFLOW_SERVER_REPO']?.trim();
  const repoRaw = fromRepoCli || fromRepoEnv;

  if (explicitWorkspace) {
    const workspaceDir = resolve(explicitWorkspace);
    const engOverride = process.env['WORKFLOW_SERVER_ENGINEERING_DIR']?.trim();
    const engineeringDir = engOverride ? resolve(engOverride) : workspaceDir;
    const installDirEnv = process.env['WORKFLOW_SERVER_INSTALL_DIR']?.trim();
    const installDir = installDirEnv
      ? resolve(installDirEnv)
      : resolveInstallDir(argv);
    // Optional process pin: only when workspace is NOT the install multi-root
    // (or is already the per-repo workspace). Multi-root Docker keeps multi-root
    // so start_session can select owner/repo dynamically.
    const multiRootWorkspace = resolve(installDir, 'workspace');
    const isMultiRootWorkspace = workspaceDir === multiRootWorkspace;
    if (repoRaw && !isMultiRootWorkspace) {
      const paths = resolveRepoPaths(repoRaw, installDir);
      // Explicit workspace that already is the per-repo path, or arbitrary pin.
      if (workspaceDir === paths.workspaceDir) {
        return {
          workspaceDir: paths.workspaceDir,
          engineeringDir: engOverride ? engineeringDir : paths.engineeringDir,
          repo: paths.repo,
          installDir: paths.installDir,
          planningFallback: REPO_PLANNING_RELATIVE_DIR,
        };
      }
    }
    const result: ResolvedRoots = {
      workspaceDir,
      engineeringDir,
      planningFallback: engOverride ? REPO_PLANNING_RELATIVE_DIR : PLANNING_RELATIVE_DIR,
    };
    // Record repo only when it pins a single checkout (not multi-root Docker).
    if (repoRaw && !isMultiRootWorkspace) {
      result.repo = normalizeRepoPath(repoRaw);
    }
    result.installDir = installDir;
    return result;
  }

  if (repoRaw) {
    const installDir = resolveInstallDir(argv);
    const paths = resolveRepoPaths(repoRaw, installDir);
    return {
      workspaceDir: paths.workspaceDir,
      engineeringDir: paths.engineeringDir,
      repo: paths.repo,
      installDir: paths.installDir,
      planningFallback: REPO_PLANNING_RELATIVE_DIR,
    };
  }

  throw new WorkspaceConfigError(
    'Workspace / worktree root is required. Pass --workspace=PATH, WORKFLOW_WORKSPACE, or WORKTREE_ROOT (Docker multi-root), or --repo=owner/repo for a single pinned checkout under $INSTALL. Repo for multi-root is selected at start_session.',
  );
}

/** CLI `--workflow-dir` > `WORKFLOW_DIR` > `./workflows` (relative to package root). */
function resolveWorkflowDir(argv: readonly string[]): string {
  const fromCli = parseFlag(argv, 'workflow-dir');
  if (fromCli) return resolve(PROJECT_ROOT, fromCli);
  return resolve(PROJECT_ROOT, envOrDefault('WORKFLOW_DIR', './workflows'));
}

/**
 * Resolve the transport with CLI > env > 'stdio' default precedence. Throws
 * WorkspaceConfigError on an unrecognized value — an explicit failure beats
 * silently falling back to stdio when the caller made a typo.
 */
function resolveTransport(argv: readonly string[]): Transport {
  const raw = parseFlag(argv, 'transport') ?? process.env['TRANSPORT']?.trim();
  if (!raw) return 'stdio';
  if (!isTransport(raw)) {
    throw new WorkspaceConfigError(
      `Unrecognized --transport value '${raw}'. Valid values: ${VALID_TRANSPORTS.join(', ')}.`,
    );
  }
  return raw;
}

const DEFAULT_HTTP_PORT = 3000;

/**
 * Resolve the HTTP port with CLI > env > default precedence. Falls back to
 * the default on a missing or non-positive-integer value rather than
 * throwing — the port only matters when `--transport=http` is selected, so a
 * bad value here shouldn't block stdio users.
 */
function resolvePort(argv: readonly string[]): number {
  const raw = parseFlag(argv, 'port') ?? process.env['PORT']?.trim();
  if (!raw) return DEFAULT_HTTP_PORT;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_HTTP_PORT;
}

function resolveHost(argv: readonly string[]): string {
  return parseFlag(argv, 'host') ?? envOrDefault('HOST', 'localhost');
}

/**
 * Build the server configuration from CLI args and environment variables.
 *
 * `argv` defaults to `process.argv.slice(2)` so the function can be invoked
 * without arguments from `main()`; tests pass an explicit vector to exercise
 * the precedence rules deterministically.
 *
 * Root binding: `--workspace` / env paths take precedence over `--repo` /
 * `WORKFLOW_SERVER_REPO`. Repo mode derives:
 *   workspaceDir    = $INSTALL/workspace/<owner>/<repo>
 *   engineeringDir  = $INSTALL/engineering/<owner>/<repo>
 */
export function loadConfig(argv: readonly string[] = process.argv.slice(2)): ServerConfig {
  const roots = resolveRoots(argv);
  const planningRelativeDir = resolvePlanningRelativeDir(
    process.env,
    roots.planningFallback,
  );
  // Pin the active planning relative dir at config load so planningRoot()
  // callers see the configured slug without a second argument.
  setPlanningRelativeDir(planningRelativeDir);
  return {
    workflowDir: resolveWorkflowDir(argv),
    schemasDir: resolve(PROJECT_ROOT, envOrDefault('SCHEMAS_DIR', './schemas')),
    workspaceDir: roots.workspaceDir,
    engineeringDir: roots.engineeringDir,
    ...(roots.repo !== undefined ? { repo: roots.repo } : {}),
    ...(roots.installDir !== undefined ? { installDir: roots.installDir } : {}),
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
