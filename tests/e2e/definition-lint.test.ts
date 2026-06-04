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
 * KNOWN FINDING (pending legacy confirmation): the core conduct ops in
 * src/loaders/core-ops.ts reference GROUP names (agent-conduct::checkpoint-
 * discipline, ::operational-discipline, ::file-sensitivity, ::code-commentary,
 * workflow-engine::persist, ...), but the migrated agent-conduct.md defines
 * only FLATTENED rules (checkpoint-discipline-workers-yield-only, ...). The
 * group refs no longer resolve, so every worker/orchestrator bundle is missing
 * its core conduct rules. Suspected regression from grouped→flattened rule
 * renaming during the markdown migration.
 */
const BASELINE_UNRESOLVED = [
  // Core/meta conduct ops (group-name refs in core-ops.ts vs. flattened rules).
  'agent-conduct::checkpoint-discipline',
  'agent-conduct::code-commentary',
  'agent-conduct::file-sensitivity',
  'agent-conduct::operational-discipline',
  'agent-conduct::orchestrator-discipline',
  'workflow-engine::bubble-checkpoint-up',
  'workflow-engine::persist',
  // Grouped (folder-based) work-package technique operations not resolving.
  'cargo-operations::build-release',
  'cargo-operations::preflight',
  'cargo-operations::run-suite',
  'manage-artifacts::verify-readme-conforms',
  'validate-build::aggregate-results',
  'validate-build::analyze-failure',
  'validate-build::apply-fix',
].sort();

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
  }, 60_000);
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
