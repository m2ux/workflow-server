import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { walk } from './walker.js';
import { defaultPolicy } from './policies.js';

/**
 * Layer 1 (workflow-agnostic) — every workflow loads and resolves through the real server.
 *
 * Unlike the work-package walk (which uses hand-tuned policies to steer specific branches), this
 * drives EACH workflow with the generic `defaultPolicy` + `autoAdvance`: the walker optimistically
 * satisfies forward gate conditions toward unvisited activities, standing in for the convergence
 * variables a real agent would set — so no workflow-specific simulation is needed. It is the
 * functional-drift guard for structural refactors: every activity the walk reaches must load via
 * the real loader and resolve every technique reference (zero `unresolved`).
 */
const WORKFLOWS = [
  'work-package', 'work-packages', 'meta', 'workflow-design', 'requirements-refinement',
  'prism', 'prism-audit', 'prism-evaluate', 'prism-update',
  'cicd-pipeline-security-audit', 'substrate-node-security-audit', 'remediate-vuln',
];

describe('all-workflows E2E walk (workflow-agnostic drift guard)', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  for (const wf of WORKFLOWS) {
    it(`[${wf}] loads and resolves every technique reference`, async () => {
      const r = await walk(h, wf, defaultPolicy, { mode: 'graph', autoAdvance: true, maxVisits: 80 });
      // eslint-disable-next-line no-console
      console.log(`[${wf}] ${r.finalStatus} | ${r.path.length} steps | path: ${r.path.join(' → ')}`);

      // Loaded and walked at least the initial activity.
      expect(r.path.length).toBeGreaterThan(0);
      // No orchestrator-side or activity-side unresolved technique references — the core drift signal.
      expect(r.orchestratorUnresolved).toEqual([]);
      expect(r.steps.flatMap((s) => s.unresolved)).toEqual([]);
      // Every reached activity loaded — including borrowed cross-workflow activities.
      expect(r.loadErrors).toEqual([]);
    });
  }
});
