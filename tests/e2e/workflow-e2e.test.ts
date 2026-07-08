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
    // B1 fix: elicitation-only (needs_research=false) now skips the research
    // activity — requirements-elicitation routes straight to implementation-analysis.
    { policy: elicitationOnlyPolicy, mustInclude: ['requirements-elicitation', 'implementation-analysis'], mustExclude: ['research'] },
    // Review mode routes around the create-only implement activity entirely (work-package v3.19.0):
    // assumptions-review carries an is_review_mode transition to lean-coding-audit.
    { policy: reviewModePolicy, mustExclude: ['implement'] },
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

  // R6: review mode must present ONLY the checkpoints whose outcome the mode does not already
  // determine. Every create-mode checkpoint below is either in an activity review mode skips
  // (implement) or is gated is_review_mode != true (work-package v3.19.0); if any surfaces in a
  // review walk, a spurious "skip this create step" prompt has regressed back into the review path.
  it('[review-mode] presents no create-mode checkpoints', async () => {
    const result = await walk(h, 'work-package', reviewModePolicy);
    const fired = new Set(result.steps.flatMap(s => s.checkpoints.map(c => c.checkpointId)));

    const forbidden = [
      'switch-model-pre-impl', 'switch-model-post-impl', 'symbol-provenance-confirmed',
      'implementation-assumption-interview', 'pr-creation', 'issue-verification',
      'approach-confirmed', 'dco-sign-off-confirmation', 'body-non-conformant',
      'review-received', 'review-outcome',
    ];
    for (const cp of forbidden) expect(Array.from(fired)).not.toContain(cp);

    // Sanity: the review path IS actually being exercised (not excluding everything by dying early).
    expect(Array.from(fired)).toContain('review-summary-approval');
  });
});
