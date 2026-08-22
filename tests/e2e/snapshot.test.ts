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
import { expectStampFresh } from '../stamp-freshness.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { corpusRoot } from '../corpus-root.js';

/**
 * Expected numeric prefix of each activity, read from the activity FILENAMES
 * (e.g. 02-design-philosophy.yaml → design-philosophy: "02"). Independent of the server's
 * artifactPrefix computation, so comparing written artifact names against it verifies the whole
 * chain: filename → server artifactPrefix → get_workflow exposure → robot application.
 */
function expectedActivityPrefixes(): Map<string, string> {
  const dir = join(corpusRoot(), 'work-package/activities');
  const map = new Map<string, string>();
  for (const f of readdirSync(dir)) {
    const m = f.match(/^(\d+)-(.+)\.yaml$/);
    if (m) map.set(m[2]!, m[1]!);
  }
  return map;
}

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
    expectStampFresh((stampSha, currentSha) =>
      `walk snapshots were generated against corpus ${stampSha} but the checkout is at ${currentSha}. `
      + `Any snapshot diff below may be corpus drift, not a code regression. Confirm the corpus change `
      + `is intended, re-baseline with 'npm run test:ci -- -u', then run 'npm run baseline:stamp' in `
      + `the same commit.`);
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

  /**
   * The branch each policy exists to steer, named rather than left to the snapshot.
   *
   * A snapshot says the walk is what it was; these say what it must be. The distinction matters at
   * the moment a snapshot is re-baselined with `-u`, which accepts whatever the walk now does — a
   * policy that stopped reaching its branch would be recorded rather than reported.
   */
  const branches: Record<string, { mustInclude?: string[]; mustExclude?: string[] }> = {
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
      const { mustInclude, mustExclude } = branches[policy.name] ?? {};
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
   * activity, so the unresolved set they report is the corpus's.
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

  /**
   * Layer 3c — deterministic robot-worker execution, read off the full-workflow walk the matrix
   * above already ran. Robot mode executes each activity's STEPS in order: fires the checkpoint a
   * step declares at that step, writes a stub for every declared planning artifact, and submits
   * step manifests. This validates the original acceptance criteria — "all planning files created,
   * all decision points presented" — deterministically, with no LLM. The full-workflow policy
   * visits all 14 activities, so one walk covers the whole definition.
   */
  describe('robot execution (Layer 3c)', () => {
    // ponytail: reads the matrix's full-workflow walk, add a walk of its own if that policy leaves the matrix
    const full = () => walks.get(fullWorkflowPolicy.name)!;

    it('reaches the terminal activity executing steps (not just walking the graph)', () => {
      expect(full().finalStatus).toBe('completed');
      const totalSteps = full().steps.reduce((n, s) => n + s.stepsExecuted.length, 0);
      expect(totalSteps).toBeGreaterThan(0);
    });

    it('writes a stub for every declared planning artifact as it executes', () => {
      const totalWritten = full().steps.reduce((n, s) => n + s.artifactsWritten.length, 0);
      expect(totalWritten, 'planning artifacts written across the walk').toBeGreaterThan(0);

      // design-philosophy declares design-philosophy.md + assumptions-log.md (planning).
      const dp = full().steps.find(s => s.activityId === 'design-philosophy');
      expect(dp?.artifactsWritten.some(n => n.endsWith('design-philosophy.md')), 'design-philosophy.md written').toBe(true);
      expect(dp?.artifactsWritten.some(n => n.endsWith('assumptions-log.md')), 'assumptions-log.md written').toBe(true);
    });

    it('prefixes each artifact with its CREATING activity\'s filename-derived number', () => {
      // With update-in-place, an artifact keeps the prefix of the activity that
      // first created it; later activities that update it reuse that same file.
      // So check each artifact against the FIRST activity (walk order) that wrote it.
      const expected = expectedActivityPrefixes();
      const seen = new Set<string>();
      const wrong: string[] = [];
      for (const s of full().steps) {
        const prefix = expected.get(s.activityId);
        expect(prefix, `no filename prefix known for activity ${s.activityId}`).toBeDefined();
        for (const name of s.artifactsWritten) {
          const bare = name.replace(/^\d+-/, '');
          if (seen.has(bare)) continue; // already created by an earlier activity — keeps its prefix
          seen.add(bare);
          if (!name.startsWith(`${prefix}-`)) wrong.push(`${s.activityId} created ${name} (expected ${prefix}-*)`);
        }
      }
      expect(wrong, 'newly-created artifacts whose prefix does not match the creating activity').toEqual([]);
    });

    it('keeps exactly one numbered instance per logical artifact (update-in-place)', () => {
      // Group every written artifact by its bare filename (strip the <NN>- prefix);
      // a logical artifact must map to exactly one distinct full filename across the walk.
      const byBare = new Map<string, Set<string>>();
      for (const s of full().steps) {
        for (const f of s.artifactsWritten) {
          const bare = f.replace(/^\d+-/, '');
          if (!byBare.has(bare)) byBare.set(bare, new Set());
          byBare.get(bare)!.add(f);
        }
      }
      const multi = [...byBare.entries()]
        .filter(([, set]) => set.size > 1)
        .map(([bare, set]) => `${bare}: ${[...set].sort().join(', ')}`);
      expect(multi, 'logical artifacts written under more than one number').toEqual([]);
    });

    it('submits step manifests the server accepts (no validation errors)', () => {
      for (const s of full().steps) {
        if (s.manifestStatus !== undefined) {
          expect(['valid', 'warning'], `${s.activityId} manifest`).toContain(s.manifestStatus);
        }
      }
    });

    // Every checkpoint is an inline kind:checkpoint step at a concrete position, so an activity
    // declares none the robot cannot reach.
    it('surfaces no unbound checkpoints (all are inline kind:checkpoint steps)', () => {
      const unbound: string[] = [];
      for (const s of full().steps) for (const o of s.orphanCheckpoints) unbound.push(`${s.activityId}::${o}`);
      expect(unbound.sort()).toEqual([]);
    });
  });
});
