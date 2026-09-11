import { expect } from 'vitest';
import { currentCorpusSha, readStamp, STAMP_PATH } from './corpus-stamp.js';

/**
 * Assert the stamp names the corpus commit now checked out, ahead of any corpus-coupled comparison.
 * Separate from `corpus-stamp.ts` because `scripts/stamp-corpus-baseline.ts` reads that module
 * outside the runner, where importing `vitest` throws.
 *
 * `driftHint` receives both short shas and says what the caller committed and how to re-record it.
 */
export function expectStampFresh(driftHint: (stampSha: string, currentSha: string) => string): void {
  // A corpus-branch job checks out the tree that holds both the definitions and walks/. There is
  // no gitlink pin for the stamp to drift from; the snapshot and ratchet files are the check.
  if (process.env.WF_CORPUS_SUBJECT === 'checkout') return;
  const current = currentCorpusSha();
  expect(current, 'the corpus is not a git checkout, so the stamp cannot be verified').not.toBeNull();
  const stamp = readStamp();
  expect(stamp, `no corpus stamp at ${STAMP_PATH} — run 'npm run baseline:stamp'`).not.toBeNull();
  expect(stamp!.corpusSha, driftHint(stamp!.corpusSha.slice(0, 12), current!.slice(0, 12))).toBe(current);
}
