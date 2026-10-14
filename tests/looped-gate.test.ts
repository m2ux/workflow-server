/**
 * A gate in a loop body asks once per round, and a worker resuming within a round is not asked
 * again (#1432).
 *
 * A checkpoint response is recorded under `<activity>-<checkpoint>`, and `yield_checkpoint` replays
 * a recorded answer without yielding, so the id a gate is yielded under is the whole of what
 * separates one round's decision from the next. A loop-body gate carries a discriminator for that
 * reason: `round-reviewed#1` and `round-reviewed#2` reach the one definition through `getCheckpoint`
 * while keying two answers. The replay is the same mechanism read the other way — a worker that
 * resumes mid-round yields the id that round already used and receives its answer rather than a
 * fresh gate, which is what keeps a resumed visit from asking a decision twice.
 *
 * Runs against the fixture corpus in tests/fixtures/looped-gate, because the loop is driven here by
 * the test rather than by the server: the loop controls are agent-owned, so the worker is what
 * counts the rounds and names each one in the id it yields.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { resolve, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { createHarness, type Harness } from './e2e/harness.js';
import { planningFolderPath } from './session-ops.js';

describe('a gate inside a loop body', () => {
  let harness: Harness;
  let client: Client;

  const planningFolder = (slug: string) => planningFolderPath(harness.workspaceDir, slug);
  const readSession = (slug: string) =>
    JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8'));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function call(name: string, args: Record<string, unknown>): Promise<any> {
    const result = await client.callTool({ name, arguments: args });
    if (result.isError) throw new Error(`${name} failed: ${(result.content as { text: string }[])[0]?.text}`);
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const text = (result: any) => (result.content as { text: string }[])[0]!.text;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (result: any) => JSON.parse(text(result));

  /** Start the fixture and enter the activity holding the loop. */
  async function enterLoop(slug: string): Promise<string> {
    const started = await call('start_session', {
      workflow_id: 'gate-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug),
    });
    const sessionIndex = (started._meta as Record<string, unknown>).session_index as string;
    await call('next_activity', { session_index: sessionIndex, activity_id: 'revise-activity' });
    return sessionIndex;
  }

  /**
   * One round's yield → respond → resume. The round is published with the yield, because the loop
   * controls are agent-owned: the worker counts the rounds, names the one it is on in the id, and
   * carries the count into the bag the message renders from.
   */
  async function answerRound(sessionIndex: string, round: number, optionId: string): Promise<void> {
    await call('yield_checkpoint', {
      session_index: sessionIndex,
      checkpoint_id: `round-reviewed#${round}`,
      variables_changed: { review_round: round },
    });
    await call('respond_checkpoint', { session_index: sessionIndex, option_id: optionId });
    await call('resume_checkpoint', { session_index: sessionIndex });
  }

  beforeAll(async () => {
    harness = await createHarness({ workflowDir: resolve(import.meta.dirname, 'fixtures/looped-gate') });
    client = harness.client;
  });

  afterAll(async () => { await harness.close(); });

  it('is presented once per round, and records the answer that round gave', async () => {
    const slug = '2026-10-14-three-rounds';
    const sessionIndex = await enterLoop(slug);

    await answerRound(sessionIndex, 1, 'revise');
    await answerRound(sessionIndex, 2, 'revise');
    await answerRound(sessionIndex, 3, 'accept');

    // Three keys, each holding the option its own round chose. One key would mean one answer
    // standing for the whole loop, which is the shape the discriminator exists to prevent.
    const stored = readSession(slug);
    expect(stored.checkpointResponses).toMatchObject({
      'revise-activity-round-reviewed#1': { optionId: 'revise' },
      'revise-activity-round-reviewed#2': { optionId: 'revise' },
      'revise-activity-round-reviewed#3': { optionId: 'accept' },
    });

    // Each round reached the user: three presentations, and no replay among them.
    const answered = stored.history.filter((h: { type: string }) => h.type === 'checkpoint_response');
    expect(answered.map((h: { checkpoint: string }) => h.checkpoint))
      .toEqual(['round-reviewed#1', 'round-reviewed#2', 'round-reviewed#3']);
    expect(stored.history.filter((h: { type: string }) => h.type === 'checkpoint_replayed')).toHaveLength(0);
  });

  it('resolves every round to the one definition the activity declares', async () => {
    const slug = '2026-10-14-one-definition';
    const sessionIndex = await enterLoop(slug);

    // The definition's id is the template; a round's id is that template resolved. Both rounds
    // present the message and options the single declaration owns.
    await answerRound(sessionIndex, 1, 'revise');

    const yielded = body(await call('yield_checkpoint', {
      session_index: sessionIndex, checkpoint_id: 'round-reviewed#2', variables_changed: { review_round: 2 },
    }));
    expect(yielded.status).not.toBe('replayed');
    expect(readSession(slug).activeCheckpoint.checkpointId).toBe('round-reviewed#2');

    // The gate the user is shown: the round's resolved id, carrying the message and the two
    // options the single declaration owns, with its round rendered from the bag.
    const presented = text(await call('present_checkpoint', { session_index: sessionIndex }));
    expect(presented).toContain('id: round-reviewed#2');
    expect(presented).toContain('Round 2: decide whether another round is owed.');
    expect(presented).toContain('revise');
    expect(presented).toContain('accept');
  });

  it('replays the answer a round already gave to a worker resuming within it', async () => {
    const slug = '2026-10-14-resume-within-round';
    const sessionIndex = await enterLoop(slug);

    await answerRound(sessionIndex, 1, 'revise');
    await answerRound(sessionIndex, 2, 'accept');

    // A worker that lost its place mid-round yields the id that round is on. The decision is
    // already taken, so it comes back rather than being put to the user a second time.
    const replayed = body(await call('yield_checkpoint', { session_index: sessionIndex, checkpoint_id: 'round-reviewed#2' }));
    expect(replayed.status).toBe('replayed');
    expect(replayed.resolved_option).toBe('accept');

    // Nothing is left outstanding: a replay returns the answer without opening a gate.
    expect(readSession(slug).activeCheckpoint).toBeUndefined();

    // And the replay is the round's own answer, not the first round's.
    const earlier = body(await call('yield_checkpoint', { session_index: sessionIndex, checkpoint_id: 'round-reviewed#1' }));
    expect(earlier.resolved_option).toBe('revise');
  });
});
