import { homedir } from 'node:os';
import { basename, resolve } from 'node:path';
import type { TraceStore } from './trace.js';
import {
  buildPathPresentationMap,
  type PathPresentationMap,
} from './utils/path-presentation.js';
import { PLANNING_RELATIVE_DIR, setPlanningRelativeDir } from './utils/session/store.js';

export type { PathPresentationMap } from './utils/path-presentation.js';
export {
  buildPathPresentationMap,
  presentPathToAgent,
  isPathUnderRoot,
  collapseOwnerRepoUnderRoot,
} from './utils/path-presentation.js';

/**
 * Planning path under an engineering-branch checkout (basename layout under
 * HOST_PROJECTS_ROOT). The engineering branch root already *is* the engineering
 * tree, so planning lives at `artifacts/planning` rather than
 * `.engineering/artifacts/planning`.
 */
export const REPO_PLANNING_RELATIVE_DIR = 'artifacts/planning';

export interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  /**
   * Absolute path to the feature-worktree root the server is bound to.
   * Feature worktrees live under this path. With `--repo=owner/repo` (pinned),
   * this is `$HOST_PROJECTS_ROOT/<repo>/.worktrees` (or `$INSTALL/projects/<repo>/.worktrees`
   * when projects still co-locate under the install root). Legacy separate
   * `$INSTALL/worktrees/…` is deprecated.
   */
  workspaceDir: string;
  /**
   * Absolute path to the engineering checkout used for planning artifacts.
   * Optional on literals (tests/scripts): `createServer` / callers treat a
   * missing value as `workspaceDir` (single-root layout).
   * With `--repo=owner/repo` (pinned), this is
   * `$HOST_PROJECTS_ROOT/<repo>/.engineering` (basename checkout — not owner/repo).
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
  /**
   * Host-side bind source for the projects / engineering multi-root mount.
   * When set (Docker via `HOST_PROJECTS_ROOT`), agent-facing paths such as
   * `planning_folder_path` are rewritten from the server/container prefix to
   * this host prefix, with deprecated `owner/repo` segments collapsed to the
   * canonical basename checkout (`$HOST_PROJECTS_ROOT/<repo>/…`).
   * Session storage continues to use server-side paths.
   */
  hostProjectsRoot?: string;
  /**
   * Host-side bind source for a legacy separate worktree multi-root mount.
   * Unused when worktrees are nested under the projects root.
   */
  hostWorktreeRoot?: string;
  /**
   * Resolved prefix map for agent-facing path presentation. Built at config
   * load from server roots + host bind sources; undefined when presentation
   * is identity (stdio / same path namespace).
   */
  pathPresentation?: PathPresentationMap;
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
  /**
   * Fraction of a worker's declared `context_tokens` a whole BATCH of activities
   * may accumulate in delivered content before the server refuses the next one.
   * Its own setting, because it answers a different question from
   * `bundleHeadroomFraction`: that one asks how much of a window one activity may
   * spend on inlined step techniques, and at 0.80 the arithmetic admits thirteen of
   * the main workflow's fifteen activities into a single context. Default 0.35
   * (see DEFAULT_BATCH_HEADROOM_FRACTION). Env override:
   * `BATCH_HEADROOM_FRACTION`, clamped to [0, 1].
   */
  batchHeadroomFraction?: number;
  /**
   * Distinct activities one worker context may take delivery of. Backs the
   * character budget, which is blind to the context establishment the server never
   * delivers, the code a worker reads, the artifacts it drafts, and degradation
   * across a long walk. Default 3 (see DEFAULT_BATCH_MAX_ACTIVITIES); 1 is
   * batching switched off, one activity to a worker. Env override:
   * `BATCH_MAX_ACTIVITIES`, clamped to [1, 100].
   */
  batchMaxActivities?: number;
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

/**
 * Batch bound policy (#407). One dispatched worker context walks a run of
 * activities, and the run is bounded twice: by cumulative delivered characters,
 * `context_tokens × batchHeadroomFraction × charsPerToken`, and by a hard cap on
 * distinct activities.
 *
 * WHICH LIMIT BINDS DEPENDS ON THE WORKFLOW, and both cases are wanted.
 *
 * The two rest on different evidence. `npm run bench:batch` measures activity
 * payloads only — it never fetches a technique or a resource lazily — so its
 * 155,060 characters for the three-activity analysis run is the EAGER floor, not
 * what a batch really accumulates. Read off 112 worker contexts in the sealed
 * session records, one activity costs a median 74,109 characters once its lazy
 * fetches are counted, with a 90th percentile of 182,642 and a maximum of 261,827.
 * The lazy half is usually the larger one.
 *
 * So at a 200,000-token window, giving a 280,000-character budget:
 *
 * - On the main workflow, whose activities are heavy, the BUDGET binds first — two
 *   real runs reach it after two activities. That is the mechanism working: three
 *   heavy activities would put over half the declared window into workflow content
 *   before a line of code is read.
 * - On the setup sequence, whose activities cost 33,000 to 154,000, the CAP binds
 *   first. That sequence is batching's first user, and a character budget alone
 *   would admit more of it than a context should hold.
 * - A worker declaring a smaller window is bounded proportionally: the budget
 *   binds before the cap for anything under roughly 95,000 declared tokens.
 *
 * Admission is checked BEFORE a delivery rather than after, so the activity that
 * is admitted can carry a batch past the budget — by up to one heavy activity,
 * 261,827 characters on measured content. Refusing after composing would pay the
 * composition and still not un-deliver it.
 *
 * The bundling fraction of 0.80 would admit thirteen of fifteen activities into
 * one context. Both values are revised from `batch_refused` counts and
 * per-activity usage rows over real runs, where the context establishment a byte
 * count cannot see is finally visible.
 */
export const DEFAULT_BATCH_HEADROOM_FRACTION = 0.35;
export const DEFAULT_BATCH_MAX_ACTIVITIES = 3;

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
 * Read a numeric env var into `[min, max]`, falling back to `fallback` when unset, blank, or not a
 * finite number, and clamping anything outside the range to the nearest end.
 *
 * Clamping rather than falling back, because for a bound the two answers differ in the dangerous
 * direction: an operator writing `BATCH_MAX_ACTIVITIES=0` means "no batching", and a plain
 * positive-only reader rejects that as invalid and hands back the DEFAULT of three — the loosest
 * setting, the opposite of what was asked for, silently. Clamped, zero becomes the minimum of one
 * activity to a worker, which is batching switched off.
 */
function envNumberInRange(key: string, fallback: number, min: number, max: number): number {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
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
  /** Directory basename of the checkout (`owner/repo` → `repo`). */
  checkoutName: string;
  installDir: string;
  /**
   * App main/default-branch checkout:
   * `$INSTALL/projects/<repo>` (basename; default co-located projects root).
   * Operators should prefer an external `HOST_PROJECTS_ROOT/<repo>` instead.
   */
  projectsDir: string;
  /** Planning engineering root: `<checkout>/.engineering`. */
  engineeringDir: string;
  /**
   * Feature worktree parent: `<checkout>/.worktrees`.
   * (Legacy `$INSTALL/worktrees/<owner>/<repo>` is not used for new paths.)
   */
  workspaceDir: string;
}

/**
 * Legacy directory name for a separate feature-worktree multi-root under the
 * install root. Deprecated — prefer nested `<checkout>/.worktrees/`.
 */
export const INSTALL_WORKTREES_DIR = 'worktrees';
/**
 * Default co-located projects multi-root under the install root
 * (`$INSTALL/projects`). Prefer an external `HOST_PROJECTS_ROOT` when set.
 */
export const INSTALL_PROJECTS_DIR = 'projects';
/** Nested feature-worktree directory name inside each checkout. */
export const CHECKOUT_WORKTREES_DIR = '.worktrees';

/**
 * Checkout directory basename for a normalised `owner/repo` (or bare name).
 * Canonical on-disk layout is basename-only under the projects multi-root.
 */
export function repoCheckoutBasename(repo: string): string {
  const trimmed = repo.trim().replace(/\/+$/, '');
  const name = basename(trimmed);
  if (!name || name === '.' || name === '..') {
    throw new WorkspaceConfigError(`Invalid repo '${repo}': empty basename`);
  }
  return name;
}

/**
 * Derive the canonical per-repo paths under the install-co-located projects root:
 *   $INSTALL/projects/<repo>                 # main checkout (basename)
 *   $INSTALL/projects/<repo>/.engineering    # planning (submodule)
 *   $INSTALL/projects/<repo>/.worktrees      # feature worktree parent
 *
 * Prefer binding `HOST_PROJECTS_ROOT` externally; this helper only knows the
 * install-relative default used by `--repo` / stdio pin without a host root.
 */
export function resolveRepoPaths(
  repoRaw: string,
  installDir: string,
): RepoPaths {
  const repo = normalizeRepoPath(repoRaw);
  const root = resolve(installDir);
  const checkoutName = repoCheckoutBasename(repo);
  const projectsDir = resolve(root, INSTALL_PROJECTS_DIR, checkoutName);
  return {
    repo,
    checkoutName,
    installDir: root,
    projectsDir,
    engineeringDir: resolve(projectsDir, '.engineering'),
    workspaceDir: resolve(projectsDir, CHECKOUT_WORKTREES_DIR),
  };
}

/**
 * True when `workspaceDir` is a worktree multi-root bind target:
 * - nested model: `$INSTALL/projects` (same as projects multi-root), or
 * - legacy: `$INSTALL/worktrees`.
 */
export function isWorktreeMultiRoot(workspaceDir: string, installDir: string): boolean {
  const ws = resolve(workspaceDir);
  const root = resolve(installDir);
  return (
    ws === resolve(root, INSTALL_PROJECTS_DIR) ||
    ws === resolve(root, INSTALL_WORKTREES_DIR)
  );
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
 * Resolve feature-worktree + engineering roots.
 *
 * Precedence:
 *   1. `--workspace` / `WORKFLOW_WORKSPACE` / `WORKTREE_ROOT` (explicit path).
 *      Docker start.sh binds the projects multi-root (`HOST_PROJECTS_ROOT` →
 *      container projects) covering checkouts, `.engineering`, and nested
 *      `.worktrees`. Repo is chosen at `start_session` time, not process start.
 *   2. Optional `--repo` / `WORKFLOW_SERVER_REPO` pins a single owner/repo under
 *      `$INSTALL/projects/<repo>` (stdio single-tenant). Prefer session-time
 *      `repo` when serving multiple checkouts from one process.
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
    // Optional process pin: only when workspace is NOT a multi-root bind
    // (or is already the per-repo nested .worktrees path). Multi-root Docker
    // keeps multi-root so start_session can select owner/repo dynamically.
    const isMultiRootWorkspace = isWorktreeMultiRoot(workspaceDir, installDir);
    if (repoRaw && !isMultiRootWorkspace) {
      const paths = resolveRepoPaths(repoRaw, installDir);
      // Explicit workspace that already is the per-repo nested worktrees path,
      // or a legacy separate $INSTALL/worktrees/<owner>/<repo> pin.
      const legacyWorkspace = resolve(
        installDir,
        INSTALL_WORKTREES_DIR,
        paths.repo,
      );
      const legacyBasenameWorkspace = resolve(
        installDir,
        INSTALL_WORKTREES_DIR,
        paths.checkoutName,
      );
      if (
        workspaceDir === paths.workspaceDir ||
        workspaceDir === legacyWorkspace ||
        workspaceDir === legacyBasenameWorkspace
      ) {
        return {
          workspaceDir,
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
 * `WORKFLOW_SERVER_REPO`. Repo mode derives (basename checkout):
 *   workspaceDir    = $INSTALL/projects/<repo>/.worktrees
 *   engineeringDir  = $INSTALL/projects/<repo>/.engineering
 */
/**
 * Host bind sources for agent-facing path presentation (Docker).
 * Prefer `HOST_PROJECTS_ROOT` / `HOST_WORKTREE_ROOT` (start.sh); accept the
 * underscored aliases some compose files use.
 */
function resolveHostPathPresentation(
  env: NodeJS.ProcessEnv = process.env,
): { hostProjectsRoot?: string; hostWorktreeRoot?: string } {
  const hostProjects =
    env['HOST_PROJECTS_ROOT']?.trim() ||
    env['HOST_PROJECTS_DIR']?.trim() ||
    undefined;
  const hostWorktree =
    env['HOST_WORKTREE_ROOT']?.trim() ||
    env['HOST_WORKTREE_DIR']?.trim() ||
    undefined;
  const out: { hostProjectsRoot?: string; hostWorktreeRoot?: string } = {};
  if (hostProjects) out.hostProjectsRoot = resolve(hostProjects);
  if (hostWorktree) out.hostWorktreeRoot = resolve(hostWorktree);
  return out;
}

export function loadConfig(argv: readonly string[] = process.argv.slice(2)): ServerConfig {
  const roots = resolveRoots(argv);
  const planningRelativeDir = resolvePlanningRelativeDir(
    process.env,
    roots.planningFallback,
  );
  // Pin the active planning relative dir at config load so planningRoot()
  // callers see the configured slug without a second argument.
  setPlanningRelativeDir(planningRelativeDir);
  const hostPaths = resolveHostPathPresentation(process.env);
  // Server-side projects root for the map: engineering multi-root when set,
  // else workspace (single-root / nested bind).
  const serverProjectsRoot = roots.engineeringDir;
  const pathPresentation = buildPathPresentationMap({
    serverProjectsRoot,
    hostProjectsRoot: hostPaths.hostProjectsRoot,
    serverWorktreeRoot: roots.workspaceDir,
    hostWorktreeRoot: hostPaths.hostWorktreeRoot ?? hostPaths.hostProjectsRoot,
  });
  return {
    workflowDir: resolveWorkflowDir(argv),
    schemasDir: resolve(PROJECT_ROOT, envOrDefault('SCHEMAS_DIR', './schemas')),
    workspaceDir: roots.workspaceDir,
    engineeringDir: roots.engineeringDir,
    ...(roots.repo !== undefined ? { repo: roots.repo } : {}),
    ...(roots.installDir !== undefined ? { installDir: roots.installDir } : {}),
    planningRelativeDir,
    ...(hostPaths.hostProjectsRoot !== undefined
      ? { hostProjectsRoot: hostPaths.hostProjectsRoot }
      : {}),
    ...(hostPaths.hostWorktreeRoot !== undefined
      ? { hostWorktreeRoot: hostPaths.hostWorktreeRoot }
      : {}),
    ...(pathPresentation !== undefined ? { pathPresentation } : {}),
    serverName: envOrDefault('SERVER_NAME', 'workflow-server'),
    serverVersion: envOrDefault('SERVER_VERSION', '2.1.0'),
    bundleHeadroomFraction: envNumberOrDefault('BUNDLE_HEADROOM_FRACTION', DEFAULT_BUNDLE_HEADROOM_FRACTION),
    bundleCharsPerToken: envNumberOrDefault('BUNDLE_CHARS_PER_TOKEN', DEFAULT_BUNDLE_CHARS_PER_TOKEN),
    // Clamped rather than validated: a batch bound set out of range should land at the nearest end,
    // never fall back to a default looser than what was asked for. A fraction above 1 would budget a
    // batch more than the window it is measured against; 1 activity is batching switched off.
    batchHeadroomFraction: envNumberInRange('BATCH_HEADROOM_FRACTION', DEFAULT_BATCH_HEADROOM_FRACTION, 0, 1),
    batchMaxActivities: envNumberInRange('BATCH_MAX_ACTIVITIES', DEFAULT_BATCH_MAX_ACTIVITIES, 1, 100),
    transport: resolveTransport(argv),
    port: resolvePort(argv),
    host: resolveHost(argv),
  };
}
