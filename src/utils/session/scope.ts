import { readdir, stat } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import {
  INSTALL_PROJECTS_DIR,
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
 * - **single**: one engineering checkout (or process pinned with `--repo`).
 *   All sessions live under that checkout's planning root.
 * - **multi**: projects multi-root (`HOST_PROJECTS_ROOT` / container projects
 *   bind). Canonical checkouts are **basename only**:
 *   `…/<repo>/.engineering/artifacts/planning/<slug>/`.
 *   Legacy install co-location used `…/<owner>/<repo>/.engineering/…` and is
 *   still scanned on resume only. The agent supplies `repo: "owner/repo"`
 *   (or a path that embeds the checkout) at `start_session`.
 */
export interface SessionScope {
  mode: 'single' | 'multi';
  /**
   * Multi-root base when mode is multi: host `HOST_PROJECTS_ROOT` (or the
   * container mount target for that bind, e.g. `/var/lib/workflow-server/projects`).
   */
  engineeringMultiRoot?: string;
  /** Single engineering checkout when mode is single. */
  engineeringDir: string;
  installDir?: string;
  /**
   * Planning relative dir for the active write root.
   * Multi-root always uses `artifacts/planning` under each eng checkout
   * (`<checkout>/.engineering` is the eng root).
   */
  planningRelativeDir: string;
}

/**
 * Detect projects multi-root engineering binding (Docker start.sh default).
 * True when engineeringDir is exactly `$INSTALL/projects`, or when its
 * basename is `projects` (container mount of an external HOST_PROJECTS_ROOT).
 *
 * External roots (e.g. `~/projects/dev`) mounted at the container projects
 * path still report basename `projects` inside the container; on the host
 * stdio path, multi-root is detected when ENGINEERING_DIR equals the
 * configured projects multi-root (basename `projects` or explicit install
 * co-location).
 */
export function isEngineeringMultiRoot(
  engineeringDir: string,
  installDir?: string,
): boolean {
  const eng = resolve(engineeringDir);
  if (installDir) {
    if (eng === resolve(installDir, INSTALL_PROJECTS_DIR)) return true;
  }
  // Container / install co-location: directory named `projects`.
  if (basename(eng) === INSTALL_PROJECTS_DIR) return true;
  return false;
}

/** Repo directory basename under the projects multi-root (`owner/repo` → `repo`). */
export function repoCheckoutBasename(repo: string): string {
  const normalized = repo.includes('/') ? normalizeRepoPath(repo) : repo.trim();
  const parts = normalized.split('/').filter(Boolean);
  const name = parts[parts.length - 1];
  if (!name) {
    throw new Error(`Invalid repo '${repo}': empty basename`);
  }
  return name;
}

/**
 * Absolute eng checkout for a repo under a projects multi-root.
 * Canonical: `$ROOT/<repo-basename>/.engineering` (not owner/repo).
 */
export function resolveMultiRootEngineeringDir(
  multiRoot: string,
  repo: string,
): string {
  return resolve(multiRoot, repoCheckoutBasename(repo), '.engineering');
}

/** Build the process session scope from server config. */
export function buildSessionScope(config: ServerConfig): SessionScope {
  const engineeringDir = resolve(config.engineeringDir ?? config.workspaceDir);
  const installDir = config.installDir ? resolve(config.installDir) : undefined;
  const multi =
    isEngineeringMultiRoot(engineeringDir, installDir) &&
    // Process-level --repo already narrowed engineeringDir to a single checkout.
    !config.repo;

  if (multi) {
    return {
      mode: 'multi',
      engineeringMultiRoot: engineeringDir,
      engineeringDir,
      installDir: installDir ?? dirname(engineeringDir),
      // Eng root is `<checkout>/.engineering` → planning at artifacts/planning.
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
 * If `planning_folder` sits under the multi-root, recover a repo hint:
 *   - Canonical basename: `…/<repo>/.engineering/…` → returns `repo` (basename
 *     only; caller should still pass `owner/repo` when known).
 *   - Legacy: `…/<owner>/<repo>/.engineering/…` → returns `owner/repo`.
 *
 * Basename-only results are not valid `normalizeRepoPath` input; callers that
 * need `owner/repo` must combine with an explicit `repo` argument.
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

  // …/<repo>/.engineering/…
  if (parts[1] === '.engineering') {
    return parts[0];
  }
  // Legacy …/<owner>/<repo>/.engineering/…
  if (parts.length >= 3 && parts[2] === '.engineering') {
    const candidate = `${parts[0]}/${parts[1]}`;
    try {
      return normalizeRepoPath(candidate);
    } catch {
      return undefined;
    }
  }
  // Legacy without requiring .engineering in path (older extract behaviour).
  if (parts.length >= 2) {
    const candidate = `${parts[0]}/${parts[1]}`;
    try {
      return normalizeRepoPath(candidate);
    } catch {
      return undefined;
    }
  }
  return undefined;
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
 * Multi-root create/resume-by-new-slug requires a full `owner/repo` (via 1).
 * A basename-only path hint is not enough to bind session.repo.
 */
export function resolveSessionRoot(
  scope: SessionScope,
  opts: { repo?: string | undefined; planningFolder?: string | undefined } = {},
): ResolvedSessionRoot {
  let repoRaw = opts.repo?.trim() || undefined;
  if (!repoRaw && opts.planningFolder && scope.engineeringMultiRoot) {
    const embedded = extractRepoFromPath(
      opts.planningFolder,
      scope.engineeringMultiRoot,
    );
    // Only accept embedded hints that normalize to owner/repo (legacy path).
    // Basename-only path segments are not a substitute for session.repo.
    if (embedded && embedded.includes('/')) {
      repoRaw = embedded;
    }
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
        ),
        planningRelativeDir: REPO_PLANNING_RELATIVE_DIR,
        repo,
      };
    }
    if (installDir) {
      // Process-pinned --repo under install root (legacy single-tenant).
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
      'start_session: repo is required when the server is bound to a projects multi-root ' +
        '(HOST_PROJECTS_ROOT). Pass repo: "owner/repo" (from the user or workspace AGENTS.md). ' +
        'Planning lives at <repo>/.engineering/artifacts/planning/ under that root.',
    );
  }

  return {
    engineeringDir: scope.engineeringDir,
    planningRelativeDir: scope.planningRelativeDir,
  };
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const st = await stat(path);
    return st.isDirectory();
  } catch {
    return false;
  }
}

/**
 * List engineering checkouts to search for session_index / slug.
 *
 * Multi-root (canonical): every `$ROOT/<repo>/.engineering`.
 * Multi-root (legacy resume): also `$ROOT/<owner>/<repo>/.engineering`.
 * Single: just the process engineering dir.
 */
export async function listSessionSearchRoots(scope: SessionScope): Promise<string[]> {
  if (scope.mode !== 'multi' || !scope.engineeringMultiRoot) {
    return [scope.engineeringDir];
  }
  const multi = scope.engineeringMultiRoot;
  const roots = new Set<string>();
  let topEntries: Array<{ name: string; isDirectory: () => boolean }>;
  try {
    topEntries = await readdir(multi, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const ent of topEntries) {
    if (!ent.isDirectory() || ent.name.startsWith('.')) continue;
    const topPath = resolve(multi, ent.name);

    // Canonical basename checkout: $ROOT/<repo>/.engineering
    const basenameEng = join(topPath, '.engineering');
    if (await isDirectory(basenameEng)) {
      roots.add(resolve(basenameEng));
    }

    // Legacy install co-location: $ROOT/<owner>/<repo>/.engineering
    let nested: typeof topEntries;
    try {
      nested = await readdir(topPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const repoEnt of nested) {
      if (!repoEnt.isDirectory() || repoEnt.name.startsWith('.')) continue;
      if (repoEnt.name === '.engineering' || repoEnt.name === '.worktrees') continue;
      const legacyEng = resolve(topPath, repoEnt.name, '.engineering');
      if (await isDirectory(legacyEng)) {
        roots.add(legacyEng);
      }
    }
  }
  return [...roots];
}
