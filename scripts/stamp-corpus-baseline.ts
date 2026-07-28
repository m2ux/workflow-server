/**
 * Record the corpus commit the committed walk snapshots were generated against.
 *
 * Run this in the same commit that bumps the workflows submodule and re-baselines the walk, so a
 * later snapshot failure can distinguish corpus drift from a code regression (issue #327 S3).
 *
 *   npm run baseline:stamp
 */
import { currentCorpusSha, readStamp, STAMP_PATH, writeStamp } from '../tests/corpus-stamp.js';

const sha = currentCorpusSha();
if (sha === null) {
  process.stderr.write('baseline:stamp: the workflows corpus is not a git checkout — nothing to stamp.\n');
  process.exit(2);
}
const before = readStamp();
writeStamp(sha);
process.stdout.write(
  before?.corpusSha === sha
    ? `baseline:stamp: already at ${sha.slice(0, 12)}\n`
    : `baseline:stamp: ${before ? before.corpusSha.slice(0, 12) : '(none)'} -> ${sha.slice(0, 12)} in ${STAMP_PATH}\n`,
);
