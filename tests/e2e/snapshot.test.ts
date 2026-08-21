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
  it('was generated against the corpus commit now checked out', () => {
    const stamp = readStamp();
    const current = currentCorpusSha();
    // An unreadable corpus commit voids the comparison, so it fails rather than passing with nothing
    // compared.
    // ponytail: requires a git corpus checkout, add a skip when a build vendors the corpus instead
    expect(current, 'the corpus is not a git checkout, so the stamp cannot be verified').not.toBeNull();
    expect(stamp, `no corpus stamp at ${STAMP_PATH} — run 'npm run baseline:stamp'`).not.toBeNull();
    expect(
      stamp!.corpusSha,
      `walk snapshots were generated against corpus ${stamp!.corpusSha.slice(0, 12)} but the checkout `
      + `is at ${current!.slice(0, 12)}. Any snapshot diff below may be corpus drift, not a code `
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
   * The two reports below are about the matrix as a whole, so they need all six. Accumulating into
   * shared state as each test ran made them depend on every one of those tests having finished
   * first, which is a coupling worth removing on its own account: it costs nothing to walk up front,
   * and `allWalks` can then say which walk is missing rather than quietly totalling what happened to
   * be ready. It did not, in the event, explain the CI difference that prompted it — that turned out
   * to be a branch in post-impl-review, #479 — so this stands as structure rather than as a fix.
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

  /**
   * The branch each policy exists to steer, named rather than left to the snapshot.
   *
   * A snapshot says the walk is what it was; these say what it must be. The distinction matters at
   * the moment a snapshot is re-baselined with `-u`, which accepts whatever the walk now does — a
   * policy that stopped reaching its branch would be recorded rather than reported.
   */
  const branches: Record<string, { mustInclude?: string[]; mustExclude?: string[] }> = {
    [defaultPolicy.name]: {},
    [skipOptionalPolicy.name]: { mustExclude: ['requirements-elicitation', 'research'] },
    [fullWorkflowPolicy.name]: { mustInclude: ['requirements-elicitation', 'research', 'implementation-analysis'] },
    [researchOnlyPolicy.name]: { mustInclude: ['research'], mustExclude: ['requirements-elicitation'] },
    // Elicitation-only (needs_research=false) skips research: requirements-elicitation routes
    // straight to implementation-analysis.
    [elicitationOnlyPolicy.name]: {
      mustInclude: ['requirements-elicitation', 'implementation-analysis'],
      mustExclude: ['research'],
    },
    // Review mode routes around the create-only implement activity entirely: assumptions-review
    // carries an is_review_mode transition to lean-coding-audit.
    [reviewModePolicy.name]: { mustExclude: ['implement'] },
  };

  for (const policy of policies) {
    it(`[${policy.name}] reaches the terminal activity down its own branch`, () => {
      const result = walks.get(policy.name)!;
      expect(result.path[0]).toBe('start-work-package');
      expect(result.path).toContain('complete');
      expect(result.finalStatus).toBe('completed');
      const { mustInclude, mustExclude } = branches[policy.name]!;
      for (const a of mustInclude ?? []) expect(result.path, policy.name).toContain(a);
      for (const a of mustExclude ?? []) expect(result.path, policy.name).not.toContain(a);
    });

    // The snapshot key is this test's name, so it stays as written — a rename orphans the
    // committed baseline and silently re-records it.
    it(`[${policy.name}] matches committed baseline`, () => {
      expect(snapshotWalk(walks.get(policy.name)!)).toMatchSnapshot();
    });
  }

  /**
   * Layer 2 — definition lint, over the same six walks.
   *
   * The likeliest breakage in a rename is a dangling reference: an activity, or a core op, pointing
   * at a technique/operation/rule the loader cannot resolve. The six policies together visit every
   * activity, so the unresolved set they report is the corpus's. It is empty and stays empty —
   * group-prefix rule expansion in `resolveTechniques`, the `core-ops.ts` names, and the fallback to
   * the current workflow for an unprefixed ref are what hold it there.
   */
  it('reports no unresolved operation refs', () => {
    const observed = new Set<string>();
    for (const w of allWalks()) {
      for (const ref of w.orchestratorUnresolved) observed.add(ref);
      for (const step of w.steps) for (const ref of step.unresolved) observed.add(ref);
    }
    expect([...observed].sort()).toEqual([]);
  });

  it('reaches every declared activity across the policy matrix', () => {
    const all = allWalks();
    const declared = new Set(all[0]!.declaredActivities);
    const visited = new Set<string>();
    for (const w of all) for (const a of w.path) visited.add(a);
    // eslint-disable-next-line no-console
    console.log(`[coverage] visited ${visited.size}/${declared.size} declared activities`);
    expect([...declared].filter((a) => !visited.has(a)), 'activities never reached by any policy').toEqual([]);
  });

  /**
   * Review mode presents ONLY the checkpoints whose outcome the mode does not already determine.
   * Every checkpoint below is either in an activity review mode skips (implement) or is gated
   * `is_review_mode != true`; one surfacing in a review walk is a spurious "skip this create step"
   * prompt back in the review path.
   */
  it('[review-mode] presents no create-mode checkpoints', () => {
    const fired = new Set(walks.get(reviewModePolicy.name)!.steps.flatMap((s) => s.checkpoints.map((c) => c.checkpointId)));
    const forbidden = [
      'switch-model-pre-impl', 'switch-model-post-impl', 'symbol-provenance-confirmed',
      'implementation-assumption-interview', 'pr-creation', 'issue-verification',
      'approach-confirmed', 'dco-sign-off-confirmation', 'body-non-conformant',
      'review-received', 'review-outcome',
    ];
    for (const cp of forbidden) expect([...fired]).not.toContain(cp);
    // The review path IS exercised — not excluding everything by dying early.
    expect([...fired]).toContain('review-summary-approval');
  });

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
   * The executed share is logged rather than snapshotted, and that is a deliberate retreat. Pinning
   * it failed on CI at 149 against 150 here, and the difference is one step: five policies run
   * `structural-analysis-inline` in post-impl-review where a sixth runs `dispatch-prism`, so the
   * total hangs on a single either/or that does not settle the same way on every machine. A number
   * that moves with the runner is not a baseline, whatever it is measuring — #479 has the detail.
   *
   * What is asserted is the part that holds: every step some walk ran is a step its activity
   * declares. That is what would break on an id rename or a manifest drifting from the definition,
   * which is the drift worth catching here. The declared side is snapshotted on its own, because it
   * is a pure function of the corpus and moves only when the corpus does.
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
    const declaredTotal = rows.reduce((n, r) => n + r.declared, 0);
    const executedTotal = rows.reduce((n, r) => n + r.executed, 0);
    // eslint-disable-next-line no-console
    console.log(
      `[step coverage] ${executedTotal}/${declaredTotal} steps over ${rows.length} activities entered\n`
      + rows.map((r) => `  ${r.activity}: ${r.executed}/${r.declared}`).join('\n'),
    );

    const undeclared = [...executedByActivity].flatMap(([activity, ran]) =>
      [...ran].filter((id) => !(declared.get(activity) ?? []).includes(id)).map((id) => `${activity}/${id}`));
    expect(
      undeclared.sort(),
      'a walk ran a step its activity does not declare — an id rename, or a step manifest that has '
      + 'drifted from the definition',
    ).toEqual([]);

    expect({
      activitiesEntered: rows.length,
      declaredTotal,
      declaredPerActivity: rows.map((r) => ({ activity: r.activity, declared: r.declared })),
    }).toMatchSnapshot();
  });
});
