import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, parseToolResponse, type Harness, type ToolResult } from './harness.js';
import { parseDefinition } from '../../src/utils/serialization.js';
import type { Activity, Step } from '../../src/schema/activity.schema.js';

/**
 * What a worker receives when an activity refers to a routine (#704 W02).
 *
 * Everything above this file tests the mechanism; this tests the guarantee it exists for — that no
 * consumer downstream of a routine learns the construct. The assertions are on the delivered step
 * list rather than on the absence of an error, because a test asserting "nothing went wrong" passes
 * on a broken implementation.
 *
 * This points the harness at a fixture corpus, which every other e2e file reaches through the live
 * one. The corpus declares no routine yet, so a fixture root is the only place the construct can be
 * exercised end to end at all.
 */

const FIXTURES = resolve(import.meta.dirname, '../fixtures/routines');

let harness: Harness;

beforeAll(async () => { harness = await createHarness({ workflowDir: FIXTURES }); });
afterAll(async () => { await harness?.close(); });

/** The delivered activity body, parsed back out of the tool payload. */
async function deliver(workflowId: string, activityId: string): Promise<{ text: string; activity: Activity }> {
  const asText = (result: ToolResult): string =>
    (result.content as Array<{ type: string; text: string }>)
      .filter((part) => part.type === 'text').map((part) => part.text).join('\n');

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

describe('a worker cannot tell a step came from a routine', () => {
  it('delivers ordinary steps, with no kind:routine at any depth', async () => {
    const { activity } = await deliver('host-fixture', 'refers-to-routine');
    const kinds: string[] = [];
    const walk = (steps: Step[]): void => {
      for (const step of steps) { kinds.push(step.kind); if (step.kind === 'loop') walk(step.steps as Step[]); }
    };
    walk(activity.steps ?? []);
    expect(kinds).toEqual(['action', 'checkpoint', 'loop', 'checkpoint']);
    expect(kinds).not.toContain('routine');
  });

  it('delivers the routine name nowhere in the payload', async () => {
    const { text } = await deliver('host-fixture', 'refers-to-routine');
    expect(text).not.toContain('kind: routine');
    expect(text).not.toContain('assumption-interview');
  });

  it('prefixes every delivered identifier from the reference step', async () => {
    const { activity } = await deliver('host-fixture', 'refers-to-routine');
    expect(activity.steps!.map((s) => s.id)).toEqual([
      'announce', 'review-residuals.batch-gate', 'review-residuals.interview',
    ]);
    const loop = activity.steps![2] as Extract<Step, { kind: 'loop' }>;
    expect((loop.steps as Step[])[0]!.id)
      .toBe('review-residuals.interview.decision#{refers_to_routine_review_residuals_current_assumption.id}');
  });

  it('substitutes the reference site arguments into what the worker reads', async () => {
    const { activity } = await deliver('host-fixture', 'refers-to-routine');
    const gate = activity.steps![1] as Extract<Step, { kind: 'checkpoint' }>;
    expect(gate.message).toContain('{assumption_review_presentation}');
    expect(gate.options!.map((o) => o.effect?.setVariable))
      .toEqual([{ research_assumption_outcome: 'accepted' }, { research_assumption_outcome: 'pending' }]);

    const loop = activity.steps![2] as Extract<Step, { kind: 'loop' }>;
    const perItem = (loop.steps as Step[])[0] as Extract<Step, { kind: 'checkpoint' }>;
    // The default, taken because the reference site binds nothing for it.
    expect(perItem.message).toBe('Settle this assumption using resolve-or-defer.');
  });
});

/**
 * Everything past `get_activity` — a checkpoint yielded and answered under a composed id, and a step
 * manifest reported against prefixed ids.
 *
 * Nothing had put a routine in front of this surface. Delivery proves a worker RECEIVES ordinary
 * steps; it says nothing about whether the server accepts what the worker then reports. The two
 * identifier shapes materialisation generates both land here: a prefixed checkpoint id, and a
 * prefixed id carrying the per-iteration discriminator, which the server splits on the FIRST `#` to
 * find its base definition — so a prefix using anything but a full stop would swallow it.
 */
describe('the session path a routine\'s steps reach', () => {
  it('yields and answers a checkpoint the routine contributed, under its composed id', async () => {
    const session = await harness.client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'host-fixture', agent_id: 'orchestrator' },
    });
    const sessionIndex = parseToolResponse(session as ToolResult).session_index as string;
    await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'refers-to-routine' },
    });

    const yielded = await harness.client.callTool({
      name: 'yield_checkpoint',
      arguments: { session_index: sessionIndex, checkpoint_id: 'review-residuals.batch-gate' },
    });
    expect(yielded.isError ?? false, `yield failed: ${JSON.stringify(yielded.content)}`).toBe(false);
    expect((parseToolResponse(yielded as ToolResult) as { status?: string }).status).toBe('yielded');

    // The option belongs to the routine's body; its effect writes the name the SITE bound.
    const responded = await harness.client.callTool({
      name: 'respond_checkpoint',
      arguments: { session_index: sessionIndex, option_id: 'accept-all' },
    });
    expect(responded.isError ?? false, `respond failed: ${JSON.stringify(responded.content)}`).toBe(false);

    const state = await harness.client.callTool({
      name: 'inspect_session', arguments: { session_index: sessionIndex },
    });
    expect(JSON.stringify(state.content)).toContain('research_assumption_outcome');
  });

  it('accepts a step manifest naming the prefixed ids the run produced', async () => {
    const session = await harness.client.callTool({
      name: 'start_session',
      arguments: { workflow_id: 'host-fixture', agent_id: 'orchestrator' },
    });
    const sessionIndex = parseToolResponse(session as ToolResult).session_index as string;
    await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'refers-to-routine' },
    });

    // What a worker reports having run: its own step, then the two the routine stands for.
    const advanced = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'carries-no-routine',
        from_activity: 'refers-to-routine',
        completed_steps: [
          { step_id: 'announce', output: 'announced' },
          { step_id: 'review-residuals.batch-gate', output: 'accepted' },
          { step_id: 'review-residuals.interview', output: 'walked' },
        ],
      },
    });
    expect(advanced.isError ?? false, `advance failed: ${JSON.stringify(advanced.content)}`).toBe(false);
    // A manifest naming ids the server does not hold comes back as an unexpected-step warning, so a
    // silent acceptance here would not prove the ids agree — the absence of that warning does.
    expect(JSON.stringify(advanced.content)).not.toContain('Unexpected steps');
    expect(JSON.stringify(advanced.content)).not.toContain('Missing steps');
  });
});

/**
 * The control — an activity in a routine-declaring workflow that refers to none — is asserted
 * against the raw delivery path in `routine-differential.test.ts` rather than here. Byte-identity is
 * a property of the TEXT, and the harness path wraps the body in a tool payload, so a comparison
 * made here would be against the wrapper rather than against the file.
 */
