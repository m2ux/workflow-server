import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './e2e/harness.js';

/**
 * What an advance reports while a fan is in flight.
 *
 * A caller addresses a branch by its frontier entry — `get_activity` takes it, and the retirement
 * that names `from_activity` takes it — and where one activity runs once per element of a
 * collection, that entry is instance-qualified. Display names are not: every instance of one
 * activity shares one, so a list of them cannot say which branch is still outstanding.
 */
const FAN_CORPUS = resolve(import.meta.dirname, 'fixtures/fan-corpus');

let harness: Harness;

beforeAll(async () => {
  harness = await createHarness({ workflowDir: FAN_CORPUS });
});

afterAll(async () => {
  await harness.close();
});

type ToolResult = { isError?: boolean; content?: Array<{ text: string }> };

function body(result: Awaited<ReturnType<Harness['client']['callTool']>>): Record<string, unknown> {
  return JSON.parse(((result as ToolResult).content ?? [])[0]!.text) as Record<string, unknown>;
}

describe('an advance names the branches still outstanding by the id each is addressed by', () => {
  it('reports instance-qualified entries while a fan runs, and a display name when one activity does', async () => {
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'two-fans-same-activity-fixture',
        agent_id: 'orchestrator',
        planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/fan-outstanding`,
      },
    });
    const sessionIndex = (body(start) as { session_index: string }).session_index;

    // An ordinary walk holds one activity, so the response says which one by name.
    const single = await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'source-one' },
    });
    expect(body(single)).toMatchObject({ activity_id: 'source-one', name: 'Source One' });
    expect(body(single)).not.toHaveProperty('outstanding');

    const opened = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: { activity: 'probe-unit', over: 'first_targets', variable: 'probe_target' },
        from_activity: 'source-one',
        exit: 'scoped',
      },
    });
    // Three branches of one activity: three distinct ids, not three copies of one name.
    expect(body(opened)['outstanding']).toEqual(['probe-unit#0', 'probe-unit#1', 'probe-unit#2']);
    expect(body(opened)).not.toHaveProperty('name');

    // Each retirement reports what is left, still by addressable id, so the caller can tell which
    // branch it has yet to retire rather than counting repetitions of a shared name.
    const afterFirst = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'mid-point',
        from_activity: 'probe-unit#0',
        exit: 'probed',
      },
    });
    expect(body(afterFirst)['outstanding']).toEqual(['probe-unit#1', 'probe-unit#2']);

    // Down to a single outstanding branch, which is still a branch. A display name here would drop
    // the `#2` the very next call has to pass as `from_activity`.
    const afterSecond = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'mid-point',
        from_activity: 'probe-unit#1',
        exit: 'probed',
      },
    });
    expect(body(afterSecond)['outstanding']).toEqual(['probe-unit#2']);
    expect(body(afterSecond)).not.toHaveProperty('name');

    // The retirement that empties the frontier enters the convergence, which is one activity again.
    const converged = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: 'mid-point',
        from_activity: 'probe-unit#2',
        exit: 'probed',
      },
    });
    expect(body(converged)).toMatchObject({ activity_id: 'mid-point' });
    expect(body(converged)).toHaveProperty('name');
    expect(body(converged)).not.toHaveProperty('outstanding');
  });

  it('keeps naming a lone outstanding branch by id, even where that id carries no instance', async () => {
    // A destination naming an activity outright alongside one it fans: the bare member can be the
    // last branch left. Its id and its display name differ, and the caller needs the id — being able
    // to guess one from the other is the inference this reading exists to remove.
    const start = await harness.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'mixed-fan-fixture',
        agent_id: 'orchestrator',
        planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/mixed-outstanding`,
      },
    });
    const sessionIndex = (body(start) as { session_index: string }).session_index;

    await harness.client.callTool({
      name: 'next_activity',
      arguments: { session_index: sessionIndex, activity_id: 'scope-sweep' },
    });
    const opened = await harness.client.callTool({
      name: 'next_activity',
      arguments: {
        session_index: sessionIndex,
        activity_id: [
          'knowledge-survey',
          { activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target' },
        ],
        from_activity: 'scope-sweep',
        exit: 'scoped',
      },
    });
    const branches = body(opened)['outstanding'] as string[];
    expect(branches).toContain('knowledge-survey');
    expect(branches.filter((b) => b.startsWith('probe-unit#')).length).toBeGreaterThan(0);

    // Retire every fanned instance, leaving the bare member alone on the frontier.
    let last: Record<string, unknown> = {};
    for (const branch of branches.filter((b) => b !== 'knowledge-survey')) {
      const step = await harness.client.callTool({
        name: 'next_activity',
        arguments: {
          session_index: sessionIndex,
          activity_id: 'combine-probes',
          from_activity: branch,
          exit: 'probed',
        },
      });
      last = body(step);
    }
    expect(last['outstanding']).toEqual(['knowledge-survey']);
    expect(last).not.toHaveProperty('name');
  });
});
