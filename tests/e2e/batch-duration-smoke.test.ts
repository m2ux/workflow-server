import { describe, it, expect } from 'vitest';
import { DEFAULT_RUN, DEFAULT_SPAWN_SECONDS, measure } from '../../scripts/run-batch-benchmark.js';

/**
 * Batch duration smoke test (#407).
 *
 * Walks the analysis run through the middle of the main workflow twice — a fresh context per
 * activity, then one context for the whole run — and asserts the shape of the difference, so a
 * regression that quietly costs the batch its saving fails here rather than in a run profile weeks
 * later. It is the assertion half of `npm run bench:batch`, which prints the same figures.
 *
 * ## Which duration this quantifies
 *
 * Both passes drive the real server over an in-memory transport, so the elapsed figures are the
 * SERVER-SIDE component of a walk: composing each payload, resolving techniques and fragments off
 * disk, and writing the session. That figure is a WASH, and the assertion below says so rather than
 * claiming a speed-up: reference delivery composes every payload in full and then hashes it to
 * decide what may collapse, so a batch does slightly more server work to put fewer bytes on the wire.
 *
 * The run duration a batch actually saves is the harness rebuilding a fresh worker's context before
 * it reads a line of workflow content, and that cannot be observed with no agent to spawn. So it is
 * asserted as arithmetic over CONTEXTS AVOIDED, priced at the measured per-dispatch spawn cost of the
 * profiled 27 July run. The contexts avoided are real and measured here; the seconds they are worth
 * come from that input, and the two figures are never added into one.
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
    const dispatchesAvoided = perActivity.dispatches - batched.dispatches;
    expect(dispatchesAvoided).toBe(2);

    // Content collapses against what the one context already holds. The floor sits close under the
    // measured 24.7%, so a regression that quietly halves the saving fails here.
    const charSavingPct = ((perActivity.deliveredChars - batched.deliveredChars) / perActivity.deliveredChars) * 100;
    expect(charSavingPct).toBeGreaterThan(20);

    // Server-side elapsed is a wash — a batch trades extra hashing for fewer bytes — so the bound
    // here is that batching does not make the server materially slower, not that it makes it faster.
    // The tolerance is wide because a single walk of a few hundred milliseconds is noise-dominated,
    // and the per-activity pass runs first, so it absorbs the cold-cache penalty.
    expect(batched.elapsedMs).toBeLessThan(perActivity.elapsedMs * 1.6);

    // The spawn cost is a profiling input, not a measurement this test makes. Pinning it keeps a
    // change to the projected run duration deliberate rather than a side effect.
    expect(DEFAULT_SPAWN_SECONDS).toBe(87);
    const projectedSecondsSaved = dispatchesAvoided * DEFAULT_SPAWN_SECONDS;

    process.stderr.write(
      `batch duration smoke — ${DEFAULT_RUN.length} activities: `
      + `${perActivity.dispatches} contexts → ${batched.dispatches} (${dispatchesAvoided} avoided), `
      + `${perActivity.deliveredChars} chars → ${batched.deliveredChars} (${charSavingPct.toFixed(1)}% saved), `
      + `server-side ${perActivity.elapsedMs.toFixed(0)}ms → ${batched.elapsedMs.toFixed(0)}ms; `
      + `projected run duration ${projectedSecondsSaved}s saved at ${DEFAULT_SPAWN_SECONDS}s a spawn\n`,
    );
  }, 120_000);
});
