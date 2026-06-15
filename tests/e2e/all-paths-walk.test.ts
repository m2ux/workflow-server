import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { enumeratePaths } from './walker.js';

/**
 * Beyond-happy-path coverage (opt-in: set WF_PATH_COVERAGE=1).
 *
 * For each workflow, drive BRANCH coverage — exercise every checkpoint option and every conditional
 * transition at least once (not just the auto-advance happy path) — via enumeratePaths in coverage
 * mode with local checkpoint resolution (no per-checkpoint server round-trips, so it stays cheap and
 * can traverse branches a no-agent walk could not otherwise pass). Every path the coverage walk
 * takes must load every activity and resolve every technique reference (zero drift).
 *
 * Off by default: full branch coverage of the large workflows (work-package, substrate) runs many
 * walks and is bounded by maxWalks, so this is an on-demand check rather than part of the fast suite.
 * The per-path enumeratePaths capability (coverageMode:false) is available for exhaustive per-path
 * coverage on the workflows where that is tractable.
 */
const WORKFLOWS = [
  'work-package', 'work-packages', 'meta', 'workflow-design', 'requirements-refinement',
  'prism', 'prism-audit', 'prism-evaluate', 'prism-update',
  'cicd-pipeline-security-audit', 'substrate-node-security-audit', 'remediate-vuln',
];

describe.skipIf(process.env.WF_PATH_COVERAGE !== '1')('all-workflows branch coverage (opt-in)', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  for (const wf of WORKFLOWS) {
    it(`[${wf}] every covered branch loads and resolves cleanly`, async () => {
      const ps = await enumeratePaths(h, wf, { coverageMode: true, localCheckpoints: true, maxVisits: 3, maxWalks: 120 });
      // eslint-disable-next-line no-console
      console.log(`[${wf}] paths=${ps.distinctPaths.length} branches=${ps.branchesCovered}/${ps.branchesKnown} walks=${ps.walks} errors=${ps.errors.length}${ps.capped ? ' (capped)' : ''}`);

      // Drift guard on every path the coverage walk took.
      for (const p of ps.paths) {
        expect(p.orchestratorUnresolved).toEqual([]);
        expect(p.steps.flatMap((s) => s.unresolved)).toEqual([]);
        expect(p.loadErrors).toEqual([]);
      }
      // No genuine walk failures (loop-guard trips are filtered out as benign).
      expect(ps.errors).toEqual([]);
      // The walk reached at least the happy path.
      expect(ps.distinctPaths.length).toBeGreaterThan(0);
    }, 180_000);
  }
});
