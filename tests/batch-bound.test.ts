import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createInitialSessionFile, type SessionFile } from '../src/schema/session.schema.js';
import {
  batchActivities,
  batchBound,
  batchState,
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

/**
 * Where the refusal sits in `get_activity` is an invariant no behavioural test can see: both
 * placements deliver the same verdict, and the one that is wrong only loses a concurrent write under a
 * race. So it is asserted against the source. The success path a few lines below deliberately RE-LOADS
 * the session before saving, because composition awaits dozens of reads in between; the refusal path
 * is correct precisely by having nothing to re-load, and a later edit that slips an await in front of
 * it would reintroduce the lost update silently.
 */
describe('refusal placement in get_activity (#407)', () => {
  it('has no await between the session load and the refusal save', () => {
    const source = readFileSync(new URL('../src/tools/workflow-tools.ts', import.meta.url), 'utf8');
    // Anchored inside the get_activity handler — the same load line appears in every session tool.
    const handler = source.indexOf("server.tool('get_activity'");
    expect(handler).toBeGreaterThan(-1);

    const LOAD = 'const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);';
    const load = source.indexOf(LOAD, handler);
    const save = source.indexOf('await saveSessionForTool(loaded, refused);', handler);
    expect(load).toBeGreaterThan(handler);
    expect(save).toBeGreaterThan(load);

    // Comments in that span discuss the invariant by name, so read the code alone.
    const code = source.slice(load + LOAD.length, save)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
    expect(code).not.toContain('await');
  });
});

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
    // A lazy technique fetch is content no activity payload carried, so it counts.
    state.history.push({
      timestamp: new Date().toISOString(), type: 'technique_fetched', activity: 'implementation-analysis',
      data: { techniqueId: 't1', stepId: 's1', agentId: 'worker-a', chars: 500, delivery: 'full' },
    });
    // Collapsed content cost the receiving context nothing.
    state.history.push({
      timestamp: new Date().toISOString(), type: 'technique_fetched', activity: 'plan-prepare',
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

  it('charges eagerly bundled content once, the activity payload it travelled inside', () => {
    const state = session();
    // The activity payload IS the whole response, bundled techniques and resources included; their
    // own events exist for observability, and adding them charges the same bytes twice.
    deliver(state, 'worker-a', 'implementation-analysis', 1_000);
    state.history.push({
      timestamp: new Date().toISOString(), type: 'technique_bundled', activity: 'implementation-analysis',
      data: { techniqueId: 't1', stepId: 's1', agentId: 'worker-a', chars: 400, delivery: 'full' },
    });
    state.history.push({
      timestamp: new Date().toISOString(), type: 'resource_fetched', activity: 'implementation-analysis',
      data: { resourceId: 'r1', agentId: 'worker-a', bundled: true, chars: 300, delivery: 'full' },
    });

    expect(deliveredChars(state, 'worker-a')).toBe(1_000);
  });

  it('spends no activity slot on a context that only fetched a technique', () => {
    const state = session();
    // An out-of-band context announces itself on its first server call of any kind, which may be a
    // technique or resource fetch. That dispatch event carries no size because no activity payload
    // was delivered — counting the activity the session happened to be on would spend a slot the
    // context never received, and the refusal would then state a count it cannot account for.
    state.history.push({
      timestamp: new Date().toISOString(), type: 'activity_dispatched', activity: 'implementation-analysis',
      data: { agentId: 'worker-a', dispatch: 'fresh' },
    });
    expect(batchActivities(state, 'worker-a')).toEqual([]);

    deliver(state, 'worker-a', 'implementation-analysis', 1_000);
    expect(batchActivities(state, 'worker-a')).toEqual(['implementation-analysis']);
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
    // 200,000 tokens × 0.35 headroom × 4 characters a token.
    expect(batchBound(200_000, POLICY)).toEqual({ maxActivities: 3, budgetChars: 280_000 });
    // A fractional cap floors, and a cap below one still admits the activity a dispatch was made for.
    expect(batchBound(1_000, { ...POLICY, maxActivities: 2.9 }).maxActivities).toBe(2);
    expect(batchBound(1_000, { ...POLICY, maxActivities: 0.4 }).maxActivities).toBe(1);
  });

  it('floors a budget that does not divide evenly, so the reported figure is the enforced one', () => {
    // 1,001 × 0.35 × 4 = 1,401.4. Reporting 1,401 while comparing against 1,401.4 would make the
    // recorded budget a number that was never applied.
    expect(batchBound(1_001, POLICY).budgetChars).toBe(1_401);
  });

  it('admits a batch sitting exactly on its budget, and refuses the character after it', () => {
    const bound = batchBound(1_000, POLICY);
    expect(bound.budgetChars).toBe(1_400);

    const atBudget = session();
    deliver(atBudget, 'worker-a', 'implementation-analysis', 1_400);
    expect(batchRefusal(atBudget, 'worker-a', 'plan-prepare', bound)).toBeUndefined();

    const overBudget = session();
    deliver(overBudget, 'worker-a', 'implementation-analysis', 1_401);
    expect(batchRefusal(overBudget, 'worker-a', 'plan-prepare', bound)).toMatchObject({ limit: 'delivery_budget' });
  });

  it('answers may-continue as the exact complement of a refusal, boundary included', () => {
    // At the boundary the two must agree: a batch exactly on its budget is admitted, so it must also
    // be told to continue. Expressed separately, they drifted here.
    const bound = batchBound(1_000, POLICY);
    for (const chars of [0, 1, 1_399, 1_400, 1_401, 9_999]) {
      const state = session();
      deliver(state, 'worker-a', 'implementation-analysis', chars);
      const refused = batchRefusal(state, 'worker-a', 'plan-prepare', bound) !== undefined;
      expect(batchState(state, 'worker-a', bound).mayContinue).toBe(!refused);
    }

    // And at the cap, with the budget untouched.
    const capped = session();
    for (const activity of ['implementation-analysis', 'plan-prepare', 'assumptions-review']) {
      deliver(capped, 'worker-a', activity, 1);
    }
    expect(batchState(capped, 'worker-a', bound).mayContinue).toBe(false);
    expect(batchRefusal(capped, 'worker-a', 'implement', bound)).toMatchObject({ limit: 'activity_cap' });

    // The session's own agent is outside the question entirely.
    expect(batchState(capped, 'orchestrator', bound).mayContinue).toBe(true);
  });

  it('leaves a context that has taken no activity alone, whatever it read lazily', () => {
    // An out-of-band context announces itself on a technique or resource fetch and can read a great
    // deal before taking an activity at all. It has no batch to be past the end of, so neither side of
    // the bound may act on it — one real session already sits in this shape.
    const state = session();
    state.history.push({
      timestamp: new Date().toISOString(), type: 'activity_dispatched', activity: 'implementation-analysis',
      data: { agentId: 'oob-worker', dispatch: 'fresh' },
    });
    state.history.push({
      timestamp: new Date().toISOString(), type: 'technique_fetched', activity: 'implementation-analysis',
      data: { techniqueId: 't1', agentId: 'oob-worker', chars: 300_000, delivery: 'full' },
    });

    const bound = batchBound(200_000, POLICY);
    expect(deliveredChars(state, 'oob-worker')).toBe(300_000);
    expect(batchState(state, 'oob-worker', bound).activities).toEqual([]);
    expect(batchState(state, 'oob-worker', bound).mayContinue).toBe(true);
    expect(batchRefusal(state, 'oob-worker', 'implementation-analysis', bound)).toBeUndefined();
  });

  it('names the activity cap when both limits bind, because the tally is read per limit', () => {
    // Which limit binds depends on how heavy the workflow's activities are, and the tally is read per
    // limit, so which one a refusal reports decides what the settings are revised from.
    const state = session();
    for (const activity of ['implementation-analysis', 'plan-prepare', 'assumptions-review']) {
      deliver(state, 'worker-a', activity, 200_000);
    }
    expect(batchRefusal(state, 'worker-a', 'implement', batchBound(200_000, POLICY))).toMatchObject({ limit: 'activity_cap' });
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
    // One activity, and it alone has spent more than a 20,000-token window's batch budget of 28,000.
    deliver(state, 'worker-a', 'implementation-analysis', 30_000);

    const refusal = batchRefusal(state, 'worker-a', 'plan-prepare', batchBound(20_000, POLICY));
    expect(refusal).toMatchObject({ limit: 'delivery_budget', activities: 1, chars: 30_000 });
    expect(batchRefusalMessage('plan-prepare', 'worker-a', refusal!)).toContain('batch budget of 28000');
  });

  it('leaves the session own agent unbounded, whose run is the session rather than a batch', () => {
    const state = session();
    deliver(state, 'orchestrator', 'implementation-analysis', 1_000_000);
    deliver(state, 'orchestrator', 'plan-prepare', 1_000_000);
    deliver(state, 'orchestrator', 'assumptions-review', 1_000_000);

    expect(batchRefusal(state, 'orchestrator', 'implement', batchBound(200_000, POLICY))).toBeUndefined();
  });

  it('tells the refused caller the replacement needs a new identity', () => {
    // The one thing that has to change is the thing the message must not omit: the bound is keyed on
    // the identity, so re-dispatching under the same one is refused again, and a genuinely fresh
    // context under a used identity would receive markers for bytes it does not hold.
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 30_000);
    const refusal = batchRefusal(state, 'worker-a', 'plan-prepare', batchBound(20_000, POLICY))!;
    const message = batchRefusalMessage('plan-prepare', 'worker-a', refusal);

    expect(message).toContain('NEW');
    expect(message).toContain('agent_id');
    expect(message).toContain('worker-a');
  });

  it('records a refusal once per limit, so the tally counts limits rather than retries', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 30_000);
    const bound = batchBound(20_000, POLICY);
    const refusal = batchRefusal(state, 'worker-a', 'plan-prepare', bound)!;
    // A caller that retries a refused activity is refused again. A tally that counted retries would
    // report how insistent a worker was, not how often a limit bound — and the settings are revised
    // from the latter.
    recordBatchRefusal(state, { scope: 'worker-a', activityId: 'plan-prepare', refusal });
    recordBatchRefusal(state, { scope: 'worker-a', activityId: 'plan-prepare', refusal });
    recordBatchRefusal(state, { scope: 'worker-a', activityId: 'plan-prepare', refusal });
    expect(state.history.filter(e => e.type === 'batch_refused')).toHaveLength(1);

    // A different activity, a different limit, or a different CONTEXT is a different fact. Collapsing
    // two workers refused on the same activity into one row would undercount the very figure the
    // settings are revised from.
    recordBatchRefusal(state, { scope: 'worker-a', activityId: 'assumptions-review', refusal });
    recordBatchRefusal(state, { scope: 'worker-a', activityId: 'plan-prepare', refusal: { ...refusal, limit: 'activity_cap' } });
    recordBatchRefusal(state, { scope: 'worker-b', activityId: 'plan-prepare', refusal });
    expect(state.history.filter(e => e.type === 'batch_refused')).toHaveLength(4);
  });

  it('records the limit a refusal met, with the arithmetic that produced it', () => {
    const state = session();
    deliver(state, 'worker-a', 'implementation-analysis', 30_000);
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
      chars: 30_000,
      maxActivities: 3,
      budgetChars: 28_000,
    });
  });
});
