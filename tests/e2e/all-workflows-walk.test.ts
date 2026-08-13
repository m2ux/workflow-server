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
 * variables a real agent would set — so no workflow-specific simulation is needed. It is the
 * functional-drift guard for structural refactors: every activity the walk reaches must load via
 * the real loader and resolve every technique reference (zero `unresolved`).
 *
 * The roster comes from the corpus, not from a list here. A hand-maintained list is a second home
 * for which workflows exist, and it drifts silently: a workflow added to the corpus and omitted
 * here is not walked, and nothing reports that it was skipped — which is how a workflow whose every
 * step failed to resolve reached a merge.
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
