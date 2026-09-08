/**
 * Two writes against one session file (#655).
 *
 * A tool call reads the whole state file, changes part of it in memory, and
 * writes the whole file back. A parent and its launched children live in ONE
 * file, so two of them advancing at once is two writes against one file. The
 * store admits the second only while the file still holds the bytes the second
 * call read; otherwise the write is refused and nothing already recorded is
 * discarded.
 *
 * The store-level suite states the property exactly. The wire-level suite puts
 * two calls in flight at once and asserts the outcome either way: whichever
 * calls succeed are all present in the file afterwards, and a refused call
 * leaves no trace of itself.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { readFileSync } from 'node:fs';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  PLANNING_RELATIVE_DIR,
  SessionStoreError,
  advanceSession,
  computeSessionIndex,
  describeSessionStoreError,
  ensurePlanningFolder,
  loadSessionForTool,
  saveSessionForTool,
  verifySeal,
  writeSessionFile,
} from '../src/utils/session/index.js';
import { createInitialSessionFile, type SessionFile } from '../src/schema/session.schema.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { planningFolderPath } from './session-ops.js';

/** History entries of one type, as stored. */
function events(state: SessionFile, type: string): SessionFile['history'] {
  return state.history.filter((h) => h.type === type);
}

describe('compare-and-swap on the session file (#655)', () => {
  let workspace: string;
  let folder: string;
  let sessionIndex: string;
  const loadOpts = { planningRelativeDir: PLANNING_RELATIVE_DIR };

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'sx-cas-'));
    folder = await ensurePlanningFolder(workspace, '2026-09-08-cas');
    sessionIndex = await computeSessionIndex(folder);
    await writeSessionFile(folder, createInitialSessionFile({
      sessionIndex,
      workflowId: 'work-package',
      workflowVersion: '1.0.0',
      agentId: 'orchestrator',
    }));
  });

  afterAll(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  /** Append one history event, the shape every mutating tool writes. */
  const mark = (state: SessionFile, activity: string): SessionFile =>
    advanceSession(state, (draft) => {
      draft.history.push({ timestamp: new Date().toISOString(), type: 'activity_usage', activity });
    });

  it('refuses the second of two writes composed from the same read', async () => {
    const first = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    const second = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    expect(second.bytes).toBe(first.bytes);

    await saveSessionForTool(first, mark(first.state, 'first'));

    await expect(saveSessionForTool(second, mark(second.state, 'second')))
      .rejects.toMatchObject({ name: 'SessionStoreError', code: 'STALE_WRITE' });

    // The write that landed is intact, and the refused one recorded nothing.
    const { state } = await verifySeal(folder);
    const stored = state as SessionFile;
    expect(events(stored, 'activity_usage').map((h) => h.activity)).toEqual(['first']);
  });

  it('admits the refused write once it is composed against the current state', async () => {
    const first = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    const stale = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    await saveSessionForTool(first, mark(first.state, 'first'));
    await expect(saveSessionForTool(stale, mark(stale.state, 'second'))).rejects.toThrow();

    const reloaded = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    await saveSessionForTool(reloaded, mark(reloaded.state, 'second'));

    const { state } = await verifySeal(folder);
    expect(events(state as SessionFile, 'activity_usage').map((h) => h.activity))
      .toEqual(['first', 'second']);
  });

  it('leaves the seal matching the state and no staged files behind', async () => {
    const first = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    const stale = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    await saveSessionForTool(first, mark(first.state, 'first'));
    await expect(saveSessionForTool(stale, mark(stale.state, 'second'))).rejects.toThrow();

    // A refused write is not a torn one: the pair still verifies, and the
    // staged copies it never published are gone.
    await expect(verifySeal(folder)).resolves.toBeTruthy();
    const entries = await readdir(folder);
    expect(entries.filter((e) => e.includes('.tmp.'))).toHaveLength(0);
  });

  it('tells the caller what to do about a refusal', () => {
    // The refusal reaches an agent as this text and nothing else. It has to
    // name the action, and say that repeating the call records once rather
    // than twice — an agent that cannot tell will either stall or double up.
    const described = describeSessionStoreError(
      new SessionStoreError('stale write refused for /planning/x', 'STALE_WRITE'),
    );
    expect(described).toContain('stale write refused for /planning/x');
    expect(described).toContain('CALL THIS TOOL AGAIN');
    expect(described).toContain('Nothing was written');
    expect(described).toContain('not a double-record');
  });

  it('refuses a write whose file has gone', async () => {
    const loaded = await loadSessionForTool(workspace, sessionIndex, loadOpts);
    await rm(join(folder, 'session.json'));
    const err = await saveSessionForTool(loaded, mark(loaded.state, 'orphan')).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SessionStoreError);
    expect((err as SessionStoreError).code).toBe('STALE_WRITE');
  });
});

describe('two calls in flight against one session file (#655)', () => {
  let harness: Harness;
  let client: Client;
  const planningFolder = (slug: string) => planningFolderPath(harness.workspaceDir, slug);
  const readSession = (slug: string): SessionFile =>
    JSON.parse(readFileSync(join(planningFolder(slug), 'session.json'), 'utf8')) as SessionFile;

  beforeAll(async () => {
    harness = await createHarness({ workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model') });
    client = harness.client;
  });

  afterAll(async () => { await harness.close(); });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ToolResult = any;

  const callTool = (name: string, args: Record<string, unknown>): Promise<ToolResult> =>
    client.callTool({ name, arguments: args }) as Promise<ToolResult>;

  async function call(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const result = await callTool(name, args);
    if (result.isError) throw new Error(`${name} failed: ${(result.content as { text: string }[])[0]?.text}`);
    return result;
  }

  function body(result: ToolResult): Record<string, unknown> {
    return JSON.parse((result.content as { text: string }[])[0]!.text) as Record<string, unknown>;
  }

  /**
   * Text of a failed call, asserted to be the refusal rather than some other
   * fault — and to carry the instruction that gets the caller moving again.
   * An agent reads this text and nothing else: a refusal it cannot act on is
   * a stall, so the nudge to repeat the call is part of the contract.
   */
  function refusalText(result: ToolResult): string {
    const text = (result.content as { text: string }[])[0]?.text ?? '';
    expect(text).toContain('stale write refused');
    expect(text).toContain('CALL THIS TOOL AGAIN');
    expect(text).toContain('Nothing was written');
    return text;
  }

  async function start(slug: string): Promise<string> {
    const started = await call('start_session', {
      workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(slug),
    });
    return (started._meta as Record<string, unknown>).session_index as string;
  }

  const usageArgs = (sessionIndex: string, activity: string) => ({
    session_index: sessionIndex, activity, usage: { total_tokens: 10 }, basis: 'delta' as const,
  });

  it('records every call that succeeds, and refuses the rest', async () => {
    const slug = '2026-09-08-overlap-one-session';
    const sessionIndex = await start(slug);

    // Both requests are in flight before either handler returns.
    const results = await Promise.all([
      callTool('record_usage', usageArgs(sessionIndex, 'first')),
      callTool('record_usage', usageArgs(sessionIndex, 'second')),
    ]);

    const succeeded = results.filter((r) => !r.isError);
    for (const failed of results.filter((r) => r.isError)) refusalText(failed);
    expect(succeeded.length).toBeGreaterThanOrEqual(1);

    // Whatever was admitted is in the file. Under a lost update the count is
    // one while both calls reported success.
    const stored = readSession(slug);
    expect(events(stored, 'activity_usage')).toHaveLength(succeeded.length);
  });

  it('gives two overlapping dispatches distinct children, or refuses one', async () => {
    const slug = '2026-09-08-overlap-dispatch';
    const sessionIndex = await start(slug);

    const results = await Promise.all([
      callTool('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture' }),
      callTool('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture' }),
    ]);

    const succeeded = results.filter((r) => !r.isError);
    for (const failed of results.filter((r) => r.isError)) refusalText(failed);
    expect(succeeded.length).toBeGreaterThanOrEqual(1);

    const dispatched = succeeded.map((r) => body(r)['session_index'] as string);
    // Two admitted dispatches are two children under two identities. One
    // erasing the other leaves a single child holding both dispatchers' index.
    expect(new Set(dispatched).size).toBe(dispatched.length);

    const stored = readSession(slug);
    expect(stored.triggeredWorkflows).toHaveLength(succeeded.length);
    expect(stored.triggeredWorkflows.map((t) => t.sessionIndex).sort()).toEqual([...dispatched].sort());
    // Each child is addressable as the identity its dispatcher was handed.
    for (const childIndex of dispatched) {
      const status = await call('get_workflow_status', { session_index: childIndex });
      expect((body(status)['workflow'] as Record<string, unknown>)['id']).toBe('child-fixture');
    }
  });

  it('tells a refused resume to repeat itself', async () => {
    const slug = '2026-09-08-overlap-resume';
    await start(slug);

    // Two resumes in flight, each recording a different agent onto the
    // session: the drift each one persists is composed from the same read.
    const results = await Promise.all(['worker-a', 'worker-b'].map((agentId) =>
      callTool('start_session', { agent_id: agentId, planning_folder: planningFolder(slug) })));

    const succeeded = results.filter((r) => !r.isError);
    expect(succeeded.length).toBeGreaterThanOrEqual(1);
    // A refusal here comes from a tool that maps store errors itself, so this
    // is where a bare, un-actionable message would show up.
    for (const failed of results.filter((r) => r.isError)) refusalText(failed);

    const stored = readSession(slug);
    expect(['orchestrator', 'worker-a', 'worker-b']).toContain(stored.agentId);
  });

  it('keeps a parent and its child from overwriting each other in their shared file', async () => {
    const slug = '2026-09-08-overlap-parent-child';
    const sessionIndex = await start(slug);
    const dispatched = await call('dispatch_child', { session_index: sessionIndex, workflow_id: 'child-fixture' });
    const childIndex = body(dispatched)['session_index'] as string;

    // The child's state is a sub-tree of the parent's file, so these two calls
    // write the same bytes from two different reads.
    const results = await Promise.all([
      callTool('record_usage', usageArgs(sessionIndex, 'parent-activity')),
      callTool('record_usage', usageArgs(childIndex, 'child-activity')),
    ]);

    const succeeded = results.filter((r) => !r.isError);
    for (const failed of results.filter((r) => r.isError)) refusalText(failed);
    expect(succeeded.length).toBeGreaterThanOrEqual(1);

    const stored = readSession(slug);
    const childState = stored.triggeredWorkflows[0]?.state as SessionFile;
    const recorded = events(stored, 'activity_usage').length + events(childState, 'activity_usage').length;
    expect(recorded).toBe(succeeded.length);
    // The child survives its parent's write either way — the dispatch record
    // is what a lost update would take with it.
    expect(childState.sessionIndex).toBe(childIndex);
  });
});
