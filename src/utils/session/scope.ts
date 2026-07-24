import { readdir } from 'node:fs/promises';
import { basename, dirname, isAbsolute, resolve, sep } from 'node:path';
import {
  normalizeRepoPath,
  REPO_PLANNING_RELATIVE_DIR,
  resolveRepoPaths,
  type ServerConfig,
  WorkspaceConfigError,
} from '../../config.js';
import { PLANNING_RELATIVE_DIR } from './store.js';

/**
 * How the process is bound for session storage.
 *
 * - **single**: one engineering checkout (legacy workspace, or process pinned
 *   with `--repo`). All sessions live under that checkout's planning root.
 * - **multi**: install multi-root (`$INSTALL/engineering`). Sessions live under
 *   `$INSTALL/engineering/<owner>/<repo>/artifacts/planning/`. The agent
 *   supplies `repo` (or a path that embeds it) at `start_session`.
 */
export interface SessionScope {
  mode: 'single' | 'multi';
  /** Engineering multi-root when mode is multi (`$INSTALL/engineering`). */
  engineeringMultiRoot?: string;
  /** Single engineering checkout when mode is single. */
  engineeringDir: string;
  installDir?: string;
  /**
   * Planning relative dir for the active write root.
   * Multi-root always uses `artifacts/planning` under each owner/repo checkout.
   */
  planningRelativeDir: string;
}

/**
 * Detect install multi-root engineering binding (Docker start.sh default).
 * True when engineeringDir is exactly `$INSTALL/engineering`.
 */
export function isEngineeringMultiRoot(
  engineeringDir: string,
  installDir?: string,
): boolean {
  const eng = resolve(engineeringDir);
  if (installDir) {
    return eng === resolve(installDir, 'engineering');
  }
  // Heuristic when installDir was not recorded: path ends with /engineering
  // and is not equal to the workspace (split-root multi).
  return basename(eng) === 'engineering';
}

/** Build the process session scope from server config. */
export function buildSessionScope(config: ServerConfig): SessionScope {
  const engineeringDir = resolve(config.engineeringDir ?? config.workspaceDir);
  const installDir = config.installDir ? resolve(config.installDir) : undefined;
  const multi =
    isEngineeringMultiRoot(engineeringDir, installDir) &&
    // Process-level --repo already narrowed engineeringDir to owner/repo.
    !config.repo;

  if (multi) {
    return {
      mode: 'multi',
      engineeringMultiRoot: engineeringDir,
      engineeringDir,
      installDir: installDir ?? dirname(engineeringDir),
      planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
    };
  }

  return {
    mode: 'single',
    engineeringDir,
    ...(installDir !== undefined ? { installDir } : {}),
    planningRelativeDir:
      config.planningRelativeDir?.trim() ||
      (config.engineeringDir && config.engineeringDir !== config.workspaceDir
        ? REPO_PLANNING_RELATIVE_DIR
        : PLANNING_RELATIVE_DIR),
  };
}

/**
 * If `planning_folder` sits under the engineering multi-root as
 * `…/engineering/<owner>/<repo>/…`, return `owner/repo`.
 */
export function extractRepoFromPath(
  planningFolder: string,
  engineeringMultiRoot: string,
): string | undefined {
  if (!isAbsolute(planningFolder)) return undefined;
  const folder = resolve(planningFolder);
  const multi = resolve(engineeringMultiRoot);
  const prefix = multi.endsWith(sep) ? multi : multi + sep;
  if (folder !== multi && !folder.startsWith(prefix)) return undefined;
  const rest = folder.slice(prefix.length);
  const parts = rest.split(sep).filter(Boolean);
  if (parts.length < 2) return undefined;
  const candidate = `${parts[0]}/${parts[1]}`;
  try {
    return normalizeRepoPath(candidate);
  } catch {
    return undefined;
  }
}

export interface ResolvedSessionRoot {
  /** Absolute engineering checkout used for planning. */
  engineeringDir: string;
  planningRelativeDir: string;
  repo?: string;
}

/**
 * Resolve the engineering checkout for a new or resumed session.
 *
 * Precedence for repo:
 *   1. Explicit `repo` argument (owner/repo or github URL)
 *   2. Repo embedded in an absolute `planning_folder` under the multi-root
 *   3. Process default (single mode only)
 *
 * Multi-root create/resume-by-new-slug requires a repo (via 1 or 2).
 */
export function resolveSessionRoot(
  scope: SessionScope,
  opts: { repo?: string | undefined; planningFolder?: string | undefined } = {},
): ResolvedSessionRoot {
  let repoRaw = opts.repo?.trim() || undefined;
  if (!repoRaw && opts.planningFolder && scope.engineeringMultiRoot) {
    repoRaw = extractRepoFromPath(opts.planningFolder, scope.engineeringMultiRoot);
  }

  if (repoRaw) {
    let repo: string;
    try {
      repo = normalizeRepoPath(repoRaw);
    } catch (err) {
      const msg = err instanceof WorkspaceConfigError ? err.message : String(err);
      throw new Error(
        `start_session: invalid repo '${repoRaw}'. ${msg.replace(/^Invalid --repo value/, 'Expected owner/repo')}`,
      );
    }
    const installDir = scope.installDir;
    if (scope.mode === 'multi' && scope.engineeringMultiRoot) {
      return {
        engineeringDir: resolve(scope.engineeringMultiRoot, repo),
        planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
        repo,
      };
    }
    if (installDir) {
      const paths = resolveRepoPaths(repo, installDir);
      return {
        engineeringDir: paths.engineeringDir,
        planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
        repo,
      };
    }
    // Single-root without installDir: repo is metadata only; planning stays put.
    return {
      engineeringDir: scope.engineeringDir,
      planningRelativeDir: scope.planningRelativeDir,
      repo,
    };
  }

  if (scope.mode === 'multi') {
    throw new Error(
      'start_session: repo is required when the server is bound to an install multi-root ' +
        '($INSTALL/engineering). Pass repo: "owner/repo" (from the user or workspace AGENTS.md), ' +
        'or an absolute planning_folder under engineering/<owner>/<repo>/….',
    );
  }

  return {
    engineeringDir: scope.engineeringDir,
    planningRelativeDir: scope.planningRelativeDir,
  };
}

/**
 * List engineering checkouts to search for session_index / slug.
 * Multi-root: every `owner/repo` directory under the engineering multi-root
 * (depth 2). Single: just the process engineering dir.
 */
export async function listSessionSearchRoots(scope: SessionScope): Promise<string[]> {
  if (scope.mode !== 'multi' || !scope.engineeringMultiRoot) {
    return [scope.engineeringDir];
  }
  const multi = scope.engineeringMultiRoot;
  const roots: string[] = [];
  let owners: Array<{ name: string; isDirectory: () => boolean }>;
  try {
    owners = await readdir(multi, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const ownerEnt of owners) {
    if (!ownerEnt.isDirectory() || ownerEnt.name.startsWith('.')) continue;
    const ownerPath = resolve(multi, ownerEnt.name);
    let repos: typeof owners;
    try {
      repos = await readdir(ownerPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const repoEnt of repos) {
      if (!repoEnt.isDirectory() || repoEnt.name.startsWith('.')) continue;
      roots.push(resolve(ownerPath, repoEnt.name));
    }
  }
  return roots;
}
