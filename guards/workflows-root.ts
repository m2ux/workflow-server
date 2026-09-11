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
import { existsSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { type CorpusIndex, indexCorpus, workflowLocation, workflowOwning } from '../src/loaders/corpus-index.js';

/** A directory a workflow owns, wherever the workflow sits — `null` for an id the corpus lacks. */
export { workflowSubdir } from '../src/loaders/corpus-index.js';

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

/**
 * A workflow in the corpus, as a guard needs it: `id` names it in a finding, `dir` is where its
 * files are read from, and `rel` is its path from the corpus root (grouping folders appear here).
 * Ledger site keys use `citePath`, which names the workflow by id.
 */
export interface CorpusWorkflow {
  id: string;
  dir: string;
  rel: string;
  /** The definition file itself. */
  manifest: string;
}

/**
 * Every workflow in a corpus, ordered by id. Guards enumerate through this rather than reading the
 * root directly: discovery is the server's rule (a directory holding a `workflow.yaml`, at any
 * depth, outside the reserved `activities`/`resources`/`techniques` names), so a workflow the
 * server runs is a workflow the guards measure.
 */
export function corpusWorkflows(root: string, index: CorpusIndex = indexCorpus(root)): CorpusWorkflow[] {
  return [...index.workflows.values()]
    .filter((location) => workflowLocation(index, location.id))
    .map(({ id, dir, manifest }) => ({ id, dir, manifest, rel: relative(root, dir) }));
}

function posixRel(from: string, to: string): string {
  return relative(from, to).split(sep).join('/');
}

/**
 * The site key a ledger matches: `<workflow-id>/<path-inside-that-workflow>`.
 *
 * Grouping folders (`corpus/`, and any future nest) name nothing in a finding. The same resource
 * cited from a flat tree and from `corpus/<id>/` is one site, so a ledger written against the
 * workflow id keeps matching when the tree is nested.
 */
export function citePath(root: string, file: string, index: CorpusIndex = indexCorpus(root)): string {
  const location = workflowOwning(index, resolve(file));
  if (!location) return posixRel(root, file);
  const inner = posixRel(location.dir, file);
  if (!inner || inner === '.') return location.id;
  return `${location.id}/${inner}`;
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
  const index = indexCorpus(root);
  if (index.workflows.size === 0 && index.ambiguous.length === 0) {
    throw new UnreachableCorpusError(
      `workflows corpus root '${root}' (from ${from}) contains no workflow (no directory with a `
      + `workflow.yaml at any depth). An empty submodule checkout makes every corpus guard pass `
      + `vacuously — run 'npm run worktree:provision' to populate it.`,
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

/** A triage ledger on the pointed-at corpus tree. */
export function ledgerPath(root: string, file: string): string {
  return join(root, 'ledgers', file);
}

/** A recorded walk artifact on the pointed-at corpus tree. */
export function walkArtifactPath(root: string, file: string): string {
  return join(root, 'walks', file);
}
