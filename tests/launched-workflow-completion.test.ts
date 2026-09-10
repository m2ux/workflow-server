/**
 * A launched workflow reaching its end closes the record of it (#656).
 *
 * A session that launches another keeps a record of the launch, and the
 * launched session's own state sits inside that record. Both live in one file,
 * so the write that records the launched session's completion is also the write
 * that closes the record: its status becomes `completed`, its completion is
 * stamped, and the launcher's history gains a `workflow_returned` event.
 *
 * The store-level suite states the property against the file shape. The
 * wire-level suite walks a launched workflow to its terminal activity through
 * the tools and asserts the launcher observes it.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { closeLaunchedRecord } from '../src/utils/session/index.js';
import { createInitialSessionFile, type SessionFile, type EmbeddedSessionRef } from '../src/schema/session.schema.js';
import { createHarness, type Harness } from './e2e/harness.js';
import { planningFolderPath } from './session-ops.js';

const COMPLETED_AT = '2026-09-09T10:00:00.000Z';

/** A session file carrying one running record, whose state is `child`. */
function launcherHolding(child: SessionFile, status: EmbeddedSessionRef['status'] = 'running'): SessionFile {
  const launcher = createInitialSessionFile({
    sessionIndex: 'AAAAAA',
    workflowId: 'work-package',
    workflowVersion: '1.0.0',
    agentId: 'orchestrator',
  });
  launcher.triggeredWorkflows.push({
    workflowId: child.workflowId,
    sessionIndex: child.sessionIndex,
    triggeredAt: '2026-09-09T09:00:00.000Z',
    triggeredFrom: { activityId: 'post-impl-review' },
    status,
    state: child,
  });
  return launcher;
}

function launched(sessionIndex: string, workflowId = 'prism'): SessionFile {
  return createInitialSessionFile({
    sessionIndex,
    workflowId,
    workflowVersion: '1.0.0',
    agentId: 'workflow-orchestrator',
  });
}

/** History entries of one type, as stored. */
function events(state: SessionFile, type: string): SessionFile['history'] {
  return state.history.filter((h) => h.type === type);
}

describe('closing a launched-workflow record (#656)', () => {
  const childPath = ['triggeredWorkflows', 0, 'state'] as const;

  it('closes the record that embeds the completing session', () => {
    const top = launcherHolding(launched('BBBBBB'));

    closeLaunchedRecord(top, [...childPath], COMPLETED_AT);

    const record = top.triggeredWorkflows[0]!;
    expect(record.status).toBe('completed');
    expect(record.completedAt).toBe(COMPLETED_AT);
    const returned = events(top, 'workflow_returned');
    expect(returned).toHaveLength(1);
    expect(returned[0]!.data).toEqual({ sessionIndex: 'BBBBBB', workflowId: 'prism' });
  });

  it('leaves a root session alone — no record embeds it', () => {
    const top = launcherHolding(launched('BBBBBB'));
    const before = JSON.stringify(top);

    closeLaunchedRecord(top, [], COMPLETED_AT);

    expect(JSON.stringify(top)).toBe(before);
  });

  it('leaves a record that is already closed', () => {
    const top = launcherHolding(launched('BBBBBB'), 'completed');

    closeLaunchedRecord(top, [...childPath], COMPLETED_AT);

    expect(top.triggeredWorkflows[0]!.completedAt).toBeUndefined();
    expect(events(top, 'workflow_returned')).toHaveLength(0);
  });

  it('closes the record on the session that holds it, not on the top of the file', () => {
    // A launch from inside a launch: the grandchild's record belongs to the
    // child, and the child's own record stays open until it finishes too.
    const grandchild = launched('CCCCCC', 'prism');
    const child = launcherHolding(grandchild);
    child.sessionIndex = 'BBBBBB';
    child.workflowId = 'prism-evaluate';
    const top = launcherHolding(child);

    closeLaunchedRecord(
      top,
      ['triggeredWorkflows', 0, 'state', 'triggeredWorkflows', 0, 'state'],
      COMPLETED_AT,
    );

    const childRecord = top.triggeredWorkflows[0]!;
    expect(childRecord.status).toBe('running');
    expect(events(top, 'workflow_returned')).toHaveLength(0);
    const grandchildRecord = (childRecord.state as SessionFile).triggeredWorkflows[0]!;
    expect(grandchildRecord.status).toBe('completed');
    expect(grandchildRecord.completedAt).toBe(COMPLETED_AT);
    expect(events(childRecord.state as SessionFile, 'workflow_returned')).toHaveLength(1);
  });
});

describe('a launched workflow walked to its end (#656)', () => {
  let harness: Harness;
  let client: Client;
  const slug = '2026-09-09-launched-completion';
  const planningFolder = (): string => planningFolderPath(harness.workspaceDir, slug);
  const readSession = (): SessionFile =>
    JSON.parse(readFileSync(join(planningFolder(), 'session.json'), 'utf8')) as SessionFile;

  beforeAll(async () => {
    harness = await createHarness({ workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model') });
    client = harness.client;
  });

  afterAll(async () => { await harness.close(); });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ToolResult = any;

  async function call(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const result = await client.callTool({ name, arguments: args }) as ToolResult;
    if (result.isError) throw new Error(`${name} failed: ${(result.content as { text: string }[])[0]?.text}`);
    return result;
  }

  const body = (result: ToolResult): Record<string, unknown> =>
    JSON.parse((result.content as { text: string }[])[0]!.text) as Record<string, unknown>;

  it('leaves the launcher holding a closed record and a returned event', async () => {
    const started = await call('start_session', {
      workflow_id: 'seed-fixture', agent_id: 'orchestrator', planning_folder: planningFolder(),
    });
    const launcherIndex = (started._meta as Record<string, unknown>).session_index as string;

    const dispatched = await call('dispatch_child', {
      session_index: launcherIndex, workflow_id: 'child-fixture', agent_id: 'workflow-orchestrator',
    });
    const childIndex = body(dispatched)['session_index'] as string;
    const initialActivity = (body(dispatched)['workflow'] as Record<string, unknown>)['initialActivity'] as string;

    // The record opens as running, which is all a launcher could read before
    // the walk below reached the child's end.
    expect(readSession().triggeredWorkflows[0]!.status).toBe('running');

    // Walk the launched workflow: into its opening activity, then off the end.
    await call('next_activity', { session_index: childIndex, activity_id: initialActivity });
    await call('next_activity', { session_index: childIndex, activity_id: '__terminal__', from_activity: initialActivity });

    const stored = readSession();
    const record = stored.triggeredWorkflows[0]!;
    expect(record.sessionIndex).toBe(childIndex);
    expect(record.status).toBe('completed');
    expect(record.completedAt).toBeTruthy();
    expect((record.state as SessionFile).status).toBe('completed');

    const returned = events(stored, 'workflow_returned');
    expect(returned).toHaveLength(1);
    expect(returned[0]!.data).toEqual({ sessionIndex: childIndex, workflowId: 'child-fixture' });
  });
});
