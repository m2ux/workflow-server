import { readdir } from 'node:fs/promises';
import { basename, dirname, isAbsolute, resolve, sep } from 'node:path';
import {
  INSTALL_ENGINEERING_DIR_LEGACY,
  INSTALL_SOURCE_DIR,
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
 * - **multi**: install multi-root (`$INSTALL/source` or legacy
 *   `$INSTALL/engineering`). Sessions live under each repo's eng checkout
 *   `…/artifacts/planning/`. The agent supplies `repo` (or a path that embeds
 *   it) at `start_session`.
 */
export interface SessionScope {
  mode: 'single' | 'multi';
  /**
   * Multi-root base when mode is multi:
   * `$INSTALL/source` (canonical) or `$INSTALL/engineering` (legacy).
   */
  engineeringMultiRoot?: string;
  /**
   * Layout under the multi-root:
   * - `source`: eng at `<multi>/<owner>/<repo>/.engineering`
   * - `legacy`: eng at `<multi>/<owner>/<repo>`
   */
  multiRootLayout?: 'source' | 'legacy';
  /** Single engineering checkout when mode is single. */
  engineeringDir: string;
  installDir?: string;
  /**
   * Planning relative dir for the active write root.
   * Multi-root always uses `artifacts/planning` under each eng checkout.
   */
  planningRelativeDir: string;
}

/**
 * Detect install multi-root engineering binding (Docker start.sh default).
 * Canonical: engineeringDir is exactly `$INSTALL/source`.
 * Legacy: engineeringDir is exactly `$INSTALL/engineering`.
 */
export function isEngineeringMultiRoot(
  engineeringDir: string,
  installDir?: string,
): boolean {
  const eng = resolve(engineeringDir);
  if (installDir) {
    const root = resolve(installDir);
    return (
      eng === resolve(root, INSTALL_SOURCE_DIR) ||
      eng === resolve(root, INSTALL_ENGINEERING_DIR_LEGACY)
    );
  }
  const base = basename(eng);
  return base === INSTALL_SOURCE_DIR || base === INSTALL_ENGINEERING_DIR_LEGACY;
}

function multiRootLayoutFor(
  engineeringDir: string,
  installDir?: string,
): 'source' | 'legacy' {
  const eng = resolve(engineeringDir);
  if (installDir) {
    if (eng === resolve(installDir, INSTALL_ENGINEERING_DIR_LEGACY)) return 'legacy';
    return 'source';
  }
  return basename(eng) === INSTALL_ENGINEERING_DIR_LEGACY ? 'legacy' : 'source';
}

/** Absolute eng checkout for owner/repo under a multi-root base. */
export function resolveMultiRootEngineeringDir(
  multiRoot: string,
  repo: string,
  layout: 'source' | 'legacy' = 'source',
): string {
  const base = resolve(multiRoot, repo);
  return layout === 'legacy' ? base : resolve(base, '.engineering');
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
    const multiRootLayout = multiRootLayoutFor(engineeringDir, installDir);
    return {
      mode: 'multi',
      engineeringMultiRoot: engineeringDir,
      multiRootLayout,
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
 * If `planning_folder` sits under the multi-root as
 * `…/source/<owner>/<repo>/.engineering/…` or legacy
 * `…/engineering/<owner>/<repo>/…`, return `owner/repo`.
 */
export function extractRepoFromPath(
  planningFolder: string,
  engineeringMultiRoot: string,
  layout: 'source' | 'legacy' = 'source',
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
  // Canonical source layout: …/source/o/r/.engineering/…
  if (layout === 'source' && parts.length >= 3 && parts[2] !== '.engineering') {
    // Still accept owner/repo when path continues with other segments after .engineering
  }
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
    repoRaw = extractRepoFromPath(
      opts.planningFolder,
      scope.engineeringMultiRoot,
      scope.multiRootLayout ?? 'source',
    );
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
        engineeringDir: resolveMultiRootEngineeringDir(
          scope.engineeringMultiRoot,
          repo,
          scope.multiRootLayout ?? 'source',
        ),
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
        '($INSTALL/source). Pass repo: "owner/repo" (from the user or workspace AGENTS.md), ' +
        'or an absolute planning_folder under source/<owner>/<repo>/.engineering/….',
    );
  }

  return {
    engineeringDir: scope.engineeringDir,
    planningRelativeDir: scope.planningRelativeDir,
  };
}

/**
 * List engineering checkouts to search for session_index / slug.
 * Multi-root source: every `source/<o>/<r>/.engineering`.
 * Multi-root legacy: every `engineering/<o>/<r>`.
 * Single: just the process engineering dir.
 */
export async function listSessionSearchRoots(scope: SessionScope): Promise<string[]> {
  if (scope.mode !== 'multi' || !scope.engineeringMultiRoot) {
    return [scope.engineeringDir];
  }
  const multi = scope.engineeringMultiRoot;
  const layout = scope.multiRootLayout ?? 'source';
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
      const repoBase = resolve(ownerPath, repoEnt.name);
      roots.push(
        layout === 'legacy' ? repoBase : resolve(repoBase, '.engineering'),
      );
    }
  }
  return roots;
}
