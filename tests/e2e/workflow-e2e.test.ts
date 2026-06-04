import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHarness, type Harness } from './harness.js';
import { walk, type Policy } from './walker.js';
import {
  defaultPolicy,
  skipOptionalPolicy,
  fullWorkflowPolicy,
  researchOnlyPolicy,
  elicitationOnlyPolicy,
  reviewModePolicy,
} from './policies.js';

/**
 * Layer 1 — machinery & definitions intact. Each policy steers the walk down a
 * distinct branch of the work-package workflow; every branch must load every
 * activity, resolve every applicable checkpoint, and reach the terminal
 * activity with the session marked completed.
 */
describe('work-package E2E walk (Layer 1: machinery)', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  interface Case { policy: Policy; mustInclude?: string[]; mustExclude?: string[]; }
  const cases: Case[] = [
    { policy: defaultPolicy },
    { policy: skipOptionalPolicy, mustExclude: ['requirements-elicitation', 'research'] },
    { policy: fullWorkflowPolicy, mustInclude: ['requirements-elicitation', 'research', 'implementation-analysis'] },
    { policy: researchOnlyPolicy, mustInclude: ['research'], mustExclude: ['requirements-elicitation'] },
    // NOTE: elicitation-only sets needs_research=false, yet the graph still
    // routes requirements-elicitation → research unconditionally (that activity's
    // only forward edge), so the research activity IS visited on this path.
    // Reported as a label-vs-graph finding; assertion reflects actual behaviour.
    { policy: elicitationOnlyPolicy, mustInclude: ['requirements-elicitation', 'research'] },
    { policy: reviewModePolicy },
  ];

  for (const { policy, mustInclude, mustExclude } of cases) {
    it(`[${policy.name}] reaches the terminal activity`, async () => {
      const result = await walk(h, 'work-package', policy);
      // eslint-disable-next-line no-console
      console.log(`[${policy.name}] ${result.path.join(' → ')}`);

      expect(result.path[0]).toBe('start-work-package');
      expect(result.path).toContain('complete');
      expect(result.finalStatus).toBe('completed');

      for (const a of mustInclude ?? []) expect(result.path).toContain(a);
      for (const a of mustExclude ?? []) expect(result.path).not.toContain(a);
    });
  }
});
