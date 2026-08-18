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

  // Which steps each activity ran, unioned over the matrix, and the server's gate readings summed
  // over every delivery. Filled as the walks above run so the reports below cost no extra walk.
  const executedByActivity = new Map<string, Set<string>>();
  const lazyGates = { pending: 0, unbound: 0, unparsed: 0, deliveries: 0 };

  for (const policy of policies) {
    it(`[${policy.name}] matches committed baseline`, async () => {
      const result = await walk(h, 'work-package', policy);
      for (const step of result.steps) {
        const seen = executedByActivity.get(step.activityId) ?? new Set<string>();
        for (const id of step.stepsExecuted) seen.add(id);
        executedByActivity.set(step.activityId, seen);
        if (step.lazyGates) {
          lazyGates.deliveries++;
          lazyGates.pending += step.lazyGates.pending;
          lazyGates.unbound += step.lazyGates.unbound;
          lazyGates.unparsed += step.lazyGates.unparsed;
        }
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
  /**
   * The server's own gate readings, summed over every activity delivery in the matrix.
   *
   * Only one of the three can be held at zero, and it is worth knowing which. Over 79 deliveries the
   * matrix sees 313 `pending` and 168 `unbound`, so neither is an invariant: `pending` is a technique
   * step gated on a variable its own activity produces, which is lazy delivery working as designed
   * and would be forbidden by a zero here; `unbound` is structural, recurring at the same count per
   * activity under every policy, and needs an agent to bind a technique output rather than another
   * policy. Both are in the committed snapshots per activity, where a change to either shows up.
   *
   * `unparsed` is different. A gate expression the parser cannot read has no correct answer at all —
   * the step is deferred because the server declined to guess, not because of anything about the run.
   * It is zero across the corpus today and there is no reason for it ever not to be, so it is the one
   * that is asserted (#472).
   */
  it('never delivers an activity whose gate expression it cannot parse', () => {
    expect(lazyGates.deliveries, 'no delivery reported a gate reading').toBeGreaterThan(0);
    expect(
      lazyGates.unparsed,
      'a gated technique step stayed lazy because its when/condition does not parse. The expression '
      + 'is malformed: find it with the corpus guards (npm run check:all) rather than here.',
    ).toBe(0);
    // eslint-disable-next-line no-console
    console.log(
      `[lazy gates] over ${lazyGates.deliveries} activity deliveries: `
      + `pending=${lazyGates.pending} unbound=${lazyGates.unbound} unparsed=${lazyGates.unparsed}`,
    );
  });

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
