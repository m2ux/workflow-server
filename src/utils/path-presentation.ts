import { resolve, sep } from 'node:path';
import { isPathInsideRoot } from '../worktree-validator.js';

/**
 * Optional prefix map from paths the server process sees (container or local)
 * to paths the host-side agent should use for filesystem tools.
 *
 * Under Docker, the server binds `$HOST_PROJECTS_ROOT` → a container projects
 * root (default `/var/lib/workflow-server/projects`). Session storage uses
 * server-side paths; `planning_folder_path` in tool responses is rewritten to
 * the host bind so agents can open/write artifacts in their IDE workspace.
 *
 * The rewrite replaces the root prefix and keeps every segment below it, so a
 * presented path and the path it came from name the same folder at any depth,
 * and `receivePathFromAgent` inverts it exactly.
 *
 * When no map is configured (stdio / same-namespace), presentation is identity.
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
}

function normalizeRoot(root: string): string {
  return resolve(root);
}

/** True when `path` is `root` or a path strictly under `root`. */
export function isPathUnderRoot(path: string, root: string): boolean {
  return isPathInsideRoot(normalizeRoot(root), resolve(path));
}

function rewriteUnderRoot(
  resolvedPath: string,
  serverRoot: string,
  hostRoot: string,
): string | undefined {
  if (!isPathUnderRoot(resolvedPath, serverRoot)) return undefined;
  const rest = resolvedPath.slice(serverRoot.length);
  return rest === '' ? hostRoot : resolve(hostRoot + rest);
}

/**
 * Rewrite a server-absolute path to the agent-facing host path using the
 * configured mount map. Unmatched paths (and missing maps) are returned as
 * resolved server paths.
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
    const rewritten = rewriteUnderRoot(resolved, server, host);
    if (rewritten !== undefined) return rewritten;
  }
  return resolved;
}

/**
 * Rewrite an agent-facing host path onto the server tree using the same
 * mount map `presentPathToAgent` uses the other way. Unmatched paths (and
 * missing maps) are returned as resolved agent paths.
 *
 * When both projects and worktree maps could match, the longer (more specific)
 * host root wins.
 */
export function receivePathFromAgent(
  agentPath: string | undefined | null,
  map: PathPresentationMap | undefined,
): string | undefined {
  if (agentPath === undefined || agentPath === null || agentPath === '') {
    return undefined;
  }
  const resolved = resolve(agentPath);
  if (!map) return resolved;

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
  candidates.sort((a, b) => b.host.length - a.host.length);
  for (const { server, host } of candidates) {
    if (!isPathUnderRoot(resolved, host)) continue;
    const rest = resolved.slice(host.length);
    return rest === '' ? server : resolve(server + rest);
  }
  return resolved;
}

/**
 * Build a presentation map from server roots + optional host bind sources.
 * Returns undefined when no host root is set, or when host and server share one
 * path namespace, where presentation is identity.
 */
export function buildPathPresentationMap(opts: {
  serverProjectsRoot: string;
  hostProjectsRoot?: string | undefined;
  serverWorktreeRoot?: string | undefined;
  hostWorktreeRoot?: string | undefined;
}): PathPresentationMap | undefined {
  const hostProjects = opts.hostProjectsRoot?.trim();
  if (!hostProjects) return undefined;

  const serverProjects = normalizeRoot(opts.serverProjectsRoot);
  const hostProjectsNorm = normalizeRoot(hostProjects);

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

  if (sameProjects && sameWorktree) return undefined;

  const map: PathPresentationMap = {
    serverProjectsRoot: serverProjects,
    hostProjectsRoot: hostProjectsNorm,
  };
  if (serverWt && hostWt && serverWt !== serverProjects) {
    map.serverWorktreeRoot = serverWt;
    map.hostWorktreeRoot = hostWt;
  }
  return map;
}
