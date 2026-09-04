import { describe, it, expect } from 'vitest';
import { DEFAULT_RUN, measure } from '../../scripts/run-batch-benchmark.js';

/**
 * Batch duration smoke test (#407) — the assertion half of `npm run bench:batch`, whose header states
 * what the two passes measure and what the elapsed figures are worth.
 *
 * Here so a regression that costs a batch its saving fails in CI rather than in a run profile weeks
 * later.
 */
describe('batch duration smoke (#407)', () => {
  it('quantifies what a batch saves over a fresh context per activity', async () => {
    const opts = { workflowId: 'work-package', activities: DEFAULT_RUN, contextTokens: 200_000, repeat: 1 };
    const perActivity = await measure('per-activity', opts);
    const batched = await measure('batched', opts);

    // The run is admitted whole: the cap is three activities and this run is three.
    expect(batched.perActivityChars).toHaveLength(DEFAULT_RUN.length);

    // One context against one per activity — the dispatches a batch does not pay for.
    expect(perActivity.dispatches).toBe(DEFAULT_RUN.length);
    expect(batched.dispatches).toBe(1);

    // Content collapses against what the one context already holds. The floor sits close under the
    // measured 18.1%, so a regression that quietly halves the saving fails here.
    //
    // The saving is composition-sensitive, which is why the floor is stated against a measurement
    // rather than an ambition. Collapse works item by item on what a held context already has, so
    // content delivered as one activity bundle collapses only when the whole bundle matches. Seeding
    // `is_review_mode` moved 21 operations out of individual fetches and into the activity that binds
    // them (#599) — worth 54,981 characters and 21 round trips on a fresh-context walk, and worth
    // 24,142 characters of this run's collapse, because a bundle that grew is a bundle that no longer
    // matches. Both halves are real; the tension between them is #603.
    const charSavingPct = ((perActivity.deliveredChars - batched.deliveredChars) / perActivity.deliveredChars) * 100;
    expect(charSavingPct).toBeGreaterThan(15);
  }, 120_000);
});
