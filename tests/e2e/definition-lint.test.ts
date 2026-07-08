import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { walk, type WalkResult } from './walker.js';
import {
  defaultPolicy,
  skipOptionalPolicy,
  fullWorkflowPolicy,
  researchOnlyPolicy,
  elicitationOnlyPolicy,
  reviewModePolicy,
} from './policies.js';

/**
 * Layer 2 — definition lint. The skills→techniques migration's most likely
 * breakage is a dangling reference: an activity (or a core op) that points at a
 * technique/operation/rule the loader can no longer resolve. Across all policy
 * paths (which together visit every activity), we collect the set of operation
 * refs the server reports as `unresolved`.
 *
 * BASELINE-RELATIVE: the technique branch is the reference build, so we assert
 * the unresolved set equals a documented baseline. Anything NEW fails the gate;
 * anything fixed forces a baseline update (and review). The legacy comparison
 * (run retroactively against main) determines whether the baseline set itself
 * is a migration regression or pre-existing.
 *
 * RESOLVED (was the headline finding): every operation ref now resolves, so the
 * baseline is empty. The fixes:
 *  - Group-prefix rule expansion in resolveTechniques: a bare group ref like
 *    agent-conduct::checkpoint-discipline now pulls all checkpoint-discipline-*
 *    rules (markdown flattens groups into <group>-<specifier> rule headings).
 *  - core-ops.ts: agent-conduct::orchestrator-discipline → ::orchestrator (the
 *    rules are named orchestrator-*); dropped stale workflow-engine::persist and
 *    ::bubble-checkpoint-up (no such op files; commit-and-persist + present/
 *    respond-checkpoint cover them).
 *  - resolveTechniques falls back to the CURRENT workflow for unprefixed refs,
 *    so work-package activities resolve their own techniques (cargo-operations,
 *    validate-build, manage-artifacts) by bare name as authored.
 */
const BASELINE_UNRESOLVED: string[] = [];

describe('work-package definition lint (Layer 2: resolution)', () => {
  let h: Harness;
  let walks: WalkResult[];

  beforeAll(async () => {
    h = await createHarness();
    const policies = [
      defaultPolicy, skipOptionalPolicy, fullWorkflowPolicy,
      researchOnlyPolicy, elicitationOnlyPolicy, reviewModePolicy,
    ];
    walks = [];
    for (const p of policies) walks.push(await walk(h, 'work-package', p));
  // 120s: six full policy walks in one hook — the corpus has outgrown the original 60s budget
  // (the hook times out at 60s even on an unchanged main checkout on a mid-range machine).
  }, 120_000);
  afterAll(async () => { await h.close(); });

  it('reports no unresolved operation refs beyond the documented baseline', () => {
    const observed = new Set<string>();
    for (const w of walks) {
      for (const ref of w.orchestratorUnresolved) observed.add(ref);
      for (const step of w.steps) for (const ref of step.unresolved) observed.add(ref);
    }
    const observedSorted = [...observed].sort();

    const novel = observedSorted.filter(r => !BASELINE_UNRESOLVED.includes(r));
    const fixed = BASELINE_UNRESOLVED.filter(r => !observed.has(r));
    // eslint-disable-next-line no-console
    if (novel.length) console.log('[NEW unresolved refs — regression]', novel);
    // eslint-disable-next-line no-console
    if (fixed.length) console.log('[unresolved refs now resolved — update baseline]', fixed);

    expect(observedSorted).toEqual(BASELINE_UNRESOLVED);
  });

  it('reaches every declared activity across the policy matrix', () => {
    const declared = new Set(walks[0].declaredActivities);
    const visited = new Set<string>();
    for (const w of walks) for (const a of w.path) visited.add(a);

    const unreachable = [...declared].filter(a => !visited.has(a));
    // eslint-disable-next-line no-console
    console.log(`[coverage] visited ${visited.size}/${declared.size} declared activities`);
    expect(unreachable, 'activities never reached by any policy').toEqual([]);
  });
});
