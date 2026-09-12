import { resolve } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { defaultCorpusDest, REFERENCE_CORPUS_ADD } from '../src/corpus-dest.js';

/**
 * The workflows corpus the test suite runs against.
 *
 * Precedence matches the guards: `WORKFLOWS_DIR` > `.worktrees/workflows` of the primary
 * checkout. A suite pointed at nothing passes the checks that iterate the corpus and fails
 * the ones that load a named workflow, which reads as an unrelated regression rather than
 * "the corpus is not there".
 *
 * Jobs that opted into a live corpus (`WORKFLOWS_DIR`, the coverage walk) call `corpusRoot`
 * and throw when it is missing. The engine suite calls `liveCorpusRoot` and `skipIf`s when
 * it is null, so `test:ci` and `typecheck` do not need a corpus checkout.
 */
function resolvedDest(): string {
  return process.env.WORKFLOWS_DIR
    ? resolve(process.env.WORKFLOWS_DIR)
    : defaultCorpusDest(resolve(import.meta.dirname, '..'));
}

export function corpusRoot(): string {
  const root = liveCorpusRoot();
  if (root !== null) return root;
  const attempted = resolvedDest();
  if (!existsSync(attempted) || !statSync(attempted).isDirectory()) {
    throw new Error(
      `workflows corpus root '${attempted}' does not exist. In a fresh checkout run `
      + `'npm run worktree:provision' (primary) or '${REFERENCE_CORPUS_ADD}'.`,
    );
  }
  throw new Error(
    `workflows corpus root '${attempted}' contains no workflow — an empty corpus dest. `
    + `Run '${REFERENCE_CORPUS_ADD}'.`,
  );
}

/** The live corpus when one is present, else null so a suite can skip rather than throw. */
export function liveCorpusRoot(): string | null {
  const root = resolvedDest();
  if (!existsSync(root) || !statSync(root).isDirectory()) return null;
  if (indexCorpus(root).workflows.size === 0) return null;
  return root;
}
