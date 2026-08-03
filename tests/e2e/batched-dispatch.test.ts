import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHarness, type Harness, parseToolResponse, rawText, isError } from './harness.js';
import type { HistoryEntry } from '../../src/schema/state.schema.js';

/**
 * Batched dispatch over the real server (#407).
 *
 * One worker context walks a run of activities. The saving is the context establishment it does not
 * re-pay, so what these walks pin down is the bound that makes the run safe: the second and third
 * activities collapse against what the context already holds, and the fourth is refused with the
 * payload undelivered.
 *
 * The run walked is the analysis run through the middle of the main workflow — the batch candidate
 * measured at 32% delivery collapse — with the implementation activity behind it as the fourth
 * activity the cap refuses.
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
