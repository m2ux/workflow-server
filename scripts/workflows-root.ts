/**
 * Resolve the workflows corpus root for the guard scripts.
 *
 * By default the guards validate the repo's own `../workflows` checkout. That is the wrong
 * target when edits live in a dedicated git worktree: the guards would validate the stale
 * main copy, not the change under review (issue #160 follow-up #1). Pass `--root <path>` or
 * `--root=<path>`, or set the `WORKFLOWS_DIR` env var, to point the guards at a worktree's
 * workflows directory instead.
 *
 * Precedence: `--root` flag > `WORKFLOWS_DIR` env var > the built-in default.
 *
 * `resolveWorkflowsRoot` is pure path arithmetic. Guards call `requireWorkflowsRoot`, which also
 * proves the corpus is there: an unreachable or empty root is a measurement failure, not a pass.
 * A guard that walks an absent corpus reports "OK — 0 violations", and green-because-empty reads
 * as coverage the run never had (issue #327 S2). Guards that count what they inspect close the
 * loop with `assertScanned`.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Where a resolved root came from, so a failure names the knob that selected it. */
export type RootOrigin = '--root' | 'WORKFLOWS_DIR' | 'default';

export function resolveWorkflowsRoot(defaultDir: string, argv: string[] = process.argv.slice(2)): string {
  return resolveWorkflowsRootWithOrigin(defaultDir, argv).root;
}

export function resolveWorkflowsRootWithOrigin(
  defaultDir: string,
  argv: string[] = process.argv.slice(2),
): { root: string; origin: RootOrigin } {
  const eq = argv.find((a) => a.startsWith('--root='));
  if (eq) return { root: resolve(eq.slice('--root='.length)), origin: '--root' };
  const flag = argv.indexOf('--root');
  if (flag !== -1 && argv[flag + 1]) return { root: resolve(argv[flag + 1]!), origin: '--root' };
  if (process.env.WORKFLOWS_DIR) return { root: resolve(process.env.WORKFLOWS_DIR), origin: 'WORKFLOWS_DIR' };
  return { root: defaultDir, origin: 'default' };
}

/** A workflow declares itself with a `workflow.yaml`, an `activities/`, or a `techniques/` folder. */
function isWorkflowDir(path: string): boolean {
  return existsSync(join(path, 'workflow.yaml'))
    || existsSync(join(path, 'activities'))
    || existsSync(join(path, 'techniques'));
}

export class UnreachableCorpusError extends Error {}

/**
 * Resolve the corpus root and prove it holds a corpus. Throws `UnreachableCorpusError` when the
 * root is missing, is not a directory, or contains no workflow — the three states in which every
 * corpus guard would otherwise pass having inspected nothing.
 */
export function requireWorkflowsRoot(defaultDir: string, argv: string[] = process.argv.slice(2)): string {
  const { root, origin } = resolveWorkflowsRootWithOrigin(defaultDir, argv);
  const from = origin === 'default' ? 'the built-in default' : origin;
  if (!existsSync(root)) {
    throw new UnreachableCorpusError(
      `workflows corpus root '${root}' (from ${from}) does not exist. `
      + `In a fresh worktree run 'npm run worktree:provision' to check out the workflows submodule.`,
    );
  }
  if (!statSync(root).isDirectory()) {
    throw new UnreachableCorpusError(`workflows corpus root '${root}' (from ${from}) is not a directory.`);
  }
  const workflows = readdirSync(root).filter((d) => {
    const p = join(root, d);
    return statSync(p).isDirectory() && isWorkflowDir(p);
  });
  if (workflows.length === 0) {
    throw new UnreachableCorpusError(
      `workflows corpus root '${root}' (from ${from}) contains no workflow (no subdirectory with a `
      + `workflow.yaml, activities/, or techniques/). An empty submodule checkout makes every corpus `
      + `guard pass vacuously — run 'npm run worktree:provision' to populate it.`,
    );
  }
  return root;
}

/**
 * Assert a guard inspected something. `count` is whatever the guard walked (technique files,
 * activities, workflows); zero means the walk found no surface, so an empty finding list is not
 * evidence of a clean corpus.
 */
export function assertScanned(count: number, what: string, root: string): void {
  if (count > 0) return;
  throw new UnreachableCorpusError(
    `no ${what} found under '${root}' — the guard inspected nothing, so a clean result is not a pass.`,
  );
}
