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
import { declaredSteps, stepCoverage } from './coverage.js';
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

  // Which steps each activity ran, unioned over the matrix. Filled as the walks above run so the
  // report below costs no extra walk, and read by the final test in this describe.
  const executedByActivity = new Map<string, Set<string>>();

  for (const policy of policies) {
    it(`[${policy.name}] matches committed baseline`, async () => {
      const result = await walk(h, 'work-package', policy);
      for (const step of result.steps) {
        const seen = executedByActivity.get(step.activityId) ?? new Set<string>();
        for (const id of step.stepsExecuted) seen.add(id);
        executedByActivity.set(step.activityId, seen);
      }
      expect(snapshotWalk(result)).toMatchSnapshot();
    });
  }

  /**
   * How much of each activity the six policies actually run.
   *
   * The snapshots above record the steps that executed. That is what happened, and on its own it
   * reads as coverage: an absent step is indistinguishable from one correctly gated out. Against the
   * count the activity declares it reads as what it is — the share of the workflow this matrix
   * speaks for, and therefore the share of it these snapshots could not have caught a defect in
   * (#472). Recorded rather than asserted: most of the gap needs an agent to bind a technique
   * output, not another policy, so a threshold here would be a number chosen to pass.
   */
  it('records how much of each activity the matrix runs', async () => {
    const declared = await declaredSteps(['work-package']);
    const rows = stepCoverage(declared, executedByActivity);
    const declaredTotal = rows.reduce((n, r) => n + r.declared, 0);
    const executedTotal = rows.reduce((n, r) => n + r.executed, 0);
    // eslint-disable-next-line no-console
    console.log(
      `[step coverage] ${executedTotal}/${declaredTotal} steps over ${rows.length} activities entered\n`
      + rows.map((r) => `  ${r.activity}: ${r.executed}/${r.declared}`).join('\n'),
    );
    expect({
      activitiesEntered: rows.length,
      declaredTotal,
      executedTotal,
      perActivity: rows.map((r) => ({ activity: r.activity, declared: r.declared, executed: r.executed })),
    }).toMatchSnapshot();
  });
});
