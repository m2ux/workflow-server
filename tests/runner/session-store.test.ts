import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock node:sqlite — vitest hoists vi.mock, so all classes must be inline.
// ---------------------------------------------------------------------------

vi.mock('node:sqlite', () => {
  type Row = Record<string, unknown>;

  class MockStatement {
    constructor(
      private rows: Map<string, Row>,
      private sql: string,
    ) {}

    run(...params: unknown[]): void {
      if (this.sql.includes('INSERT OR REPLACE')) {
        const row: Row = {
          id: params[0],
          workflow_id: params[1],
          target_submodule: params[2],
          issue_ref: params[3],
          slack_channel: params[4],
          slack_thread_ts: params[5],
          status: params[6],
          worktree_path: params[7],
          created_at: params[8],
          completed_at: null,
          error: null,
        };
        this.rows.set(params[0] as string, row);
      } else if (this.sql.includes('UPDATE sessions SET')) {
        const id = params[3] as string;
        const row = this.rows.get(id);
        if (row) {
          row.status = params[0];
          row.error = params[1];
          if (params[2] !== null) {
            row.completed_at = params[2];
          }
        }
      }
    }

    get(...params: unknown[]): Row | undefined {
      return this.rows.get(params[0] as string);
    }

    all(): Row[] {
      const activeStatuses = ['creating', 'running', 'awaiting_checkpoint'];
      if (this.sql.includes('status IN')) {
        return [...this.rows.values()].filter(
          (r) => activeStatuses.includes(r.status as string),
        );
      }
      return [...this.rows.values()];
    }
  }

  class MockDatabaseSync {
    private rows = new Map<string, Row>();
    private _closed = false;

    exec(_sql: string): void {}

    prepare(sql: string): MockStatement {
      if (this._closed) throw new Error('Database is closed');
      return new MockStatement(this.rows, sql);
    }

    close(): void {
      this._closed = true;
    }
  }

  return { DatabaseSync: MockDatabaseSync };
});

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
}));

import { SessionStore } from '../../src/runner/session-store.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSampleSession(overrides: Partial<{
  id: string;
  workflowId: string;
  targetSubmodule: string;
  issueRef: string | undefined;
  slackChannel: string;
  slackThreadTs: string;
  status: string;
  worktreePath: string | undefined;
  createdAt: number;
}> = {}) {
  return {
    id: overrides.id ?? 'test-001',
    workflowId: overrides.workflowId ?? 'work-package',
    targetSubmodule: overrides.targetSubmodule ?? 'midnight-node',
    issueRef: ('issueRef' in overrides ? overrides.issueRef : 'PM-123') as string | undefined,
    slackChannel: overrides.slackChannel ?? 'C123',
    slackThreadTs: overrides.slackThreadTs ?? '1234.5678',
    status: (overrides.status ?? 'creating') as any,
    worktreePath: overrides.worktreePath as string | undefined,
    createdAt: overrides.createdAt ?? 1709600000000,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    store = new SessionStore();
    store.open('/tmp/test.db');
  });

  afterEach(() => {
    store.close();
  });

  it('should create the database and sessions table on open', () => {
    store.save(makeSampleSession());
    expect(store.load('test-001')).toBeDefined();
  });

  it('should persist and retrieve a session', () => {
    store.save(makeSampleSession({ id: 'sess-1' }));

    const row = store.load('sess-1')!;
    expect(row.id).toBe('sess-1');
    expect(row.workflow_id).toBe('work-package');
    expect(row.target_submodule).toBe('midnight-node');
    expect(row.issue_ref).toBe('PM-123');
    expect(row.slack_channel).toBe('C123');
    expect(row.slack_thread_ts).toBe('1234.5678');
    expect(row.status).toBe('creating');
    expect(row.created_at).toBe(1709600000000);
    expect(row.completed_at).toBeNull();
    expect(row.error).toBeNull();
  });

  it('should return undefined for a non-existent session', () => {
    expect(store.load('does-not-exist')).toBeUndefined();
  });

  it('should replace an existing record when saving with the same ID', () => {
    store.save(makeSampleSession({ id: 'dup', targetSubmodule: 'first' }));
    store.save(makeSampleSession({ id: 'dup', targetSubmodule: 'second' }));

    expect(store.load('dup')!.target_submodule).toBe('second');
  });

  it('should return only active sessions from loadActive', () => {
    store.save(makeSampleSession({ id: 's1', status: 'creating' }));
    store.save(makeSampleSession({ id: 's2', status: 'running' }));
    store.save(makeSampleSession({ id: 's3', status: 'awaiting_checkpoint' }));
    store.save(makeSampleSession({ id: 's4', status: 'completed' }));
    store.save(makeSampleSession({ id: 's5', status: 'error' }));

    const active = store.loadActive();
    expect(active).toHaveLength(3);
    expect(active.map((r: any) => r.id).sort()).toEqual(['s1', 's2', 's3']);
  });

  it('should set completed_at when updating to completed', () => {
    store.save(makeSampleSession({ id: 'c1', status: 'running' }));
    store.updateStatus('c1', 'completed');

    const row = store.load('c1')!;
    expect(row.status).toBe('completed');
    expect(row.completed_at).toBeGreaterThan(0);
    expect(row.error).toBeNull();
  });

  it('should store the error message on error status', () => {
    store.save(makeSampleSession({ id: 'e1', status: 'running' }));
    store.updateStatus('e1', 'error', 'Something failed');

    const row = store.load('e1')!;
    expect(row.status).toBe('error');
    expect(row.error).toBe('Something failed');
    expect(row.completed_at).toBeGreaterThan(0);
  });

  it('should not set completed_at for non-terminal status changes', () => {
    store.save(makeSampleSession({ id: 'r1', status: 'creating' }));
    store.updateStatus('r1', 'running');

    const row = store.load('r1')!;
    expect(row.status).toBe('running');
    expect(row.completed_at).toBeNull();
  });

  it('should store null for undefined issueRef', () => {
    store.save(makeSampleSession({ id: 'no-ref', issueRef: undefined }));
    expect(store.load('no-ref')!.issue_ref).toBeNull();
  });

  it('should throw when operations are called before open', () => {
    const closed = new SessionStore();
    expect(() => closed.load('x')).toThrow('SessionStore is not open');
  });
});
