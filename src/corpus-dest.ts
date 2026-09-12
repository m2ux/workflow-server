/**
 * Where a checkout of this repo finds its corpus.
 *
 * The `workflows` branch occupies one worktree, named for the branch, at
 * `.worktrees/workflows` of the primary checkout (`git rev-parse --git-common-dir`).
 * Feature engine worktrees read that dest; they do not add a second worktree of
 * the same branch. An explicit `WORKFLOWS_DIR` / `--root` / `--workflow-dir` wins.
 *
 * Install and Docker place a clone at `HOST_WORKFLOWS_DIR` and never use this path.
 */
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, resolve } from 'node:path';

export const REFERENCE_CORPUS_REL = join('.worktrees', 'workflows');
export const REFERENCE_CORPUS_ADD = 'git worktree add .worktrees/workflows workflows';

/** The primary checkout that owns `.git`, or null when `fromDir` is not a git work tree. */
export function primaryCheckoutRoot(fromDir: string): string | null {
  const common = spawnSync('git', ['-C', fromDir, 'rev-parse', '--git-common-dir'], {
    encoding: 'utf-8',
  });
  if (common.status !== 0) return null;
  const raw = common.stdout.trim();
  if (!raw) return null;
  const abs = isAbsolute(raw) ? raw : resolve(fromDir, raw);
  return dirname(abs);
}

/** `.worktrees/workflows` of the primary checkout, or of `fromDir` when git is absent. */
export function defaultCorpusDest(fromDir: string): string {
  const primary = primaryCheckoutRoot(fromDir);
  return join(primary ?? resolve(fromDir), REFERENCE_CORPUS_REL);
}

/** True when `fromDir` is the primary worktree (the one that can add the reference dest). */
export function isPrimaryCheckout(fromDir: string): boolean {
  const primary = primaryCheckoutRoot(fromDir);
  if (!primary) return false;
  const top = spawnSync('git', ['-C', fromDir, 'rev-parse', '--show-toplevel'], {
    encoding: 'utf-8',
  });
  if (top.status !== 0) return false;
  return resolve(top.stdout.trim()) === resolve(primary);
}
