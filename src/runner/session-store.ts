import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { SessionStatus } from './session-manager.js';

export interface SessionRow {
  id: string;
  workflow_id: string;
  target_submodule: string;
  issue_ref: string | null;
  slack_channel: string;
  slack_thread_ts: string;
  status: string;
  worktree_path: string | null;
  created_at: number;
  completed_at: number | null;
  error: string | null;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  target_submodule TEXT NOT NULL,
  issue_ref TEXT,
  slack_channel TEXT NOT NULL,
  slack_thread_ts TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'creating',
  worktree_path TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT
)`;

export class SessionStore {
  private db: DatabaseSync | null = null;

  open(dbPath: string): void {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(SCHEMA);
  }

  save(session: {
    id: string;
    workflowId: string;
    targetSubmodule: string;
    issueRef: string | undefined;
    slackChannel: string;
    slackThreadTs: string;
    status: SessionStatus;
    worktreePath: string | undefined;
    createdAt: number;
  }): void {
    const stmt = this.requireDb().prepare(`
      INSERT OR REPLACE INTO sessions
        (id, workflow_id, target_submodule, issue_ref, slack_channel, slack_thread_ts, status, worktree_path, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.id,
      session.workflowId,
      session.targetSubmodule,
      session.issueRef ?? null,
      session.slackChannel,
      session.slackThreadTs,
      session.status,
      session.worktreePath ?? null,
      session.createdAt,
    );
  }

  load(id: string): SessionRow | undefined {
    const stmt = this.requireDb().prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id) as SessionRow | undefined;
  }

  loadActive(): SessionRow[] {
    const stmt = this.requireDb().prepare(
      "SELECT * FROM sessions WHERE status IN ('creating', 'running', 'awaiting_checkpoint')",
    );
    return stmt.all() as SessionRow[];
  }

  updateStatus(id: string, status: SessionStatus, error?: string): void {
    const completedAt = (status === 'completed' || status === 'error') ? Date.now() : null;
    const stmt = this.requireDb().prepare(
      'UPDATE sessions SET status = ?, error = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?',
    );
    stmt.run(status, error ?? null, completedAt, id);
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  private requireDb(): DatabaseSync {
    if (!this.db) throw new Error('SessionStore is not open');
    return this.db;
  }
}
