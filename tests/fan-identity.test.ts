import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './e2e/harness.js';
import { createInitialSessionFile, type SessionFile } from '../src/schema/session.schema.js';
import { fanIdentityRefusal, recordDispatch } from '../src/utils/dispatch.js';

/**
 * While a fan is in flight, each branch takes its own identity. A shared or session-equal
 * agent_id collapses the delivery ledger and sits outside the batch bound.
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

function session(frontier: string[]): SessionFile {
  const state = createInitialSessionFile({
    sessionIndex: 'AAAAAA',
    workflowId: 'instance-fan-fixture',
    workflowVersion: '1.0.0',
    agentId: 'orchestrator',
  });
  state.frontier = frontier;
  return state;
}

function textOf(result: ToolResult): string {
  return result.content?.[0]?.text ?? '';
}

describe('fanIdentityRefusal', () => {
  it('admits an ordinary walk, including the session agent', () => {
    const state = session(['scope-sweep']);
    expect(fanIdentityRefusal(state, undefined, 'scope-sweep')).toBeUndefined();
    expect(fanIdentityRefusal(state, 'orchestrator', 'scope-sweep')).toBeUndefined();
  });

  it('refuses an omitted or session-equal identity while several are in flight', () => {
    const state = session(['probe-unit#0', 'probe-unit#1']);
    expect(fanIdentityRefusal(state, undefined, 'probe-unit#0')).toMatch(/Pass agent_id/);
    expect(fanIdentityRefusal(state, 'orchestrator', 'probe-unit#0')).toMatch(/Pass agent_id/);
  });

  it('refuses an identity that already holds a sibling, and admits a resume or replacement of the same entry', () => {
    const state = session(['probe-unit#0', 'probe-unit#1']);
    recordDispatch(state, { scope: 'worker-a', kind: 'fresh', activityId: 'probe-unit#0', chars: 100 });

    expect(fanIdentityRefusal(state, 'worker-a', 'probe-unit#1')).toMatch(/already holds 'probe-unit#0'/);
    expect(fanIdentityRefusal(state, 'worker-a', 'probe-unit#0')).toBeUndefined();
    expect(fanIdentityRefusal(state, 'worker-b', 'probe-unit#0')).toBeUndefined();
    expect(fanIdentityRefusal(state, 'worker-b', 'probe-unit#1')).toBeUndefined();
  });
});

describe('get_activity while a fan is in flight', () => {
  async function openFan(slug: string): Promise<{ idx: string; branches: string[] }> {
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'instance-fan-fixture',
        agent_id: 'orchestrator',
        planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/${slug}`,
      },
    }) as ToolResult;
    const idx = (JSON.parse(textOf(start)) as { session_index: string }).session_index;
    await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: idx, activity_id: 'scope-sweep' },
    });
    const opened = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: idx,
        activity_id: { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' },
        from_activity: 'scope-sweep',
        exit: 'scoped',
        variables_changed: { probe_targets: ['a', 'b'] },
      },
    }) as ToolResult;
    const branches = ((opened._meta?.['fan'] as Array<{ branches: string[] }> | undefined) ?? [])
      .flatMap((member) => member.branches);
    return { idx, branches };
  }

  async function load(
    idx: string,
    activityId: string,
    agentId?: string,
  ): Promise<ToolResult> {
    return await harness.client.callTool({
      name: 'get_activity',
      arguments: {
        session_index: idx,
        context_tokens: 200_000,
        activity_id: activityId,
        ...(agentId !== undefined ? { agent_id: agentId } : {}),
      },
    }) as ToolResult;
  }

  it('refuses an omitted identity, the session agent, and a sibling\'s identity, and serves a unique one', async () => {
    const { idx, branches } = await openFan('fan-identity-wire');
    expect(branches).toEqual(['probe-unit#0', 'probe-unit#1']);

    const omitted = await load(idx, 'probe-unit#0');
    expect(omitted.isError).toBeTruthy();
    expect(textOf(omitted)).toMatch(/Pass agent_id/);

    const sessionAgent = await load(idx, 'probe-unit#0', 'orchestrator');
    expect(sessionAgent.isError).toBeTruthy();
    expect(textOf(sessionAgent)).toMatch(/Pass agent_id/);

    const first = await load(idx, 'probe-unit#0', 'worker-a');
    expect(first.isError).toBeFalsy();

    const sibling = await load(idx, 'probe-unit#1', 'worker-a');
    expect(sibling.isError).toBeTruthy();
    expect(textOf(sibling)).toMatch(/already holds 'probe-unit#0'/);

    const second = await load(idx, 'probe-unit#1', 'worker-b');
    expect(second.isError).toBeFalsy();

    const resume = await load(idx, 'probe-unit#0', 'worker-a');
    expect(resume.isError).toBeFalsy();

    const replacement = await load(idx, 'probe-unit#0', 'worker-c');
    expect(replacement.isError).toBeFalsy();
  });
});
