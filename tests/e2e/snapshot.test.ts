import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { walk } from './walker.js';
import { snapshotWalk } from './snapshot.js';
import {
  defaultPolicy,
  skipOptionalPolicy,
  fullWorkflowPolicy,
  researchOnlyPolicy,
  elicitationOnlyPolicy,
  reviewModePolicy,
} from './policies.js';
import { currentCorpusSha, readStamp, STAMP_PATH } from '../corpus-stamp.js';

/**
 * Baseline snapshots — the committed reference for the work-package walk under
 * each policy. On the technique branch this is a regression guard (any change
 * to the path, checkpoint decisions, artifacts, or unresolved set shows as a
 * snapshot diff). Run retroactively against a legacy (main) build, the same
 * snapshots reveal exactly what the skills→techniques migration changed.
 */
describe('walk baseline corpus stamp', () => {
  // These snapshots describe a walk through the corpus, so they are only meaningful against the corpus
  // they were generated from. Checking the stamp first turns "six unrelated tests are red" into one
  // named cause (#327 S3).
  it('was generated against the corpus commit now checked out', () => {
    const stamp = readStamp();
    const current = currentCorpusSha();
    if (current === null) return; // corpus is not a git checkout (e.g. a CI path-checkout): nothing to compare
    expect(stamp, `no corpus stamp at ${STAMP_PATH} — run 'npm run baseline:stamp'`).not.toBeNull();
    expect(
      stamp!.corpusSha,
      `walk snapshots were generated against corpus ${stamp!.corpusSha.slice(0, 12)} but the checkout `
      + `is at ${current.slice(0, 12)}. Any snapshot diff below may be corpus drift, not a code `
      + `regression. Confirm the corpus change is intended, re-baseline with 'npm run test:ci -- -u', `
      + `then run 'npm run baseline:stamp' in the same commit.`,
    ).toBe(current);
  });
});

describe('work-package walk snapshots (baseline)', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  const policies = [
    defaultPolicy, skipOptionalPolicy, fullWorkflowPolicy,
    researchOnlyPolicy, elicitationOnlyPolicy, reviewModePolicy,
  ];

  for (const policy of policies) {
    it(`[${policy.name}] matches committed baseline`, async () => {
      const result = await walk(h, 'work-package', policy);
      expect(snapshotWalk(result)).toMatchSnapshot();
    });
  }
});
