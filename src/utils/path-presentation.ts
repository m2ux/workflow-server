import { basename, resolve, sep } from 'node:path';

/**
 * Optional prefix map from paths the server process sees (container or local)
 * to paths the host-side agent should use for filesystem tools.
 *
 * Under Docker, the server binds `$HOST_PROJECTS_ROOT` → a container projects
 * root (default `/var/lib/workflow-server/projects`). Session storage uses
 * server-side paths; `planning_folder_path` in tool responses is rewritten to
 * the host bind so agents can open/write artifacts in their IDE workspace.
 *
 * Canonical host layout (docs/install-projects-worktrees.md):
 *   `$HOST_PROJECTS_ROOT/<repo>/…`  (basename only — not owner/repo)
 *
 * When a server path still uses the deprecated install co-location
 * `…/<owner>/<repo>/…`, presentation collapses to the basename checkout so
 * agents always receive the canonical host path.
 *
 * When no map is configured (stdio / same-namespace), presentation is identity
 * (still applying basename collapse when `collapseOwnerRepo` is true).
 */
export interface PathPresentationMap {
  /** Server-side projects / engineering multi-root prefix. */
  serverProjectsRoot: string;
  /** Host-side bind source for projects (agent-visible HOST_PROJECTS_ROOT). */
  hostProjectsRoot: string;
  /** Server-side worktree multi-root when distinct from projects. */
  serverWorktreeRoot?: string;
  /** Host-side worktree bind source when distinct from projects. */
  hostWorktreeRoot?: string;
  /**
   * When true (default), rewrite `…/<owner>/<repo>/…` under the projects root
   * to `…/<repo>/…` so agent-facing paths match the basename checkout layout.
   */
  collapseOwnerRepo?: boolean;
}

function normalizeRoot(root: string): string {
  return resolve(root);
}

/** True when `path` is `root` or a path strictly under `root`. */
export function isPathUnderRoot(path: string, root: string): boolean {
  const p = resolve(path);
  const r = normalizeRoot(root);
  if (p === r) return true;
  const prefix = r.endsWith(sep) ? r : r + sep;
  return p.startsWith(prefix);
}

/**
 * Collapse deprecated `owner/repo` checkout segments under a projects root to
 * the canonical basename layout: `$ROOT/<repo>/…`.
 *
 * Leaves paths that are already basename (`$ROOT/<repo>/.engineering/…`) alone.
 * Only collapses when the second segment is a normal path component and the
 * third is `.engineering` or `.worktrees` (or the path is exactly
 * `$ROOT/<owner>/<repo>`).
 */
export function collapseOwnerRepoUnderRoot(path: string, root: string): string {
  const resolved = resolve(path);
  const r = normalizeRoot(root);
  if (!isPathUnderRoot(resolved, r)) return resolved;
  const prefix = r.endsWith(sep) ? r : r + sep;
  if (resolved === r) return resolved;
  const rest = resolved.slice(prefix.length);
  const parts = rest.split(sep).filter(Boolean);
  if (parts.length < 2) return resolved;

  const [owner, repo, third] = parts;
  if (!owner || !repo) return resolved;
  // Already basename: first segment is the checkout, second is .engineering/.worktrees
  if (repo === '.engineering' || repo === '.worktrees') return resolved;
  // Collapse only clear checkout shapes.
  const looksLikeCheckout =
    third === undefined ||
    third === '.engineering' ||
    third === '.worktrees' ||
    // Deeper path under owner/repo/...
    parts.length >= 3;
  if (!looksLikeCheckout) return resolved;
  // Require owner and repo to look like path segments (no empty).
  if (owner.startsWith('.') || repo.startsWith('.')) return resolved;
  const collapsed = [repo, ...parts.slice(2)].join(sep);
  return resolve(r, collapsed);
}

function rewriteUnderRoot(
  resolvedPath: string,
  serverRoot: string,
  hostRoot: string,
  collapseOwnerRepo: boolean,
): string | undefined {
  if (!isPathUnderRoot(resolvedPath, serverRoot)) return undefined;
  const rest = resolvedPath.slice(serverRoot.length);
  const hostPath = rest === '' ? hostRoot : resolve(hostRoot + rest);
  return collapseOwnerRepo ? collapseOwnerRepoUnderRoot(hostPath, hostRoot) : hostPath;
}

/**
 * Rewrite a server-absolute path to the agent-facing host path using the
 * configured mount map. Unmatched paths (and missing maps) are returned as
 * resolved server paths (optionally basename-collapsed when the path sits
 * under a known projects root).
 *
 * When both projects and worktree maps could match, the longer (more specific)
 * server root wins.
 */
export function presentPathToAgent(
  serverPath: string | undefined | null,
  map: PathPresentationMap | undefined,
): string | undefined {
  if (serverPath === undefined || serverPath === null || serverPath === '') {
    return undefined;
  }
  const resolved = resolve(serverPath);
  if (!map) return resolved;

  const collapse = map.collapseOwnerRepo !== false;
  const candidates: Array<{ server: string; host: string }> = [
    {
      server: normalizeRoot(map.serverProjectsRoot),
      host: normalizeRoot(map.hostProjectsRoot),
    },
  ];
  if (map.serverWorktreeRoot && map.hostWorktreeRoot) {
    candidates.push({
      server: normalizeRoot(map.serverWorktreeRoot),
      host: normalizeRoot(map.hostWorktreeRoot),
    });
  }
  candidates.sort((a, b) => b.server.length - a.server.length);
  for (const { server, host } of candidates) {
    const rewritten = rewriteUnderRoot(resolved, server, host, collapse);
    if (rewritten !== undefined) return rewritten;
  }
  return resolved;
}

/**
 * Build a presentation map from server roots + optional host bind sources.
 * Returns undefined when no host override is set and no rewrite is needed.
 *
 * Even when host and server share a path namespace, a map is still built when
 * they differ OR when we need agent-facing basename collapse from a server
 * that still holds legacy owner/repo paths under the same root — callers that
 * only need collapse can pass the same path for host and server.
 */
export function buildPathPresentationMap(opts: {
  serverProjectsRoot: string;
  hostProjectsRoot?: string | undefined;
  serverWorktreeRoot?: string | undefined;
  hostWorktreeRoot?: string | undefined;
  /** Default true — agent paths use `$HOST_PROJECTS_ROOT/<repo>/…`. */
  collapseOwnerRepo?: boolean;
}): PathPresentationMap | undefined {
  const hostProjects = opts.hostProjectsRoot?.trim();
  if (!hostProjects) return undefined;

  const serverProjects = normalizeRoot(opts.serverProjectsRoot);
  const hostProjectsNorm = normalizeRoot(hostProjects);
  const collapse = opts.collapseOwnerRepo !== false;

  const serverWt = opts.serverWorktreeRoot
    ? normalizeRoot(opts.serverWorktreeRoot)
    : undefined;
  const hostWtRaw = opts.hostWorktreeRoot?.trim();
  const hostWt = hostWtRaw ? normalizeRoot(hostWtRaw) : undefined;
  const sameProjects = serverProjects === hostProjectsNorm;
  const sameWorktree =
    !serverWt ||
    !hostWt ||
    serverWt === hostWt ||
    (serverWt === serverProjects && hostWt === hostProjectsNorm);

  // Identity + no collapse needed → omit map.
  if (sameProjects && sameWorktree && !collapse) return undefined;

  // Same namespace but collapse still useful for legacy owner/repo server paths.
  if (sameProjects && sameWorktree && collapse) {
    return {
      serverProjectsRoot: serverProjects,
      hostProjectsRoot: hostProjectsNorm,
      collapseOwnerRepo: true,
    };
  }

  const map: PathPresentationMap = {
    serverProjectsRoot: serverProjects,
    hostProjectsRoot: hostProjectsNorm,
    collapseOwnerRepo: collapse,
  };
  if (serverWt && hostWt && serverWt !== serverProjects) {
    map.serverWorktreeRoot = serverWt;
    map.hostWorktreeRoot = hostWt;
  }
  return map;
}

/** @internal test helper — last path segment of a repo id. */
export function checkoutBasenameFromRepo(repo: string): string {
  return basename(repo.replace(/\/+$/, ''));
}
