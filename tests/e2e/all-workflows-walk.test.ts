import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHarness, type Harness } from './harness.js';
import { walk } from './walker.js';
import { defaultPolicy } from './policies.js';
import { corpusRoot } from '../corpus-root.js';

/**
 * Layer 1 (workflow-agnostic) — every workflow loads and resolves through the real server.
 *
 * Unlike the work-package walk (which uses hand-tuned policies to steer specific branches), this
 * drives EACH workflow with the generic `defaultPolicy` + `autoAdvance`: the walker optimistically
 * satisfies forward gate conditions toward unvisited activities, standing in for the convergence
 * variables a real agent would set — so no workflow-specific simulation is needed.
 *
 * What it covers, precisely: every activity the graph reaches loads through the real loader, and
 * the activity-level technique references resolve (zero `unresolved`). In `mode: 'graph'` the walk
 * traverses activities and transitions and executes no steps at all — `stepsExecuted` is empty for
 * every workflow here, work-package included — so it never fetches a step's technique and cannot
 * see a step binding that fails to resolve. A workflow whose every step binding was broken walked
 * this graph to completion and passed.
 *
 * Step-binding resolution has a home: the `binding-fidelity` guard resolves each step's `technique`
 * ref the way the server does and reports the ones that do not, and it runs on corpus pull requests.
 * Do not add a second resolver here — read that guard instead, and treat this walk as what it is,
 * a graph-reachability and activity-load check.
 *
 * The roster comes from the corpus, not from a list here. A hand-maintained list is a second home
 * for which workflows exist, and it drifts silently: a workflow added to the corpus and omitted
 * here is not walked, and nothing reports that it was skipped — which is how the workflow above
 * reached a merge with nothing measuring it.
 */
function corpusWorkflows(): string[] {
  const root = corpusRoot();
  return readdirSync(root)
    .filter((d) => existsSync(join(root, d, 'workflow.yaml')))
    .sort();
}

const WORKFLOWS = corpusWorkflows();

describe('all-workflows E2E walk (workflow-agnostic drift guard)', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  it('walks every workflow the corpus holds', () => {
    // A corpus that resolves to nothing would pass every check below by having nothing to check.
    expect(WORKFLOWS.length).toBeGreaterThan(0);
  });

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
