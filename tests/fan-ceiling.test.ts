/**
 * Which of the two bounds decides a fan's width, and whether the refusal names the one that did.
 *
 * A destination may declare `maxInstances`, and the schema says it narrows the server's own
 * ceiling. Two checks run: the member's own bound against its collection, then the server's bound
 * against the flattened branch count. The second is what a wide destination meets, and the message
 * the reader acts on is the one that names the bound the reader can actually move.
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

/**
 * Open the fixture's fan over a collection of the given width, and return what came back. The
 * destination travels on the call, so a run can send the fixture's own declared ceiling or none at
 * all — which is the difference between the two bounds refusing.
 */
async function fanOver(width: number, folder: string, maxInstances: number | undefined = 8): Promise<string> {
  const start = await harness.client.callTool({
    name: 'start_session',
    arguments: {
      workflow_id: 'wide-fan-fixture',
      agent_id: 'orchestrator',
      planning_folder: `${harness.workspaceDir}/.engineering/artifacts/planning/${folder}`,
    },
  });
  const sessionIndex = (JSON.parse((start.content as Array<{ text: string }>)[0]!.text) as { session_index: string }).session_index;
  await harness.client.callTool({
    name: 'next_activity',
    arguments: { session_index: sessionIndex, activity_id: 'scope-sweep' },
  });
  const opened = await harness.client.callTool({
    name: 'next_activity',
    arguments: {
      session_index: sessionIndex,
      activity_id: {
        activity: 'probe-unit', over: 'probe_targets', variable: 'probe_target',
        ...(maxInstances !== undefined ? { maxInstances } : {}),
      },
      from_activity: 'scope-sweep',
      exit: 'scoped',
      variables_changed: { probe_targets: Array.from({ length: width }, (_, i) => `unit-${i}`) },
    },
  });
  return (opened.content as Array<{ text: string }>)[0]!.text;
}

describe('a destination declaring a ceiling above the server\'s own', () => {
  it('is bounded by the server\'s ceiling, and the refusal names the bound that moves', async () => {
    // Six units, under the destination's declared eight and over the server's default of four. The
    // member's own check passes and the flattened one refuses, so the reader's fix is the server's
    // bound — and the message has to send them there rather than to the field they already declared
    // wide enough, which cannot admit them however wide it goes.
    const text = await fanOver(6, 'wide-fan-six');
    expect(text).toContain('opens 6 branches');
    expect(text).toContain("the server's configured ceiling");
    expect(text).toContain('FAN_MAX_BRANCHES');
    expect(text).toContain('maxInstances would not admit them');
  });

  it('opens every branch at a width the server admits', async () => {
    const text = await fanOver(4, 'wide-fan-four');
    expect(text).not.toContain('Cannot fan');
  });
});

describe('a destination declaring no ceiling of its own', () => {
  it('is refused by the server\'s ceiling and sent to the server\'s ceiling', async () => {
    // The bound that refused is the server's, so declaring maxInstances here is a dead end: it only
    // narrows. The message must not offer it as the remedy.
    const text = await fanOver(6, 'plain-fan-six', undefined);
    expect(text).toContain("the server's configured ceiling");
    expect(text).toContain('FAN_MAX_BRANCHES');
    expect(text).toContain('would not admit them');
  });
});
