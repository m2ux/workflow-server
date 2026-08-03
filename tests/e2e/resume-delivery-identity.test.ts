import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHarness, type Harness, parseToolResponse, rawText, isError } from './harness.js';
import type { HistoryEntry } from '../../src/schema/state.schema.js';

/**
 * Delivery identity across a gate (#408).
 *
 * A worker pauses at a checkpoint, the orchestrator resolves it, and the worker asks for its
 * activity again. Carrying the identity its dispatch bound, the second answer is markers for
 * content the worker is still holding; arriving under a fresh identity, it is the whole payload a
 * second time. The walk covers the full yield → respond → resume → re-request sequence over the
 * real server, because the earlier per-call tests could not see what a gate does to the scope.
 */
describe('delivery identity survives a gate (#408)', () => {
  let h: Harness;
  beforeAll(async () => { h = await createHarness(); });
  afterAll(async () => { await h.close(); });

  const WORKER = 'worker-start-work-package';

  async function walkToGateAndBack(agentIdOnResume: string): Promise<{
    firstChars: number;
    resumedText: string;
    history: HistoryEntry[];
  }> {
    const { client } = h;

    const start = await client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'work-package', agent_id: 'orchestrator' },
    });
    if (isError(start)) throw new Error('start_session failed');
    const startBody = parseToolResponse(start);
    const sessionIndex = startBody.session_index as string;
    const planningSlug = startBody.planning_slug as string;

    const enter = await client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'start-work-package' },
    });
    if (isError(enter)) throw new Error('next_activity failed');

    // The dispatched worker takes its payload in full — its ledger is empty.
    const dispatched = await client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200_000, agent_id: WORKER },
    });
    if (isError(dispatched)) throw new Error('get_activity (dispatch) failed');
    expect((dispatched._meta as Record<string, unknown>)['dispatch']).toBe('fresh');

    // The worker reaches a gate and stops.
    const yielded = await client.callTool({
      name: 'yield_checkpoint',
      arguments: { session_index: sessionIndex, checkpoint_id: 'review-mode-detection' },
    });
    if (isError(yielded)) throw new Error('yield_checkpoint failed');
    expect((parseToolResponse(yielded) as { status?: string }).status).toBe('yielded');

    // The orchestrator presents it, the user answers, and the worker is cleared to continue.
    const responded = await client.callTool({
      name: 'respond_checkpoint',
      arguments: { session_index: sessionIndex, option_id: 'new-implementation' },
    });
    if (isError(responded)) throw new Error('respond_checkpoint failed');
    const resumed = await client.callTool({
      name: 'resume_checkpoint',
      arguments: { session_index: sessionIndex },
    });
    if (isError(resumed)) throw new Error('resume_checkpoint failed');

    // The resumed worker asks for its activity again.
    const reRequest = await client.callTool({
      name: 'get_activity',
      arguments: {
        session_index: sessionIndex,
        context_tokens: 200_000,
        agent_id: agentIdOnResume,
        bundle: 'reference',
      },
    });
    if (isError(reRequest)) throw new Error('get_activity (resume) failed');

    const sessionFile = join(
      h.workspaceDir, '.engineering/artifacts/planning', planningSlug, 'session.json',
    );
    const state = JSON.parse(readFileSync(sessionFile, 'utf8')) as { history: HistoryEntry[] };

    return {
      firstChars: rawText(dispatched).length,
      resumedText: rawText(reRequest),
      history: state.history,
    };
  }

  it('answers the resumed worker with markers for what it already holds', async () => {
    const { firstChars, resumedText, history } = await walkToGateAndBack(WORKER);

    // Markers, not a second copy: the payload collapses and the bytes never cross the wire again.
    expect(resumedText).toContain('delivery: unchanged');
    expect(resumedText.length).toBeLessThan(firstChars / 2);

    // The server met this context before the gate, so its return is a resume.
    const dispatches = history.filter(e => e.type === 'activity_dispatched');
    expect(dispatches.map(e => (e.data as { dispatch: string }).dispatch)).toEqual(['fresh', 'resume']);
    expect(dispatches.every(e => (e.data as { agentId: string }).agentId === WORKER)).toBe(true);

    // Nothing was delivered twice, so nothing is recorded as delivered twice.
    expect(history.filter(e => e.type === 'activity_redelivered')).toHaveLength(0);
  });

  it('records the second full payload when the resume arrives under a fresh identity', async () => {
    const { firstChars, resumedText, history } = await walkToGateAndBack(`${WORKER}-scope-resume`);

    // A context the server has never met cannot read a marker, so it takes the whole activity again.
    expect(resumedText.length).toBeGreaterThan(firstChars / 2);

    const redelivered = history.filter(e => e.type === 'activity_redelivered');
    expect(redelivered).toHaveLength(1);
    expect(redelivered[0]!.data as Record<string, unknown>).toMatchObject({
      agentId: `${WORKER}-scope-resume`,
      priorAgentId: WORKER,
    });
  });
});
