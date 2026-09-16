import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, parseToolResponse, type Harness, type ToolResult } from './harness.js';
import { parseDefinition } from '../../src/utils/serialization.js';
import type { Activity, Step } from '../../src/schema/activity.schema.js';

/**
 * What a worker receives from the two activities where a reference meets another mechanism.
 *
 * `routine-cross-products.test.ts` asks the loader what it produced; this asks the server what it
 * delivered. The two are different questions wherever delivery reads something materialisation
 * wrote: a borrowed activity is composed under its source workflow, and a fanned activity is
 * delivered once per element. A loader assertion passes on both while a worker receives the wrong
 * body, so the guarantee is stated here on the payload.
 */

const CORPUS = resolve(import.meta.dirname, '../fixtures/routine-cross');

let harness: Harness;

beforeAll(async () => { harness = await createHarness({ workflowDir: CORPUS }); });
afterAll(async () => { await harness?.close(); });

const asText = (result: ToolResult): string =>
  (result.content as Array<{ type: string; text: string }>)
    .filter((part) => part.type === 'text').map((part) => part.text).join('\n');

/** The delivered activity body, parsed back out of the tool payload. */
async function deliver(workflowId: string, activityId: string): Promise<{ text: string; activity: Activity }> {
  const session = await harness.client.callTool({
    name: 'start_session',
    arguments: { workflow_id: workflowId, agent_id: 'orchestrator' },
  });
  expect(session.isError ?? false, `start_session failed: ${asText(session)}`).toBe(false);
  const sessionIndex = parseToolResponse(session as ToolResult).session_index as string;
  const opened = await harness.client.callTool({
    name: 'next_activity',
    arguments: { session_index: sessionIndex, activity_id: activityId },
  });
  expect(opened.isError ?? false, `next_activity failed: ${asText(opened)}`).toBe(false);
  const payload = await harness.client.callTool({
    name: 'get_activity',
    arguments: { activity_id: activityId, session_index: sessionIndex, context_tokens: 200000 },
  });
  expect(payload.isError ?? false, `get_activity failed: ${asText(payload)}`).toBe(false);
  const text = asText(payload);
  const body = /^(id: [\s\S]*)$/m.exec(text);
  if (!body) throw new Error(`no activity body in the delivered payload:\n${text.slice(0, 600)}`);
  return { text, activity: parseDefinition(body[1]!) as Activity };
}

const idsOf = (activity: Activity): Array<string | undefined> => {
  const out: Array<string | undefined> = [];
  const walk = (steps: Step[]): void => {
    for (const step of steps) { out.push(step.id); if (step.kind === 'loop') walk(step.steps as Step[]); }
  };
  walk(activity.steps ?? []);
  return out;
};

describe('a borrowed activity delivered by the workflow that borrowed it', () => {
  /**
   * `meta` declares a routine of the same name with a shorter body, so the wrong resolution is a
   * body a worker could act on rather than an error it would report.
   */
  it('delivers the body from the workflow the activity was authored in', async () => {
    const { activity } = await deliver('borrower-wf', 'shared-review');
    expect(idsOf(activity)).toEqual(['settle-the-scope.weigh', 'settle-the-scope.mark']);
  });

  it('delivers the site argument, not the placeholder the routine declares', async () => {
    const { text } = await deliver('borrower-wf', 'shared-review');
    expect(text).toContain('weighing the borrowed scope');
    expect(text).not.toContain('{settlement_subject}');
  });

  it('names neither the routine nor the construct in what the worker reads', async () => {
    const { text } = await deliver('borrower-wf', 'shared-review');
    expect(text).not.toContain('kind: routine');
    expect(text).not.toContain('settle-the-scope\n');
  });
});

describe('a fanned activity delivered with two references inside it', () => {
  it('delivers both runs, each under its own reference prefix', async () => {
    const { activity } = await deliver('fanned-fixture', 'probe-unit');
    expect(idsOf(activity)).toEqual([
      'first-probe.take-reading',
      'first-probe.file-reading',
      'confirming-probe.take-reading',
      'confirming-probe.file-reading',
    ]);
  });

  it('delivers ordinary steps, so the fan repeats an activity holding no reference', async () => {
    const { text, activity } = await deliver('fanned-fixture', 'probe-unit');
    const kinds = (activity.steps ?? []).map((s) => s.kind);
    expect(new Set(kinds)).toEqual(new Set(['action']));
    expect(text).not.toContain('kind: routine');
    expect(text).not.toContain('probe-one');
  });
});
