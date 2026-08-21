import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { walk, type WalkResult } from './walker.js';
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
  //
  // The stamp answers that question for the tree in front of it. It is a file recording the provenance
  // of sibling files, so a merge can take it from one parent and the baselines it speaks for from the
  // other — matching, and silent, while the two describe different corpora (#479). Two gitlinks cannot
  // be separated that way, so the pull-request check in .github/actions/workflows-corpus compares
  // those instead, and covers the case this cannot see.
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

const policies = [
  defaultPolicy, skipOptionalPolicy, fullWorkflowPolicy,
  researchOnlyPolicy, elicitationOnlyPolicy, reviewModePolicy,
];

describe('work-package walk snapshots (baseline)', () => {
  let h: Harness;
  /**
   * Every walk, run once before any test reads one.
   *
   * The two reports below are about the matrix as a whole, so they need all six. Walking up front
   * costs nothing and keeps them independent of the order the snapshot tests run in; `allWalks` then
   * names the walk that is missing rather than quietly totalling what happened to be ready.
   */
  const walks = new Map<string, WalkResult>();
  beforeAll(async () => {
    h = await createHarness();
    for (const policy of policies) walks.set(policy.name, await walk(h, 'work-package', policy));
  }, 600_000);
  afterAll(async () => { await h.close(); });

  /** Every walk the matrix ran, or a clear failure rather than a total quietly short of one. */
  function allWalks(): WalkResult[] {
    const missing = policies.filter((p) => !walks.has(p.name)).map((p) => p.name);
    if (missing.length) throw new Error(`walk missing for ${missing.join(', ')} — totals would be short`);
    return policies.map((p) => walks.get(p.name)!);
  }

  for (const policy of policies) {
    it(`[${policy.name}] matches committed baseline`, () => {
      expect(snapshotWalk(walks.get(policy.name)!)).toMatchSnapshot();
    });
  }

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
    const tally = { pending: 0, unbound: 0, unparsed: 0, deliveries: 0 };
    for (const result of allWalks()) {
      for (const step of result.steps) {
        if (!step.lazyGates) continue;
        tally.deliveries++;
        tally.pending += step.lazyGates.pending;
        tally.unbound += step.lazyGates.unbound;
        tally.unparsed += step.lazyGates.unparsed;
      }
    }
    expect(tally.deliveries, 'no delivery reported a gate reading').toBeGreaterThan(0);
    expect(
      tally.unparsed,
      'a gated technique step stayed lazy because its when/condition does not parse. The expression '
      + 'is malformed: find it with the corpus guards (npm run check:all) rather than here.',
    ).toBe(0);
    // eslint-disable-next-line no-console
    console.log(
      `[lazy gates] over ${tally.deliveries} activity deliveries: `
      + `pending=${tally.pending} unbound=${tally.unbound} unparsed=${tally.unparsed}`,
    );
  });

  /**
   * How much of each activity the six policies actually run.
   *
   * The snapshots above record the steps that executed. That is what happened, and on its own it
   * reads as coverage: an absent step is indistinguishable from one correctly gated out. Against the
   * count the activity declares it reads as what it is — the share of the workflow this matrix
   * speaks for, and therefore the share of it these snapshots could not have caught a defect in
   * (#472).
   *
   * Both sides are pinned. The declared side is a pure function of the corpus. The executed side is
   * a pure function of the corpus and these six policies together: the walker evaluates every gate
   * itself against the bag it has built, with no agent and no clock in it, so the same corpus and the
   * same policies give the same total everywhere. A move in either figure is a move in the corpus or
   * in the policies, and the per-activity rows say which activity to look at.
   *
   * That the executed side is corpus-coupled is the whole of its subtlety, and it is not visible in
   * the number. A corpus bump that stops binding one variable can retire a step nothing else
   * mentions — `gitnexus_indexed` losing its bound value took `gitnexus-detect-changes-preflight`
   * out of all six walks and one step off this total (#479). Re-baseline in the commit that bumps the
   * submodule; CI checks that the branch walked the corpus its merge adopts, because a baseline
   * measured against a corpus the tree does not adopt reports drift as a code regression.
   *
   * Also asserted, and independent of both totals: every step some walk ran is a step its activity
   * declares. That is what an id rename or a manifest drifting from the definition would break.
   */
  it('runs only steps the activity declares, and records how much of each it runs', async () => {
    const executedByActivity = new Map<string, Set<string>>();
    for (const result of allWalks()) {
      for (const step of result.steps) {
        const seen = executedByActivity.get(step.activityId) ?? new Set<string>();
        for (const id of step.stepsExecuted) seen.add(id);
        executedByActivity.set(step.activityId, seen);
      }
    }
    const declared = await declaredSteps(['work-package']);
    const rows = stepCoverage(declared, executedByActivity);
    const undeclared = [...executedByActivity].flatMap(([activity, ran]) =>
      [...ran].filter((id) => !(declared.get(activity) ?? []).includes(id)).map((id) => `${activity}/${id}`));
    expect(
      undeclared.sort(),
      'a walk ran a step its activity does not declare — an id rename, or a step manifest that has '
      + 'drifted from the definition',
    ).toEqual([]);

    expect({
      activitiesEntered: rows.length,
      executedTotal: rows.reduce((n, r) => n + r.executed, 0),
      declaredTotal: rows.reduce((n, r) => n + r.declared, 0),
      perActivity: rows.map((r) => ({ activity: r.activity, executed: r.executed, declared: r.declared })),
    }).toMatchSnapshot();
  });
});
