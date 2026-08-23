import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { enumeratePaths } from './walker.js';
import { baseSimulation } from './policies.js';
import { declaredCheckpoints, declaredOptions, optionCoverage, checkpointGaps } from './coverage.js';
import { corpusRoot } from '../corpus-root.js';
import { expectStampFresh } from '../stamp-freshness.js';
import { WALKED } from './walked-workflows.js';

/**
 * Every checkpoint option the corpus declares gets taken by some walk, or is listed as one this
 * matrix does not reach.
 *
 * `enumeratePaths` reports `coveredBranches` — the branches the walks took — which is a numerator
 * only. A ratio taking its denominator from the same walks is silent about a checkpoint no walk
 * reaches, and reads 100% for nine of the corpus's workflows; measured against what the definitions
 * declare, three of those nine are at 20%, 24% and 33%. That is the same shape as the executed-step
 * list this suite already committed: a record of what happened, read as a statement about what
 * should have (#472).
 *
 * So the denominator here comes from the definitions, and the expectation file below carries the
 * options no walk reaches. A newly unreached option is not on the list and fails; an option that
 * becomes reachable is on the list with nothing to explain it and also fails, so the list can only
 * shrink. What it cannot do is turn an unreachable option into a reachable one: 155 of the corpus's
 * 276 options are taken, and of the 121 that are not, 96 are gated on a value only the agent or the
 * environment produces. The file records which, and under which of the three reasons.
 */


/**
 * The uncovered options, in groups that each state why no walk reaches them. Grouped rather than
 * flat because a bare list of keys records the gap without explaining it, and an unexplained
 * allowlist is indistinguishable from a list of things nobody got round to.
 */
interface Expected {
  groups: Array<{ reason: string; options: string[] }>;
}

/**
 * Consecutive walks exercising no new option before the enumerator calls a workflow done.
 *
 * The tail is not wasted work, which is worth recording because it looks like it should be. Measured
 * over the whole set: 8 covers 151 options in 303 seconds, 16 covers 152, and 30 covers 155 in 794.
 * So more than half the wall clock buys the last four options — and coverage is the point of the
 * exercise, so it is bought. Overridable from the environment to re-check that trade, but the
 * expectation file is recorded against the committed value.
 */
const DRY_WALKS = Number(process.env.WF_DRY_WALKS ?? '30');

/**
 * The workflows this run walks, and the options it may therefore judge.
 *
 * Empty means all of them, which is what a corpus change to the walker, the policies or the server
 * needs — those move how every workflow walks. `WF_COVERAGE_SCOPE` narrows it to the walked
 * workflows a corpus change can move, which scripts/coverage-scope.ts derives from a corpus diff.
 *
 * The scope bounds BOTH sides of the comparison. Options belonging to a workflow outside it are
 * neither reported as newly unreached nor as newly reachable: this run did not walk them, so it
 * knows nothing about them and says nothing about them.
 */
const SCOPE = (process.env.WF_COVERAGE_SCOPE ?? '')
  .split(',').map((s) => s.trim()).filter(Boolean);
const scoped: readonly string[] = SCOPE.length ? WALKED.filter((w) => SCOPE.includes(w)) : WALKED;

const EXPECTED_PATH = join(import.meta.dirname, 'option-coverage.json');
/** What to call the file in a failure message, since the absolute path is the runner's, not a reader's. */
const EXPECTED_LABEL = 'tests/e2e/option-coverage.json';

function listed(expected: Expected): string[] {
  return expected.groups.flatMap((g) => g.options);
}

/** Every workflow the corpus holds, so the two lists above can be checked against it rather than trusted. */
function corpusWorkflows(): string[] {
  const root = corpusRoot();
  return readdirSync(root).filter((d) => existsSync(join(root, d, 'workflow.yaml'))).sort();
}

/**
 * Fourteen full coverage walks do not belong in the suite every unit-test run waits for, so this is
 * `npm run test:coverage-walk` and a job of its own (.github/workflows/coverage.yml) rather than
 * opt-in-if-you-remember: the flag keeps `test:ci` fast, and the job means nobody has to set it.
 */
describe.skipIf(process.env.WF_OPTION_COVERAGE !== '1')('checkpoint option coverage', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  it('was recorded against the corpus commit now checked out', () => {
    expectStampFresh((stampSha, currentSha) =>
      `${EXPECTED_LABEL} was recorded against corpus ${stampSha} but the checkout is at ${currentSha}. `
      + `A coverage change below may be corpus drift rather than a regression: confirm the corpus `
      + `change is intended, then re-record the expectation and run 'npm run baseline:stamp' in the `
      + `same commit.`);
  });

  it('takes every declared option some walk can reach', async () => {
    // Declared is scoped with the walk: an option this run cannot reach because it did not walk the
    // workflow holding it is not a gap, and counting it as one would fail every scoped run.
    const measured = SCOPE.length ? scoped : corpusWorkflows();
    const declared = await declaredOptions(measured);
    const checkpoints = await declaredCheckpoints(measured);

    const covered: string[] = [];
    const walkErrors: string[] = [];
    const entered = new Set<string>();
    for (const id of scoped) {
      const ps = await enumeratePaths(h, id, {
        maxVisits: 3, maxWalks: 120,
        // The same convergence signals the hand-tuned policy walks use. Without them the enumerator
        // stalls at the first activity that needs one, and every checkpoint past that point reads as
        // uncovered for a reason about the enumerator rather than about the definitions.
        simulate: baseSimulation,
        maxDryWalks: DRY_WALKS,
      });
      covered.push(...ps.coveredBranches);
      for (const e of ps.errors) walkErrors.push(`${id}: ${e.message}`);
      for (const p of ps.paths) for (const a of p.path) entered.add(a);
    }

    const c = optionCoverage(declared, covered);
    const gaps = checkpointGaps(checkpoints, c.uncovered, entered);
    const pct = Math.round((c.covered.length / c.declared.length) * 100);
    const unentered = gaps.filter((g) => !g.activityEntered).length;
    // eslint-disable-next-line no-console
    console.log(
      `[option coverage] ${c.covered.length}/${c.declared.length} declared options (${pct}%) `
      + `over ${scoped.length} workflow(s) walked${SCOPE.length ? ` (scoped: ${scoped.join(', ')})` : ''}, `
      + `${entered.size} activities entered; `
      + `${gaps.length} checkpoints short, ${unentered} of them in an activity no walk entered:\n`
      + gaps.map((g) => `  ${g.activityId}/${g.checkpointId} ${g.missed}/${g.declared}`
        + `${g.activityEntered ? '' : ' [activity never entered]'}`
        + `${g.inLoop ? ' [loop body]' : ''}${g.gate ? ` gate: ${g.gate}` : ''}`).join('\n'),
    );

    // A key a walk took that no definition declares means the two sides have stopped naming a
    // checkpoint the same way, which would make every count above meaningless.
    expect(c.unexpected, 'walk covered an option no definition declares').toEqual([]);
    // A walk that dies mid-branch covers nothing past that point, so the gap it leaves is an
    // artefact of the failure rather than a property of the corpus.
    expect(walkErrors, 'a coverage walk failed, so its branches are unmeasured').toEqual([]);

    const expected = JSON.parse(readFileSync(EXPECTED_PATH, 'utf8')) as Expected;
    const allowed = listed(expected);
    const allowedSet = new Set(allowed);
    const uncoveredSet = new Set(c.uncovered);
    // A listed option outside what this run measured is not evidence of anything: the run did not
    // walk the workflow that would reach it, so it cannot have become reachable here.
    const declaredSet = new Set(c.declared);
    const nowUncovered = c.uncovered.filter((k) => !allowedSet.has(k));
    const nowCovered = allowed.filter((k) => declaredSet.has(k) && !uncoveredSet.has(k));
    // A listed option no definition declares: the checkpoint or the option was renamed or removed
    // and the entry outlived it. Only a run measuring the whole corpus can tell that from an option
    // merely outside its scope, so a scoped run leaves the question alone.
    const stale = SCOPE.length ? [] : allowed.filter((k) => !declaredSet.has(k));

    // One key in two groups would be excused twice and shrink the list by one when removed once.
    expect(allowed.length, 'an option is listed in more than one group').toBe(allowedSet.size);

    expect(
      stale,
      `${EXPECTED_LABEL} lists these options and no definition declares them — the checkpoint or `
      + 'the option was renamed or removed, so delete the entries.',
    ).toEqual([]);

    expect(
      nowUncovered,
      `no walk takes these options and ${EXPECTED_LABEL} does not say why. Either give some walk a `
      + 'path to them, or add them with the reason under the matching group.',
    ).toEqual([]);
    expect(
      nowCovered,
      `these options are now covered but are still listed as unreachable in ${EXPECTED_LABEL}. `
      + 'Remove them — the list is only allowed to shrink.',
    ).toEqual([]);
    // Fourteen walks measured 794 seconds here and timed out at 900 on a shared runner, having
    // reached 87 of the 276 options — a partial walk reports a gap it simply had not got to yet, so
    // the ceiling has to sit well clear of the real cost rather than near it.
  }, 2_700_000);
});
