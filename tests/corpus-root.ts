import { resolve } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { indexCorpus } from '../src/loaders/corpus-index.js';

/**
 * The workflows corpus the test suite runs against.
 *
 * Tests used to pin `resolve(import.meta.dirname, '../workflows')` in fourteen places, so a suite run
 * from a worktree validated the main checkout's corpus while the guards validated the worktree's —
 * two measurements of two different trees, reported as one (issue #327 S2). This mirrors
 * `guards/workflows-root.ts` precedence for the one knob tests need: `WORKFLOWS_DIR`.
 *
 * It also refuses to hand back an empty corpus. A suite pointed at nothing passes the checks that
 * iterate the corpus and fails the ones that load a named workflow, which reads as an unrelated
 * regression rather than "the corpus is not there".
 *
 * Jobs that opted into a live corpus (`WORKFLOWS_DIR`, the coverage walk) call `corpusRoot` and
 * throw when it is missing. The engine suite calls `liveCorpusRoot` and `skipIf`s when it is null,
 * so `test:ci` and `typecheck` do not need a corpus checkout.
 */
export function corpusRoot(): string {
  const root = liveCorpusRoot();
  if (root !== null) return root;
  const attempted = process.env.WORKFLOWS_DIR
    ? resolve(process.env.WORKFLOWS_DIR)
    : resolve(import.meta.dirname, '../workflows');
  if (!existsSync(attempted) || !statSync(attempted).isDirectory()) {
    throw new Error(
      `workflows corpus root '${attempted}' does not exist. In a fresh worktree run `
      + `'npm run worktree:provision' to add a workflows worktree.`,
    );
  }
  throw new Error(
    `workflows corpus root '${attempted}' contains no workflow — an empty workflows checkout. `
    + `Run 'git worktree add ./workflows workflows'.`,
  );
}

/** The live corpus when one is present, else null so a suite can skip rather than throw. */
export function liveCorpusRoot(): string | null {
  const root = process.env.WORKFLOWS_DIR
    ? resolve(process.env.WORKFLOWS_DIR)
    : resolve(import.meta.dirname, '../workflows');
  if (!existsSync(root) || !statSync(root).isDirectory()) return null;
  if (indexCorpus(root).workflows.size === 0) return null;
  return root;
}
