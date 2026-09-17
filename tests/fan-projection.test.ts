import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './e2e/harness.js';

/**
 * Two sequential fans of one activity share a branch id. The projection reads the
 * collection of the fan whose source completed most recently, not the first
 * declaration in graph order.
 */
const FAN_CORPUS = resolve(import.meta.dirname, 'fixtures/fan-corpus');

let harness: Harness;

beforeAll(async () => {
  harness = await createHarness({ workflowDir: FAN_CORPUS });
});

afterAll(async () => {
  await harness.close();
});

type ToolResult = { isError?: boolean; content?: Array<{ text: string }>; _meta?: Record<string, unknown> };

describe('a later fan of the same activity projects its own collection', () => {
  it('the open fan is the one whose source completed most recently', async () => {
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'two-fans-same-activity-fixture',
        agent_id: 'orchestrator',
        planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/two-fans-projection`,
      },
    });
    const sessionIndex = (JSON.parse((start.content as Array<{ text: string }>)[0]!.text) as { session_index: string }).session_index;

    await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'source-one' },
    });
    await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: { activity: 'probe-unit', over: 'first_targets', variable: 'probe_target' },
        from_activity: 'source-one',
        exit: 'scoped',
      },
    });
    const first = await harness.client.callTool({
      name: 'get_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'probe-unit#0',
        context_tokens: 200_000,
        agent_id: 'worker-first-0',
      },
    }) as ToolResult;
    expect(first.isError).toBeFalsy();
    expect(first._meta?.['fan_instance']).toEqual({
      variable: 'probe_target',
      instance: 0,
      value: 'first-alpha',
    });

    for (const entry of ['probe-unit#0', 'probe-unit#1', 'probe-unit#2'] as const) {
      await harness.client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: sessionIndex,
          activity_id: 'mid-point',
          from_activity: entry,
          exit: 'probed',
        },
      });
    }
    await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'source-two',
        from_activity: 'mid-point',
        exit: 'passed',
      },
    });
    await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: { activity: 'probe-unit', over: 'second_targets', variable: 'probe_target' },
        from_activity: 'source-two',
        exit: 'scoped',
      },
    });
    const second = await harness.client.callTool({
      name: 'get_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'probe-unit#0',
        context_tokens: 200_000,
        agent_id: 'worker-second-0',
      },
    }) as ToolResult;
    expect(second.isError).toBeFalsy();
    expect(second._meta?.['fan_instance']).toEqual({
      variable: 'probe_target',
      instance: 0,
      value: 'second-x',
    });
  });
});

/**
 * The projection an instance receives is also the bag the delivery reads when it decides which
 * bound steps to inline. A branch gating a step on its own fan parameter is what tells the two
 * apart: read against the shared bag the parameter is unbound, the gate has no answer, and the
 * step stays lazy for every instance of every fan.
 */
describe('a branch\'s own parameter answers that branch\'s gates', () => {
  it('inlines a step gated on the fan parameter, rather than leaving it unanswered', async () => {
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'gated-parameter-fixture',
        agent_id: 'orchestrator',
        planning_folder: harness.workspaceDir + '/.engineering/artifacts/planning/gated-parameter',
      },
    });
    const sessionIndex = (JSON.parse((start.content as Array<{ text: string }>)[0]!.text) as { session_index: string }).session_index;

    await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'scope-sweep' },
    });
    await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' },
        from_activity: 'scope-sweep',
        exit: 'scoped',
        variables_changed: { probe_targets: ['alpha-probe', 'beta-probe'] },
      },
    });

    const branch = await harness.client.callTool({
      name: 'get_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'probe-unit#1',
        context_tokens: 200_000,
        agent_id: 'worker-gated-1',
      },
    }) as ToolResult;
    expect(branch.isError).toBeFalsy();
    // The element this instance was handed, and the gate answered against it.
    expect(branch._meta?.['fan_instance']).toEqual({
      variable: 'probe_target',
      instance: 1,
      value: 'beta-probe',
    });
    expect(branch._meta?.['bundled_steps']).toEqual(['survey']);
    // `lazy_gates` rides the response only where a gate went unanswered, so its absence is the
    // reading: nothing on this branch was left lazy for want of the parameter.
    expect(branch._meta?.['lazy_gates']).toBeUndefined();
  });
});
