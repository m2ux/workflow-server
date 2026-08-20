import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { enumeratePaths } from './walker.js';
import { baseSimulation } from './policies.js';
import { declaredCheckpoints, declaredOptions, optionCoverage, checkpointGaps } from './coverage.js';
import { corpusRoot } from '../corpus-root.js';
import { currentCorpusSha, readStamp, STAMP_PATH } from '../corpus-stamp.js';

/**
 * Every checkpoint option the corpus declares gets taken by some walk, or is listed as one this
 * matrix does not reach.
 *
 * The walks already had a coverage number — `enumeratePaths` reports `branchesCovered/branchesKnown`
 * — and it read 100% for nine of the corpus's workflows. `known` is what the walks encountered, so a
 * checkpoint no walk reaches is in neither the numerator nor the denominator and the ratio is silent
 * about it. Measured against what the definitions declare, three of those nine are at 20%, 24% and
 * 33%. That is the same shape as the executed-step list this suite already committed: a record of
 * what happened, read as a statement about what should have (#472).
 *
 * So the denominator here comes from the definitions, and the expectation file below carries the
 * options no walk reaches. A newly unreached option is not on the list and fails; an option that
 * becomes reachable is on the list with nothing to explain it and also fails, so the list can only
 * shrink. What it cannot do is turn an unreachable option into a reachable one: 155 of the corpus's
 * 276 options are taken, and of the 121 that are not, 96 are gated on a value only the agent or the
 * environment produces. The file records which, and under which of the three reasons.
 */

/**
 * The workflows walked, slowest first.
 *
 * Coverage is corpus-wide, because an activity one workflow borrows from another is reached by
 * whichever of them a walk enters — so this is a means to the corpus figure, not a list of subjects.
 * Ordering by cost is what makes the set weighable: the first four account for most of the time the
 * fourteen take between them, so an addition goes near the top only knowingly.
 */
const WALKED = [
  'workflow-design',
  'work-package',
  'prism-evaluate',
  'prism',
  'workflow-authoring',
  'midnight-system-review',
  'work-packages',
  'ponytail',
  'plain-language',
  'requirements-refinement',
  'prism-update',
  'codebase-wiki',
  'prism-audit',
  'meta',
] as const;

/**
 * Declared by the corpus, and left to the uncovered list rather than walked.
 *
 * `remediate-vuln` costs six minutes on its own, more than the four most expensive walks above put
 * together, and 21 of its 60 walks die on a branch whose checkpoint or transition does not resolve —
 * so the branches past each failure go unmeasured, and a walk cannot report coverage it never
 * reached. Leaving it out costs less than that suggests: of the 99 options it declares, 92 belong to
 * work-package activities it borrows and the work-package walk covers them. The 7 that are its own
 * — five checkpoints in its `start` activity — go on the uncovered list. Both the cost and the walk
 * errors are worth fixing; neither is worth blocking this measurement on.
 *
 * The two audit workflows declare no checkpoint at all, so walking them covers nothing. They are
 * named here so the set above reads as chosen rather than as an oversight.
 */
const NOT_WALKED = [
  'remediate-vuln',
  'cicd-pipeline-security-audit',
  'substrate-node-security-audit',
] as const;

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

  /**
   * The two lists above are hand-maintained, which makes them a second home for which workflows
   * exist. A workflow added to the corpus and to neither list would be measured by nothing, and
   * nothing would report that it had been skipped — so the corpus itself is the authority on the
   * roster, and this is what says the lists have not drifted from it.
   */
  /**
   * The expectation file describes a corpus, so it is only meaningful against the corpus checked
   * out. Checking the stamp first turns "an option changed reachability" into one named cause: the
   * corpus moved.
   */
  it('was recorded against the corpus commit now checked out', () => {
    const current = currentCorpusSha();
    if (current === null) return; // corpus is not a git checkout (e.g. a CI path-checkout)
    const stamp = readStamp();
    expect(stamp, `no corpus stamp at ${STAMP_PATH} — run 'npm run baseline:stamp'`).not.toBeNull();
    expect(
      stamp!.corpusSha,
      `${EXPECTED_LABEL} was recorded against corpus ${stamp!.corpusSha.slice(0, 12)} but the `
      + `checkout is at ${current.slice(0, 12)}. A coverage change below may be corpus drift rather `
      + `than a regression: confirm the corpus change is intended, then re-record the expectation `
      + `and run 'npm run baseline:stamp' in the same commit.`,
    ).toBe(current);
  });

  it('accounts for every workflow the corpus holds', () => {
    const accounted = new Set<string>([...WALKED, ...NOT_WALKED]);
    const corpus = corpusWorkflows();
    expect(corpus.length).toBeGreaterThan(0);
    expect(
      corpus.filter((w) => !accounted.has(w)),
      'this workflow is in the corpus but neither walked nor listed as not walked, so nothing '
      + 'measures its options. Add it to WALKED, or to NOT_WALKED with the reason.',
    ).toEqual([]);
    expect(
      [...accounted].filter((w) => !corpus.includes(w)),
      'this workflow is named above but is not in the corpus — remove it.',
    ).toEqual([]);
  });

  it('takes every declared option some walk can reach', async () => {
    const corpus = corpusWorkflows();
    const declared = await declaredOptions(corpus);
    const checkpoints = await declaredCheckpoints(corpus);

    const covered: string[] = [];
    const walkErrors: string[] = [];
    const entered = new Set<string>();
    for (const id of WALKED) {
      const ps = await enumeratePaths(h, id, {
        coverageMode: true, localCheckpoints: true, maxVisits: 3, maxWalks: 120,
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
      + `over ${WALKED.length} workflows walked, ${entered.size} activities entered; `
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
    const nowUncovered = c.uncovered.filter((k) => !allowedSet.has(k));
    const nowCovered = allowed.filter((k) => !uncoveredSet.has(k));

    // One key in two groups would be excused twice and shrink the list by one when removed once.
    expect(allowed.length, 'an option is listed in more than one group').toBe(allowedSet.size);

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
