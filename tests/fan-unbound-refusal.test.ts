import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './e2e/harness.js';

/**
 * A fan's branches, width and join are read off the graph, so `next_activity` opens one only on an
 * exit the graph binds to it. A fan the call names with no binding behind it is refused: on a walk's
 * opening, and off an exit the retiring activity's graph entry does not bind.
 */
const FAN_CORPUS = resolve(import.meta.dirname, 'fixtures/fan-corpus');
const FAN = { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' };

let harness: Harness;

beforeAll(async () => {
  harness = await createHarness({ workflowDir: FAN_CORPUS });
});

afterAll(async () => {
  await harness.close();
});

type ToolResult = { isError?: boolean; content?: Array<{ text: string }> };

function textOf(result: ToolResult): string {
  return result.content?.[0]?.text ?? '';
}

async function start(slug: string, workflowId = 'instance-fan-fixture'): Promise<string> {
  const opened = await harness.client.callTool({
    name: 'start_session',
    arguments: {
      workflow_id: workflowId,
      agent_id: 'orchestrator',
      planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/${slug}`,
    },
  }) as ToolResult;
  return (JSON.parse(textOf(opened)) as { session_index: string }).session_index;
}

async function advance(args: Record<string, unknown>): Promise<ToolResult> {
  return await harness.client.callTool({ name: 'next_activity', arguments: args }) as ToolResult;
}

describe('next_activity opens a fan only on an exit the graph binds to it', () => {
  it('refuses a fan named on the walk\'s opening', async () => {
    const idx = await start('fan-unbound-opening');
    const refused = await advance({ session_index: idx, activity_id: FAN, variables_changed: { probe_targets: ['a', 'b'] } });
    expect(refused.isError).toBe(true);
    expect(textOf(refused)).toMatch(/Cannot open the fan to 'probe-unit' on the walk's opening/);
    expect(textOf(refused)).toMatch(/the walk opens on 'scope-sweep'/);

    const status = await harness.client.callTool({ name: 'get_workflow_status', arguments: { session_index: idx } }) as ToolResult;
    const read = JSON.parse(textOf(status)) as { in_flight: string[]; variables: Record<string, unknown> };
    expect(read.in_flight).toEqual([]);
    expect(read.variables['probe_targets']).not.toEqual(['a', 'b']);
  });

  it('refuses a list fan named on the walk\'s opening', async () => {
    const idx = await start('fan-unbound-list-opening', 'list-fan-fixture');
    const refused = await advance({ session_index: idx, activity_id: ['survey-pass', 'dependency-review'] });
    expect(refused.isError).toBe(true);
    expect(textOf(refused)).toMatch(/Cannot open the fan to 'survey-pass, dependency-review' on the walk's opening/);
  });

  it('refuses a fan named with no exit off an activity that binds no fan', async () => {
    const idx = await start('fan-unbound-no-exit', 'list-fan-fixture');
    await advance({ session_index: idx, activity_id: 'plan-prepare' });
    await advance({ session_index: idx, activity_id: ['survey-pass', 'dependency-review'], from_activity: 'plan-prepare', exit: 'done' });
    const refused = await advance({
      session_index: idx,
      activity_id: ['survey-pass', 'dependency-review'],
      from_activity: 'survey-pass',
      agent_id: 'survey-worker',
    });
    expect(refused.isError).toBe(true);
    expect(textOf(refused)).toMatch(/off 'survey-pass' with no 'exit' named/);
    expect(textOf(refused)).toMatch(/'survey-pass' binds no fan to any exit/);
  });

  it('refuses a fan named off an exit the retiring activity\'s graph entry does not bind', async () => {
    const idx = await start('fan-unbound-exit');
    await advance({ session_index: idx, activity_id: 'scope-sweep' });
    const refused = await advance({
      session_index: idx,
      activity_id: FAN,
      from_activity: 'scope-sweep',
      exit: 'swept',
      variables_changed: { probe_targets: ['a', 'b'] },
    });
    expect(refused.isError).toBe(true);
    expect(textOf(refused)).toMatch(/through exit 'swept', which 'scope-sweep' does not declare/);
    expect(textOf(refused)).toMatch(/'scoped' opens a fan/);

    const status = await harness.client.callTool({ name: 'get_workflow_status', arguments: { session_index: idx } }) as ToolResult;
    expect((JSON.parse(textOf(status)) as { in_flight: string[] }).in_flight).toEqual(['scope-sweep']);
  });

  it('opens the fan the graph binds to the exit named, whatever activity_id holds', async () => {
    const idx = await start('fan-bound-exit');
    await advance({ session_index: idx, activity_id: 'scope-sweep' });
    const opened = await advance({
      session_index: idx,
      activity_id: 'probe-unit',
      from_activity: 'scope-sweep',
      exit: 'scoped',
      variables_changed: { probe_targets: ['a', 'b'] },
    });
    expect(opened.isError).toBeFalsy();
    const body = JSON.parse(textOf(opened)) as { fan: Array<{ branches: string[] }>; barrier: { destination: string } };
    expect(body.fan.flatMap((member) => member.branches)).toHaveLength(2);
    expect(body.barrier.destination).toBe('combine-probes');
  });
});
