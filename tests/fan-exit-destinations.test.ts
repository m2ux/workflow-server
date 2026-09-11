import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './e2e/harness.js';
import { sessionOps, type SessionOps } from './session-ops.js';

/**
 * get_activity hands the worker the destination exactly as the graph names it, so the envelope
 * the orchestrator passes back to next_activity can open an instance fan or a mixed list. A
 * flattened list of activity ids loses the collection and opens the wrong width.
 */
const FAN_CORPUS = resolve(import.meta.dirname, 'fixtures/fan-corpus');

let harness: Harness;

beforeAll(async () => {
  harness = await createHarness({ workflowDir: FAN_CORPUS });
});

afterAll(async () => {
  await harness.close();
});

async function destinations(
  workflowId: string,
  slug: string,
  first: string,
): Promise<Record<string, unknown>> {
  const session: SessionOps = sessionOps(harness, workflowId);
  const idx = await session.start(slug, 'w1');
  await session.enter(idx, first);
  const result = await harness.client.callTool({
    name: 'get_activity',
    arguments: { session_index: idx, context_tokens: 200_000 },
  }) as ToolResult;
  expect(result.isError).toBeFalsy();
  return (result._meta?.['exit_destinations'] ?? {}) as Record<string, unknown>;
}

describe('exit destinations carry a fan verbatim', () => {
  it('a list destination is the member list', async () => {
    const dest = await destinations('list-fan-fixture', 'exit-dest-list', 'plan-prepare');
    expect(dest).toEqual({ done: ['survey-pass', 'dependency-review'] });
  });

  it('an instance fan is the activity, collection and parameter', async () => {
    const dest = await destinations('instance-fan-fixture', 'exit-dest-instance', 'scope-sweep');
    expect(dest).toEqual({
      scoped: { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' },
    });
  });

  it('a mixed list keeps which member carries the collection', async () => {
    const dest = await destinations('mixed-fan-fixture', 'exit-dest-mixed', 'scope-sweep');
    expect(dest).toEqual({
      scoped: [
        'knowledge-survey',
        { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' },
      ],
    });
  });

  it('a dotted collection path is the path the enter will read', async () => {
    const dest = await destinations('dotted-fan-fixture', 'exit-dest-dotted', 'scope-sweep');
    expect(dest).toEqual({
      scoped: { activity: 'probe-unit', over: 'sweep_plan.roots', variable: 'probe_target' },
    });
  });
});
