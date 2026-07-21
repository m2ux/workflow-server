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
 * existing paths are canonicalised via realpath so symlink escapes fail closed.
 *
 * Returns the (possibly realpath-resolved) absolute candidate on success.
 */
export function assertPathInsideRoot(root: string, candidate: string): string {
  // ponytail: always realpath, add options when a caller needs lexical-only checks
  const absoluteRoot = resolve(root);
  const absoluteCandidate = isAbsolute(candidate) ? resolve(candidate) : resolve(absoluteRoot, candidate);

  const checkedRoot = resolveExistingRealpath(absoluteRoot);
  const checkedCandidate = resolveExistingRealpath(absoluteCandidate);

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
