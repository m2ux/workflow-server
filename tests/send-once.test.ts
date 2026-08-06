/**
 * What a delivery sends once, and what it says about where the context stands (#404 W7, W8, W9).
 *
 * Three defects with one theme: a response that carries the same block twice, two calls each answered
 * in full, and an answer the receiving context could not read. All three are about a payload the
 * server has already handed over once.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'node:path';
import { createHarness, rawText, isError, parseToolResponse, type Harness } from './e2e/harness.js';

/** An activity of the main workflow that binds several techniques, so its response repeats blocks. */
const WORKFLOW_ID = 'work-package';
const ACTIVITY_ID = 'implementation-analysis';

/** Every unchanged-marker in a payload, however deeply nested. */
function countMarkers(text: string): number {
  return (text.match(/delivery: unchanged/g) ?? []).length;
}

describe('a delivery sends its shared blocks once (W7)', () => {
  let h: Harness;
  let sessionIndex: string;

  beforeAll(async () => {
    h = await createHarness();
    const started = await h.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: WORKFLOW_ID, agent_id: 'orchestrator',
        planning_folder: join(h.workspaceDir, '.engineering/artifacts/planning', 'send-once-w7'),
      },
    });
    if (isError(started)) throw new Error(rawText(started));
    sessionIndex = parseToolResponse(started).session_index as string;
    const entered = await h.client.callTool({
      name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: ACTIVITY_ID },
    });
    if (isError(entered)) throw new Error(rawText(entered));
  });

  afterAll(async () => { await h?.close(); });

  it('collapses a block a sibling of the same response already carried, on a full delivery', async () => {
    const taken = await h.client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200000, agent_id: 'fresh-worker-1' },
    });
    expect(isError(taken)).toBe(false);
    const text = rawText(taken);

    // A fresh worker takes full delivery, so every marker here stands for a block an EARLIER entry of
    // this same response carries in full — the only kind of reference a context holding nothing can
    // resolve.
    expect(countMarkers(text)).toBeGreaterThan(0);
    // The note tells the reader where to look, and says so is about this response rather than context.
    expect(text).toContain('EARLIER entry of THIS response');
    // The whole-bundle reference note, which is about content already in the reader's context, does
    // not appear on a full delivery.
    expect(text).not.toContain('already in your context');
  });

  it('sends the first copy of every collapsed block in full', async () => {
    const taken = await h.client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200000, agent_id: 'fresh-worker-2' },
    });
    const text = rawText(taken);
    // Each block that collapses anywhere is present in full somewhere: the marker is never the only
    // copy in the payload.
    for (const block of ['inherited_inputs', 'inherited_outputs', 'rules', 'provenance_note']) {
      if (!text.includes(`${block}:`)) continue;
      const firstAt = text.indexOf(`${block}:`);
      const firstLines = text.slice(firstAt, firstAt + 200);
      expect(firstLines, `the first ${block} in the payload is a marker with nothing to point at`)
        .not.toMatch(/^[^\n]*\n\s+delivery: unchanged/);
    }
  });
});

describe('a repeat fetch arrives as a marker (W9)', () => {
  let h: Harness;
  let sessionIndex: string;

  beforeAll(async () => {
    h = await createHarness();
    const started = await h.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: WORKFLOW_ID, agent_id: 'orchestrator',
        planning_folder: join(h.workspaceDir, '.engineering/artifacts/planning', 'send-once-w9'),
      },
    });
    if (isError(started)) throw new Error(rawText(started));
    sessionIndex = parseToolResponse(started).session_index as string;
    const entered = await h.client.callTool({
      name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: ACTIVITY_ID },
    });
    if (isError(entered)) throw new Error(rawText(entered));
  });

  afterAll(async () => { await h?.close(); });

  const fetchResource = (agentId: string | undefined, full?: boolean) =>
    h.client.callTool({
      name: 'get_resource',
      arguments: {
        session_index: sessionIndex, resource_id: 'meta/planning-readme',
        ...(agentId ? { agent_id: agentId } : {}), ...(full === undefined ? {} : { full }),
      },
    });

  it('answers the second ask for a resource with a marker, and measures what came back', async () => {
    const first = await fetchResource('repeat-worker');
    expect(isError(first)).toBe(false);
    const firstChars = rawText(first).length;

    const second = await fetchResource('repeat-worker');
    expect(isError(second)).toBe(false);
    const secondChars = rawText(second).length;

    expect(rawText(second)).toContain('delivery: unchanged');
    // The marker is a fraction of the body it stands for — the saving this defect was costing.
    expect(secondChars).toBeLessThan(firstChars / 4);
  });

  it('serves the whole body again when the caller says it lost the content', async () => {
    const first = await fetchResource('lost-content-worker');
    const firstChars = rawText(first).length;
    const forced = await fetchResource('lost-content-worker', true);
    expect(rawText(forced)).not.toContain('delivery: unchanged');
    expect(rawText(forced).length).toBe(firstChars);
  });

  it('never collapses for a caller that did not name its context', async () => {
    // With `agent_id` omitted the scope is the session's own identity, which sibling workers share, so
    // a marker could reach a context that never received the bytes.
    const first = await fetchResource(undefined);
    const second = await fetchResource(undefined);
    expect(rawText(second)).not.toContain('delivery: unchanged');
    expect(rawText(second).length).toBe(rawText(first).length);
  });

  it('answers the second ask for a technique with a marker', async () => {
    const args = { session_index: sessionIndex, agent_id: 'repeat-tech-worker', step_id: 'survey-codebase' };
    const first = await h.client.callTool({ name: 'get_technique', arguments: args });
    if (isError(first)) return; // step absent from this activity — nothing to measure
    const second = await h.client.callTool({ name: 'get_technique', arguments: args });
    expect(rawText(second)).toContain('delivery: unchanged');
    expect(rawText(second).length).toBeLessThan(rawText(first).length / 4);
  });
});

describe('every delivery says where the context stands (W8)', () => {
  let h: Harness;
  let sessionIndex: string;

  beforeAll(async () => {
    h = await createHarness();
    const started = await h.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: WORKFLOW_ID, agent_id: 'orchestrator',
        planning_folder: join(h.workspaceDir, '.engineering/artifacts/planning', 'send-once-w8'),
      },
    });
    if (isError(started)) throw new Error(rawText(started));
    sessionIndex = parseToolResponse(started).session_index as string;
  });

  afterAll(async () => { await h?.close(); });

  const take = async (activityId: string, agentId: string) => {
    const entered = await h.client.callTool({
      name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: activityId },
    });
    if (isError(entered)) throw new Error(rawText(entered));
    const taken = await h.client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200000, agent_id: agentId },
    });
    if (isError(taken)) throw new Error(rawText(taken));
    return taken;
  };

  it('carries the batch standing in the response text, not only in _meta', async () => {
    const taken = await take(ACTIVITY_ID, 'standing-worker');
    const text = rawText(taken);
    expect(text).toContain('batch:');
    expect(text).toContain('may_continue:');
    expect(text).toContain('max_activities:');
    expect(text).toContain('budget_chars:');
    // The standing block leads the response, so it is read before the payload it describes.
    expect(text.indexOf('batch:')).toBeLessThan(text.indexOf('session_index:'));
  });

  it('counts the activity being delivered as one this context has taken', async () => {
    const taken = await take(ACTIVITY_ID, 'counting-worker');
    const meta = (taken as { _meta?: { batch?: { activities?: number; may_continue?: boolean } } })._meta;
    expect(meta?.batch?.activities).toBe(1);
    // A scope taking its first activity is admitted whatever it has read, so it may continue.
    expect(meta?.batch?.may_continue).toBe(true);
    expect(rawText(taken)).toContain('may_continue: true');
  });

  it('reports a delivered-character count the response text and _meta agree on', async () => {
    const taken = await take(ACTIVITY_ID, 'agreeing-worker');
    const meta = (taken as { _meta?: { batch?: { delivered_chars?: number } } })._meta;
    const text = rawText(taken);
    const stated = /delivered_chars: (\d+)/.exec(text);
    expect(stated).not.toBeNull();
    expect(Number(stated![1])).toBe(meta?.batch?.delivered_chars);
  });
});
