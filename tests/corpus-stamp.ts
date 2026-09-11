import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { walkArtifactPath } from '../guards/workflows-root.js';
import { corpusRoot } from './corpus-root.js';

/**
 * The corpus commit a committed walk baseline was generated against.
 *
 * Walk snapshots are corpus-coupled: they record the path a workflow takes through the definitions
 * in the pointed-at corpus tree. When the checkout moves and the baseline does not, the snapshots
 * go red for a reason unrelated to any code change — during the #324 session six e2e tests failed
 * because the baseline had been generated against corpus `b3dc2506` while the checkout was at
 * `d9b30234`, and diagnosing that produced nothing (issue #327 S3).
 *
 * The stamp turns that into a one-line answer: the mismatch names both commits and says what to do.
 * It lives under `walks/` of the corpus tree, beside the snapshots it speaks for.
 */

function defaultCorpusRoot(): string {
  return process.env.WORKFLOWS_DIR
    ? resolve(process.env.WORKFLOWS_DIR)
    : resolve(import.meta.dirname, '../workflows');
}

export function stampPath(root: string = defaultCorpusRoot()): string {
  return walkArtifactPath(root, 'corpus-sha.json');
}

export const STAMP_PATH = stampPath();

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

export function readStamp(root?: string): CorpusStamp | null {
  const path = stampPath(root);
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')) as CorpusStamp; } catch { return null; }
}

export function writeStamp(sha: string, root?: string): void {
  const path = stampPath(root);
  mkdirSync(dirname(path), { recursive: true });
  const stamp: CorpusStamp = {
    corpusSha: sha,
    note: 'Corpus commit the committed walk snapshots were generated against. Update it in the same '
      + 'commit that re-baselines the walk (npm run baseline:stamp).',
  };
  writeFileSync(path, JSON.stringify(stamp, null, 2) + '\n');
}
