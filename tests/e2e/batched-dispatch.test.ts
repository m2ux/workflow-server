import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHarness, type Harness, parseToolResponse, rawText, isError } from './harness.js';
import type { HistoryEntry } from '../../src/schema/state.schema.js';

/**
 * Batched dispatch over the real server (#407). What these walks pin down is the bound that makes a
 * run safe, and the gate crossings that make a batch worth having.
 *
 * The run walked is the analysis run through the middle of the main workflow — the best batch
 * candidate the investigation measured — with the implementation activity behind it as the fourth the
 * cap refuses.
 */
describe('batched dispatch (#407)', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  /** The analysis run, plus the activity behind it that no batch of three can reach. */
  const RUN = ['implementation-analysis', 'plan-prepare', 'assumptions-review', 'implement'];

  interface Walk {
    /** Response text per activity taken, in order. */
    texts: string[];
    /** `_meta.batch` per activity taken. */
    batches: Array<Record<string, unknown>>;
    /** The error message of the first refused activity, if one was refused. */
    refusedWith?: string;
    /** Which activity was refused, if one was. */
    refusedAt?: string;
    history: HistoryEntry[];
  }

  /**
   * Walk `activities` under ONE delivery scope, declaring `contextTokens` on every call, and stop at
   * the first refusal. `bundle: 'reference'` from the second activity on is what a context already
   * holding content asks for; the first takes full delivery because its ledger is empty.
   */
  async function walkBatch(scope: string, activities: string[], contextTokens: number): Promise<Walk> {
    const { client } = h;
    // A named planning folder, because the per-event data these walks read lives in the session
    // history and `inspect_session` projects that to a tally rather than to the events themselves.
    const planningFolder = join(h.workspaceDir, '.engineering/artifacts/planning', scope);
    const start = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder },
    });
    if (isError(start)) throw new Error(`start_session failed: ${rawText(start)}`);
    const sessionIndex = parseToolResponse(start).session_index as string;

    const walk: Walk = { texts: [], batches: [], history: [] };
    for (const [index, activityId] of activities.entries()) {
      const entered = await client.callTool({
        name: 'next_activity',
        arguments: { session_index: sessionIndex, activity_id: activityId },
      });
      if (isError(entered)) throw new Error(`next_activity ${activityId} failed: ${rawText(entered)}`);

      const taken = await client.callTool({
        name: 'get_activity',
        arguments: {
          session_index: sessionIndex,
          context_tokens: contextTokens,
          agent_id: scope,
          ...(index === 0 ? {} : { bundle: 'reference' }),
        },
      });
      if (isError(taken)) {
        walk.refusedWith = rawText(taken);
        walk.refusedAt = activityId;
        break;
      }
      walk.texts.push(rawText(taken));
      walk.batches.push((taken._meta as Record<string, unknown>)['batch'] as Record<string, unknown>);
    }

    const sessionFile = join(planningFolder, 'session.json');
    walk.history = (JSON.parse(readFileSync(sessionFile, 'utf8')) as { history: HistoryEntry[] }).history;
    return walk;
  }

  it('walks a run of activities in one context, collapsing what the context already holds', async () => {
    // A window wide enough that only the activity cap can bind, so this walk measures the run itself.
    const walk = await walkBatch('worker-run-batch', RUN.slice(0, 3), 2_000_000);

    expect(walk.texts).toHaveLength(3);
    // The first activity pays full; every one after it collapses against the ledger of the context
    // that is still holding the earlier payloads.
    expect(walk.texts[1]).toContain('delivery: unchanged');
    expect(walk.texts[2]).toContain('delivery: unchanged');

    // One dispatch, then the same context arriving again — not three dispatches.
    const dispatches = walk.history.filter(e => e.type === 'activity_dispatched');
    expect(dispatches.map(e => (e.data as { dispatch: string }).dispatch)).toEqual(['fresh', 'resume', 'resume']);
    expect(dispatches.map(e => e.activity)).toEqual(RUN.slice(0, 3));

    // The batch count rises with each activity the context takes.
    expect(walk.batches.map(b => b['activities'])).toEqual([1, 2, 3]);
    expect(walk.batches[0]!['max_activities']).toBe(3);
    // At the cap, the context is told not to ask again.
    expect(walk.batches[2]!['may_continue']).toBe(false);

    // The counts make the answer auditable: this run is closed by the cap, with the budget still
    // holding room, so a reviewer reading a refusal can see which limit did it.
    for (const batch of walk.batches) {
      expect(batch['delivered_chars'] as number).toBeGreaterThan(0);
      expect(batch['delivered_chars'] as number).toBeLessThan(batch['budget_chars'] as number);
    }

    // Walking on is not a second copy of anything, so nothing is recorded as one.
    expect(walk.history.filter(e => e.type === 'activity_redelivered')).toHaveLength(0);
  });

  it('refuses the fourth activity at the cap, with the payload undelivered', async () => {
    const walk = await walkBatch('worker-run-capped', RUN, 2_000_000);

    expect(walk.texts).toHaveLength(3);
    expect(walk.refusedAt).toBe('implement');
    expect(walk.refusedWith).toContain('Batch full');
    expect(walk.refusedWith).toContain('cap of 3');

    // Refused means undelivered: the fourth activity has no dispatch event for this context.
    const dispatched = walk.history.filter(e =>
      e.type === 'activity_dispatched' && (e.data as { agentId: string }).agentId === 'worker-run-capped');
    expect(dispatched.map(e => e.activity)).toEqual(RUN.slice(0, 3));

    // The limit it ran into is countable from the session.
    const refusals = walk.history.filter(e => e.type === 'batch_refused');
    expect(refusals).toHaveLength(1);
    expect(refusals[0]!.activity).toBe('implement');
    expect(refusals[0]!.data as Record<string, unknown>).toMatchObject({
      agentId: 'worker-run-capped',
      limit: 'activity_cap',
      activities: 3,
      maxActivities: 3,
    });
  });

  it('refuses on the delivery budget before the cap when the declared window is narrow', async () => {
    // A window narrow enough that the first activity alone spends the batch budget.
    const walk = await walkBatch('worker-run-narrow', RUN, 1_000);

    expect(walk.texts).toHaveLength(1);
    expect(walk.refusedAt).toBe('plan-prepare');
    expect(walk.refusedWith).toContain('over the batch budget');

    const refusals = walk.history.filter(e => e.type === 'batch_refused');
    expect(refusals).toHaveLength(1);
    expect(refusals[0]!.data as Record<string, unknown>).toMatchObject({
      limit: 'delivery_budget',
      activities: 1,
      budgetChars: 1400,
    });
    // The batch reported its own headroom as spent on the way in, so a cooperating worker stops here
    // without needing the refusal.
    expect(walk.batches[0]!['may_continue']).toBe(false);
  });

  it('serves an activity the context already holds, so a batch survives its gates', async () => {
    const { client } = h;
    const start = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator' },
    });
    const sessionIndex = parseToolResponse(start).session_index as string;
    const scope = 'worker-run-gated';

    // Fill the batch to its cap.
    for (const [index, activityId] of RUN.slice(0, 3).entries()) {
      await client.callTool({ name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: activityId } });
      const taken = await client.callTool({
        name: 'get_activity',
        arguments: {
          session_index: sessionIndex, context_tokens: 2_000_000, agent_id: scope,
          ...(index === 0 ? {} : { bundle: 'reference' }),
        },
      });
      if (isError(taken)) throw new Error(`get_activity ${activityId} failed: ${rawText(taken)}`);
    }

    // A worker at its cap resuming after a gate asks for the activity it is holding. Refusing that
    // would end every batch at its first gate, and thirteen of the main workflow's fifteen
    // activities carry one.
    const reRequest = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 2_000_000, agent_id: scope, bundle: 'reference' },
    });
    expect(isError(reRequest)).toBe(false);
    expect(rawText(reRequest)).toContain('delivery: unchanged');
    expect(((reRequest._meta as Record<string, unknown>)['batch'] as Record<string, unknown>)['activities']).toBe(3);
  });

  it('leaves the session agent unbounded, whose run is the session rather than a batch', async () => {
    // A persistent solo walk is the context that owns the whole walk by construction. Its scope is
    // the session's own agent, and the bound does not apply to it.
    const walk = await walkBatch('orchestrator', RUN, 2_000_000);

    expect(walk.texts).toHaveLength(4);
    expect(walk.refusedAt).toBeUndefined();
    expect(walk.batches.every(b => b['may_continue'] === true)).toBe(true);
    expect(walk.history.filter(e => e.type === 'batch_refused')).toHaveLength(0);
  });

  it('carries a batch across a real gate and on to its next activity, under one identity', async () => {
    // The hop the whole mechanism turns on, and the one the other cases here do not reach: a worker
    // takes an activity, stops at a gate, the orchestrator answers it, the worker resumes on the
    // activity it holds, and is then advanced to the NEXT activity of its batch — all under the
    // identity its dispatch bound. Thirteen of the main workflow's fifteen activities carry a gate, so
    // a batch that cannot survive one never reaches a second activity.
    const { client } = h;
    const scope = 'worker-run-gate-crossing';
    const planningFolder = join(h.workspaceDir, '.engineering/artifacts/planning', scope);
    const start = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder },
    });
    if (isError(start)) throw new Error(`start_session failed: ${rawText(start)}`);
    const sessionIndex = parseToolResponse(start).session_index as string;

    // First activity of the batch: full delivery into an empty context.
    await client.callTool({ name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: RUN[0] } });
    const first = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 2_000_000, agent_id: scope },
    });
    if (isError(first)) throw new Error(`get_activity ${RUN[0]} failed: ${rawText(first)}`);
    // Some of this collapses already: a technique two steps of one activity bind is deduped within
    // the single delivery. That intra-activity reuse is the floor the second delivery is read
    // against, so it is counted rather than assumed absent.
    const reusedByFirst = rawText(first).split('delivery: unchanged').length - 1;
    expect(reusedByFirst).toBeGreaterThan(0);

    // The worker reaches a gate and stops.
    const yielded = await client.callTool({
      name: 'yield_checkpoint',
      arguments: { session_index: sessionIndex, checkpoint_id: 'analysis-assumption-interview' },
    });
    if (isError(yielded)) throw new Error(`yield_checkpoint failed: ${rawText(yielded)}`);

    // The orchestrator answers it and clears the worker to continue.
    const responded = await client.callTool({
      name: 'respond_checkpoint',
      arguments: { session_index: sessionIndex, option_id: 'accept-agent-positions' },
    });
    if (isError(responded)) throw new Error(`respond_checkpoint failed: ${rawText(responded)}`);
    const resumed = await client.callTool({ name: 'resume_checkpoint', arguments: { session_index: sessionIndex } });
    if (isError(resumed)) throw new Error(`resume_checkpoint failed: ${rawText(resumed)}`);

    // Resumed on the activity it still holds: the already-taken carve-out serves it, and the batch has
    // not grown, because this is the same activity.
    const afterGate = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 2_000_000, agent_id: scope, bundle: 'reference' },
    });
    if (isError(afterGate)) throw new Error(`get_activity after gate failed: ${rawText(afterGate)}`);
    expect(rawText(afterGate)).toContain('delivery: unchanged');
    expect(((afterGate._meta as Record<string, unknown>)['batch'] as Record<string, unknown>)['activities']).toBe(1);

    // The orchestrator commits, advances, and continues the SAME worker onto the next activity.
    await client.callTool({ name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: RUN[1] } });
    const second = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 2_000_000, agent_id: scope, bundle: 'reference' },
    });
    if (isError(second)) throw new Error(`get_activity ${RUN[1]} failed: ${rawText(second)}`);

    // The batch grew across the gate, and the second activity collapsed against what the context has
    // been holding since before the gate was answered.
    const secondBatch = (second._meta as Record<string, unknown>)['batch'] as Record<string, unknown>;
    expect(secondBatch['activities']).toBe(2);
    expect(secondBatch['may_continue']).toBe(true);
    expect(rawText(second)).toContain('delivery: unchanged');
    // The claim, stated as reuse rather than as a size: arriving into a context that has held the
    // first activity since before the gate was answered, this delivery reuses strictly more than
    // that first activity could on its own. Only cross-activity reuse can put it ahead — were the
    // held context being ignored, this would collapse its own duplicates and no more, landing level
    // with the first.
    //
    // A comparison of the two deliveries' SIZES said this until seeding the review-mode flag (#599)
    // moved 21 operations into this activity's bundle, making it the larger of the two while it
    // still reuses everything the context holds. Size was never the invariant; two different
    // activities have no reason to stand in a fixed ratio. What the reuse saves in characters is
    // `batch-duration-smoke`'s floor to defend; that it happens across the gate is this test's.
    const reusedBySecond = rawText(second).split('delivery: unchanged').length - 1;
    expect(reusedBySecond, 'entries the second activity reuses from the held context')
      .toBeGreaterThan(reusedByFirst);

    const history = (JSON.parse(readFileSync(join(planningFolder, 'session.json'), 'utf8')) as { history: HistoryEntry[] }).history;
    // One dispatch, then the same context arriving twice more — across a gate and across an activity
    // boundary. A gate that cost the identity would show a second 'fresh' here.
    const dispatches = history.filter(e => e.type === 'activity_dispatched');
    expect(dispatches.map(e => (e.data as { dispatch: string }).dispatch)).toEqual(['fresh', 'resume', 'resume']);
    expect(dispatches.every(e => (e.data as { agentId: string }).agentId === scope)).toBe(true);
    // Nothing was delivered twice, which is what the gate would have cost under a fresh identity.
    expect(history.filter(e => e.type === 'activity_redelivered')).toHaveLength(0);
    expect(history.filter(e => e.type === 'batch_refused')).toHaveLength(0);
  });

  it('replays an answered gate for a replacement worker, so a failed resume costs one activity', async () => {
    // What makes a failed resume cheap: the replacement takes the current activity in full and
    // re-crosses the gate the dead worker already answered, without asking the user again. Gate
    // responses are keyed by activity with no agent component, so any worker is waved through.
    const { client } = h;
    const planningFolder = join(h.workspaceDir, '.engineering/artifacts/planning', 'worker-run-replaced');
    const start = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator', planning_folder: planningFolder },
    });
    const sessionIndex = parseToolResponse(start).session_index as string;

    await client.callTool({ name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: RUN[0] } });
    await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 2_000_000, agent_id: 'worker-doomed' },
    });
    await client.callTool({
      name: 'yield_checkpoint',
      arguments: { session_index: sessionIndex, checkpoint_id: 'analysis-assumption-interview' },
    });
    await client.callTool({
      name: 'respond_checkpoint',
      arguments: { session_index: sessionIndex, option_id: 'accept-agent-positions' },
    });

    // The worker dies. A replacement is dispatched under a NEW identity for the same activity.
    const replacement = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 2_000_000, agent_id: 'worker-replacement' },
    });
    expect(isError(replacement)).toBe(false);
    // A new context holds nothing, so it takes the activity whole — which is the one activity a failed
    // resume costs, and the reason the batch is reported per activity rather than at its end.
    expect((replacement._meta as Record<string, unknown>)['dispatch']).toBe('fresh');
    expect(((replacement._meta as Record<string, unknown>)['batch'] as Record<string, unknown>)['activities']).toBe(1);

    // Reaching the same gate, it is waved through rather than yielded to the user a second time.
    const reCross = await client.callTool({
      name: 'yield_checkpoint',
      arguments: { session_index: sessionIndex, checkpoint_id: 'analysis-assumption-interview' },
    });
    if (isError(reCross)) throw new Error(`yield_checkpoint (replay) failed: ${rawText(reCross)}`);
    expect((parseToolResponse(reCross) as { status?: string }).status).toBe('replayed');

    const history = (JSON.parse(readFileSync(join(planningFolder, 'session.json'), 'utf8')) as { history: HistoryEntry[] }).history;
    expect(history.filter(e => e.type === 'checkpoint_replayed')).toHaveLength(1);
    // The second full copy of the activity is recorded, which is what the replacement cost.
    expect(history.filter(e => e.type === 'activity_redelivered')).toHaveLength(1);
  });

  it('keeps a usage figure per activity a dispatch covered', async () => {
    const { client } = h;
    const start = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator' },
    });
    const sessionIndex = parseToolResponse(start).session_index as string;
    const scope = 'worker-run-costed';

    // One dispatch covering three activities, its cost reported at each boundary.
    for (const [index, activityId] of RUN.slice(0, 3).entries()) {
      await client.callTool({ name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: activityId } });
      await client.callTool({
        name: 'get_activity',
        arguments: {
          session_index: sessionIndex, context_tokens: 2_000_000, agent_id: scope,
          ...(index === 0 ? {} : { bundle: 'reference' }),
        },
      });
      const recorded = await client.callTool({
        name: 'record_usage',
        arguments: {
          session_index: sessionIndex,
          activity: activityId,
          agent_id: scope,
          usage: { input_tokens: 1_000 * (index + 1), output_tokens: 100 },
          basis: 'delta',
        },
      });
      if (isError(recorded)) throw new Error(`record_usage ${activityId} failed: ${rawText(recorded)}`);
    }

    const usage = await client.callTool({
      name: 'inspect_session',
      arguments: { session_index: sessionIndex, view: 'usage', agent_id: scope },
    });
    const projected = parseToolResponse(usage) as { rows?: Array<Record<string, unknown>>; totals?: Record<string, number> };
    const rows = projected.rows ?? (projected as { usage?: { rows: Array<Record<string, unknown>> } }).usage?.rows ?? [];

    // Three activities under one dispatch read as three rows, one per activity, not one figure
    // attributed to whichever of the three the orchestrator happened to name.
    expect(rows.map(r => r['activity'])).toEqual(RUN.slice(0, 3));
    expect(rows.every(r => r['agentId'] === scope)).toBe(true);
  });
});
