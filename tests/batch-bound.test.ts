import { describe, it, expect } from 'vitest';
import { createInitialSessionFile, type SessionFile } from '../src/schema/session.schema.js';
import {
  batchActivities,
  batchBound,
  batchRefusal,
  batchRefusalMessage,
  deliveredChars,
  recordBatchRefusal,
} from '../src/utils/batch.js';
import { recordDispatch } from '../src/utils/dispatch.js';
import { DEFAULT_BATCH_HEADROOM_FRACTION, DEFAULT_BATCH_MAX_ACTIVITIES, DEFAULT_BUNDLE_CHARS_PER_TOKEN } from '../src/config.js';

/**
 * The batch bound, over a hand-built history (#407).
 *
 * The walk test covers the sequence over the real server; this covers the arithmetic, where the
 * numbers can be stated exactly: which activities count as one context's batch, what draws down the
 * budget, and which of the two limits a given history runs into first.
 */

/** A session whose own agent is `orchestrator`, so any other scope is a dispatched worker context. */
function session(): SessionFile {
  return createInitialSessionFile({
    sessionIndex: 'AAAAAA',
    workflowId: 'work-package',
    workflowVersion: '1.0.0',
    agentId: 'orchestrator',
  });
}

/** The policy the server runs with when nothing overrides it. */
const POLICY = {
  headroomFraction: DEFAULT_BATCH_HEADROOM_FRACTION,
  maxActivities: DEFAULT_BATCH_MAX_ACTIVITIES,
  charsPerToken: DEFAULT_BUNDLE_CHARS_PER_TOKEN,
};

/** Record one delivery of `chars` to `scope` for `activityId`. */
function deliver(state: SessionFile, scope: string, activityId: string, chars: number): void {
  recordDispatch(state, { scope, kind: 'fresh', activityId, chars });
}

describe('batch bound arithmetic (#407)', () => {
  it('counts the distinct activities one scope has taken, in first-delivery order', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 100);
    deliver(state, 'worker-a', 'plan-prepare', 100);
    // A second arrival for an activity already taken is the same activity, not a fourth.
    deliver(state, 'worker-a', 'implementation-analysis', 20);
    deliver(state, 'worker-b', 'assumptions-review', 100);

    expect(batchActivities(state, 'worker-a')).toEqual(['implementation-analysis', 'plan-prepare']);
    expect(batchActivities(state, 'worker-b')).toEqual(['assumptions-review']);
    expect(batchActivities(state, 'worker-c')).toEqual([]);
  });

  it('draws the budget down by what shipped, and not by what collapsed to a marker', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 1_000);
    state.history.push({
      timestamp: new Date().toISOString(), type: 'technique_bundled', activity: 'implementation-analysis',
      data: { techniqueId: 't1', stepId: 's1', agentId: 'worker-a', chars: 500, delivery: 'full' },
    });
    state.history.push({
      timestamp: new Date().toISOString(), type: 'technique_bundled', activity: 'plan-prepare',
      data: { techniqueId: 't1', stepId: 's1', agentId: 'worker-a', chars: 500, delivery: 'unchanged' },
    });
    state.history.push({
      timestamp: new Date().toISOString(), type: 'resource_fetched', activity: 'plan-prepare',
      data: { resourceId: 'r1', agentId: 'worker-a', chars: 250, delivery: 'full' },
    });
    // Another context's deliveries are not this one's.
    deliver(state, 'worker-b', 'assumptions-review', 9_999);

    expect(deliveredChars(state, 'worker-a')).toBe(1_750);
  });

  it('excludes a redelivery, which reports the payload its dispatch event already counted', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 1_000);
    state.history.push({
      timestamp: new Date().toISOString(), type: 'activity_redelivered', activity: 'implementation-analysis',
      data: { agentId: 'worker-a', priorAgentId: 'worker-z', chars: 1_000 },
    });

    expect(deliveredChars(state, 'worker-a')).toBe(1_000);
  });

  it('derives the budget from the caller declared window', () => {
    // 200,000 tokens × 0.20 headroom × 4 characters a token.
    expect(batchBound(200_000, POLICY)).toEqual({ maxActivities: 3, budgetChars: 160_000 });
    // A fractional cap floors, and a cap below one still admits the activity a dispatch was made for.
    expect(batchBound(1_000, { ...POLICY, maxActivities: 2.9 }).maxActivities).toBe(2);
    expect(batchBound(1_000, { ...POLICY, maxActivities: 0.4 }).maxActivities).toBe(1);
  });

  it('admits the activity a fresh context was dispatched for, whatever the bound says', () => {
    const state = session();
    // An empty ledger is a first arrival: there is no batch to extend yet.
    expect(batchRefusal(state, 'worker-a', 'implementation-analysis', batchBound(1, POLICY))).toBeUndefined();
  });

  it('admits an activity the context already holds, so a batch survives its gates', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 1_000_000);
    deliver(state, 'worker-a', 'plan-prepare', 1_000_000);
    deliver(state, 'worker-a', 'assumptions-review', 1_000_000);

    // At the cap and far over budget, the activity this context is holding is still served.
    expect(batchRefusal(state, 'worker-a', 'assumptions-review', batchBound(200_000, POLICY))).toBeUndefined();
  });

  it('refuses a fourth activity at the cap, naming the cap', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 100);
    deliver(state, 'worker-a', 'plan-prepare', 100);
    deliver(state, 'worker-a', 'assumptions-review', 100);

    const refusal = batchRefusal(state, 'worker-a', 'implement', batchBound(2_000_000, POLICY));
    expect(refusal).toMatchObject({ limit: 'activity_cap', activities: 3, chars: 300 });
    expect(batchRefusalMessage('implement', 'worker-a', refusal!)).toContain('cap of 3');
  });

  it('refuses on the budget while the cap still has room', () => {
    const state = session();
    // One activity, and it alone has spent more than a 20,000-token window's batch budget of 16,000.
    deliver(state, 'worker-a', 'implementation-analysis', 20_000);

    const refusal = batchRefusal(state, 'worker-a', 'plan-prepare', batchBound(20_000, POLICY));
    expect(refusal).toMatchObject({ limit: 'delivery_budget', activities: 1, chars: 20_000 });
    expect(batchRefusalMessage('plan-prepare', 'worker-a', refusal!)).toContain('batch budget of 16000');
  });

  it('leaves the session own agent unbounded, whose run is the session rather than a batch', () => {
    const state = session();
    deliver(state, 'orchestrator', 'implementation-analysis', 1_000_000);
    deliver(state, 'orchestrator', 'plan-prepare', 1_000_000);
    deliver(state, 'orchestrator', 'assumptions-review', 1_000_000);

    expect(batchRefusal(state, 'orchestrator', 'implement', batchBound(200_000, POLICY))).toBeUndefined();
  });

  it('records the limit a refusal met, with the arithmetic that produced it', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 20_000);
    const bound = batchBound(20_000, POLICY);
    const refusal = batchRefusal(state, 'worker-a', 'plan-prepare', bound)!;
    recordBatchRefusal(state, { scope: 'worker-a', activityId: 'plan-prepare', refusal });

    const recorded = state.history.filter(e => e.type === 'batch_refused');
    expect(recorded).toHaveLength(1);
    expect(recorded[0]!.activity).toBe('plan-prepare');
    expect(recorded[0]!.data).toMatchObject({
      agentId: 'worker-a',
      limit: 'delivery_budget',
      activities: 1,
      chars: 20_000,
      maxActivities: 3,
      budgetChars: 16_000,
    });
  });
});
