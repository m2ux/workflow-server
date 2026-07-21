import { realpathSync } from 'node:fs';
import { isAbsolute, resolve, sep } from 'node:path';

/**
 * Thrown when a candidate path is not inside the configured worktree /
 * workspace root. Callers surface the message to operators/agents so they can
 * correct the path or initialise `.engineering` under the bound root.
 */
export class PathContainmentError extends Error {
  constructor(
    message: string,
    public readonly root: string,
    public readonly candidate: string,
  ) {
    super(message);
    this.name = 'PathContainmentError';
  }
}

export interface AssertPathInsideRootOptions {
  /**
   * When true (default), resolve existing path segments through symlinks via
   * `realpath` so a link that escapes the root is rejected. Non-existent
   * candidates are checked on their lexical resolved path only.
   */
  realpath?: boolean;
}

/**
 * Return true when `candidate` is exactly `root` or a path under `root`,
 * using a separator-aware prefix check (rejects `/uploads-evil` when root is
 * `/uploads`).
 */
export function isPathInsideRoot(root: string, candidate: string): boolean {
  if (candidate === root) return true;
  const prefix = root.endsWith(sep) ? root : root + sep;
  return candidate.startsWith(prefix);
}

function resolveExistingRealpath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    // Path (or an ancestor) may not exist yet — fall back to lexical resolve.
    return path;
  }
}

/**
 * Assert that `candidate` resolves inside `root`. Both sides are made absolute;
 * when `realpath` is enabled, existing paths are canonicalised so symlink
 * escapes fail closed.
 *
 * Returns the (possibly realpath-resolved) absolute candidate on success.
 */
export function assertPathInsideRoot(
  root: string,
  candidate: string,
  options: AssertPathInsideRootOptions = {},
): string {
  const useRealpath = options.realpath !== false;
  const absoluteRoot = resolve(root);
  const absoluteCandidate = isAbsolute(candidate) ? resolve(candidate) : resolve(absoluteRoot, candidate);

  const checkedRoot = useRealpath ? resolveExistingRealpath(absoluteRoot) : absoluteRoot;
  const checkedCandidate = useRealpath
    ? resolveExistingRealpath(absoluteCandidate)
    : absoluteCandidate;

  if (!isPathInsideRoot(checkedRoot, checkedCandidate)) {
    throw new PathContainmentError(
      `Path '${candidate}' resolves to '${checkedCandidate}', which is outside the configured worktree root '${checkedRoot}'. ` +
        `Provide a path under the worktree root, or create the worktree / initialise .engineering under that root before writing artifacts.`,
      checkedRoot,
      checkedCandidate,
    );
  }

  return checkedCandidate;
}

/**
 * Assert a derived planning-folder path lies inside the configured worktree
 * root. Thin wrapper so write-path callers share the same containment contract.
 */
export function assertPlanningPathInsideRoot(root: string, planningPath: string): string {
  return assertPathInsideRoot(root, planningPath);
}
