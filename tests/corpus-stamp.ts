import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { corpusRoot } from './corpus-root.js';

/**
 * The corpus commit a committed walk baseline was generated against.
 *
 * Walk snapshots are corpus-coupled: they record the path a workflow takes through the definitions in
 * the `workflows` submodule. When the checkout moves and the baseline does not, the snapshots go red
 * for a reason unrelated to any code change — during the #324 session six e2e tests failed because
 * the baseline had been generated against submodule `b3dc2506` while the checkout was at `d9b30234`,
 * and diagnosing that produced nothing (issue #327 S3).
 *
 * The stamp turns that into a one-line answer: the mismatch names both commits and says what to do.
 */
export const STAMP_PATH = resolve(import.meta.dirname, 'e2e/__snapshots__/corpus-sha.json');

export interface CorpusStamp {
  corpusSha: string;
  note: string;
}

/** The corpus commit currently checked out, or null when the corpus is not a git checkout. */
export function currentCorpusSha(root: string = corpusRoot()): string | null {
  const r = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf-8' });
  if (r.status !== 0) return null;
  const sha = r.stdout.trim();
  return sha.length > 0 ? sha : null;
}

export function readStamp(): CorpusStamp | null {
  if (!existsSync(STAMP_PATH)) return null;
  try { return JSON.parse(readFileSync(STAMP_PATH, 'utf-8')) as CorpusStamp; } catch { return null; }
}

export function writeStamp(sha: string): void {
  const stamp: CorpusStamp = {
    corpusSha: sha,
    note: 'Corpus commit the committed walk snapshots were generated against. Update it in the same '
      + 'commit that bumps the workflows submodule and re-baselines the walk (npm run baseline:stamp).',
  };
  writeFileSync(STAMP_PATH, JSON.stringify(stamp, null, 2) + '\n');
}
