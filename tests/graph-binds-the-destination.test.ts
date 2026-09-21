/**
 * Where a call names the activity it retires and the exit that activity took, the destination it
 * enters is the one the graph binds there — including that destination's shape.
 *
 * The shape is the part a caller cannot restate. An exit bound to a fan opens one branch per
 * element of the collection it names, and a fan over one activity names the same single activity a
 * plain destination to it would. Read off the caller, the two are the same call; read off the
 * graph, only one of them is expressible.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { createHarness, type Harness } from './e2e/harness.js';

const FAN_CORPUS = resolve(import.meta.dirname, 'fixtures/fan-corpus');

let harness: Harness;

beforeAll(async () => {
  harness = await createHarness({ workflowDir: FAN_CORPUS });
});

afterAll(async () => {
  await harness.close();
});

const text = (result: unknown): string =>
  ((result as { content: Array<{ text: string }> }).content)[0]!.text;

/**
 * Walk the fixture to the fan and take its exit, naming the destination however the caller chose.
 * The collection is three wide, under both the destination's declared ceiling and the server's.
 */
async function takeTheFanExit(folder: string, activityId: unknown): Promise<string> {
  const start = await harness.client.callTool({
    name: 'start_session',
    arguments: {
      workflow_id: 'wide-fan-fixture',
      agent_id: 'orchestrator',
      planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/${folder}`,
    },
  });
  const sessionIndex = (JSON.parse(text(start)) as { session_index: string }).session_index;
  await harness.client.callTool({
    name: 'next_activity',
    arguments: { session_index: sessionIndex, activity_id: 'scope-sweep' },
  });
  const opened = await harness.client.callTool({
    name: 'next_activity',
    arguments: {
      session_index: sessionIndex,
      activity_id: activityId,
      from_activity: 'scope-sweep',
      exit: 'scoped',
      variables_changed: { probe_targets: ['unit-0', 'unit-1', 'unit-2'] },
    },
  });
  return text(opened);
}

describe('an exit the graph binds to a fan', () => {
  it('opens the collection\'s width when the call names the destination the graph names', async () => {
    const answer = JSON.parse(await takeTheFanExit('fan-by-destination', {
      activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target',
    })) as { outstanding?: string[] };
    expect(answer.outstanding).toEqual(['probe-unit#0', 'probe-unit#1', 'probe-unit#2']);
  });

  it('opens the collection\'s width when the call names the fan\'s activity alone', async () => {
    // The caller says less than the graph does. What the graph states still decides, so the branch
    // count is the collection's length rather than the one branch a bare id reads as.
    const answer = JSON.parse(await takeTheFanExit('fan-by-bare-id', 'probe-unit')) as { outstanding?: string[] };
    expect(answer.outstanding).toEqual(['probe-unit#0', 'probe-unit#1', 'probe-unit#2']);
  });

  it('opens the collection\'s width when the call names the activity the fan converges on', async () => {
    // A caller that reads past the fan to its meeting point has still named the exit, and the exit
    // is bound to the fan.
    const answer = JSON.parse(await takeTheFanExit('fan-by-join', 'combine-probes')) as { outstanding?: string[] };
    expect(answer.outstanding).toEqual(['probe-unit#0', 'probe-unit#1', 'probe-unit#2']);
  });
});
