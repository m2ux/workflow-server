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

/**
 * Baseline snapshots — the committed reference for the work-package walk under
 * each policy. On the technique branch this is a regression guard (any change
 * to the path, checkpoint decisions, artifacts, or unresolved set shows as a
 * snapshot diff). Run retroactively against a legacy (main) build, the same
 * snapshots reveal exactly what the skills→techniques migration changed.
 */
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
