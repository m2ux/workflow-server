import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import {
  encodeWireToken,
  decodeWireToken,
  decodeWireTokenUnverified,
  type WireToken,
} from './wire-token.js';
import { computeStateHash, type SessionRecord } from './state-hash.js';
import { SessionStore } from './session-store.js';

// ---------------------------------------------------------------------------
// Default SessionStore (lazy, with test isolation)
// ---------------------------------------------------------------------------

let _defaultStore: SessionStore | null = null;

function defaultStoreImpl(): SessionStore {
  if (_defaultStore) return _defaultStore;
  if (process.env['VITEST'] !== undefined) {
    // Each vitest worker gets a fresh tmpdir so unit tests cannot pollute the user's
    // real ~/.workflow-server/sessions/ and cannot collide with each other.
    const dir = mkdtempSync(join(tmpdir(), 'workflow-server-vitest-'));
    _defaultStore = new SessionStore(dir);
  } else {
    _defaultStore = new SessionStore();
  }
  return _defaultStore;
}

/** Override the default SessionStore (used by integration tests for explicit isolation). */
export function setDefaultSessionStore(store: SessionStore | null): void {
  _defaultStore = store;
}

/** Access the lazy default SessionStore. */
export function getDefaultSessionStore(): SessionStore {
  return defaultStoreImpl();
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ParentContext {
  psid: string;
  pwf: string;
  pact: string;
  pv: string;
}

/**
 * Mutator shape for advanceToken.
 *
 * Notably absent: skill (dead — was written by get_skill, never read), cond (dead —
 * was written by next_activity, never read). Both removed in this rewrite.
 *
 * bcp lives on the wire token, not the SessionRecord:
 *   undefined → preserve existing bcp
 *   string    → set bcp
 *   null      → clear bcp
 *
 * Other clearable parent-context fields (pwf/pact/pv) follow the same nullable convention.
 */
export interface SessionAdvance {
  wf?: string;
  act?: string;
  aid?: string;
  bcp?: string | null;
  psid?: string;
  pwf?: string | null;
  pact?: string | null;
  pv?: string | null;
}

/**
 * Flat view returned by loadSession: wire-only fields (sid, seq, ts, bcp) and
 * record fields (wf, act, v, aid, parent context, timestamps) combined for ease
 * of access at handler sites. `sid` is presented as a UUID-formatted string
 * (matching the historical SessionPayload shape) regardless of its internal binary form.
 */
export interface SessionView {
  // From wire:
  sid: string;
  seq: number;
  ts: number;
  bcp?: string;
  // From record:
  wf: string;
  act: string;
  v: string;
  aid: string;
  psid?: string;
  pwf?: string;
  pact?: string;
  pv?: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// sid <-> string helpers (UUID-formatted external representation)
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function sidToString(sid: Buffer): string {
  if (sid.length !== 16) throw new Error(`sidToString: expected 16 bytes, got ${sid.length}`);
  const hex = sid.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function sidFromString(s: string): Buffer {
  if (!UUID_RE.test(s)) throw new Error(`sidFromString: '${s}' is not a valid UUID`);
  return Buffer.from(s.replace(/-/g, ''), 'hex');
}

function toView(wire: WireToken, record: SessionRecord): SessionView {
  const base = {
    sid: sidToString(wire.sid),
    seq: wire.seq,
    ts: wire.ts,
    wf: record.wf,
    act: record.act,
    v: record.v,
    aid: record.aid,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  const view: SessionView = base;
  if (wire.bcp !== undefined) view.bcp = wire.bcp;
  if (record.psid !== undefined) view.psid = record.psid;
  if (record.pwf !== undefined) view.pwf = record.pwf;
  if (record.pact !== undefined) view.pact = record.pact;
  if (record.pv !== undefined) view.pv = record.pv;
  return view;
}

// ---------------------------------------------------------------------------
// Record mutation
// ---------------------------------------------------------------------------

function applyUpdates(prev: SessionRecord, updates: SessionAdvance, now: number): SessionRecord {
  const next: SessionRecord = { ...prev, updatedAt: now };
  if (updates.wf !== undefined) next.wf = updates.wf;
  if (updates.act !== undefined) next.act = updates.act;
  if (updates.aid !== undefined) next.aid = updates.aid;
  if (updates.psid !== undefined) next.psid = updates.psid;
  // Clearable optional fields.
  if (updates.pwf === null) delete next.pwf;
  else if (updates.pwf !== undefined) next.pwf = updates.pwf;
  if (updates.pact === null) delete next.pact;
  else if (updates.pact !== undefined) next.pact = updates.pact;
  if (updates.pv === null) delete next.pv;
  else if (updates.pv !== undefined) next.pv = updates.pv;
  return next;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a fresh session: generate a sid, build the initial SessionRecord, persist
 * it to SessionStore, and return a wire token bound to the record via state_hash.
 */
export async function createSessionToken(
  workflowId: string,
  workflowVersion: string,
  agentId: string,
  parent?: ParentContext,
  store: SessionStore = defaultStoreImpl(),
): Promise<string> {
  const sid = sidFromString(randomUUID());
  const now = Math.floor(Date.now() / 1000);
  const baseRecord: SessionRecord = {
    wf: workflowId,
    act: '',
    v: workflowVersion,
    aid: agentId,
    createdAt: now,
    updatedAt: now,
  };
  const record: SessionRecord = parent
    ? { ...baseRecord, psid: parent.psid, pwf: parent.pwf, pact: parent.pact, pv: parent.pv }
    : baseRecord;
  const sh = computeStateHash(record, 0);
  await store.create(sid, record, sh);
  return encodeWireToken({ sid, seq: 0, ts: now, sh });
}

/**
 * Verify a session token end-to-end and return a SessionView combining wire
 * fields and the server-side record.
 *
 * Throws on:
 *  - malformed wire form or HMAC failure (from decodeWireToken)
 *  - missing state file (the planning folder may be gone — workflow restart required)
 *  - state_hash mismatch (concurrent advance, external mutation, or token replay)
 */
export async function loadSession(
  token: string,
  store: SessionStore = defaultStoreImpl(),
): Promise<SessionView> {
  const wire = await decodeWireToken(token);
  const record = await store.load(wire.sid);
  if (record === null) {
    throw new Error(
      `Invalid session token: state file not found for session '${sidToString(wire.sid)}'. ` +
      `The planning folder may have been moved or deleted, or this token is from a different server installation. ` +
      `To recover, restart the workflow with start_session, or pass the saved token to start_session to attempt re-adoption.`
    );
  }
  const expectedSh = computeStateHash(record, wire.seq);
  if (!expectedSh.equals(wire.sh)) {
    throw new Error(
      `Invalid session token: state hash mismatch for session '${sidToString(wire.sid)}' at seq=${wire.seq}. ` +
      `The stored session record does not match what the token attests. ` +
      `This usually means a concurrent advance occurred or the state file was modified externally. ` +
      `To recover, call get_workflow_status with a current token, or restart the workflow.`
    );
  }
  return toView(wire, record);
}

/**
 * Advance a session: apply updates to its record, persist, compute the new
 * state_hash, and issue a new wire token. Throws if the token's HMAC is bad
 * or if the state hash doesn't match the stored record (the contract of
 * loadSession is also enforced inside advanceToken).
 */
export async function advanceToken(
  token: string,
  updates: SessionAdvance = {},
  store: SessionStore = defaultStoreImpl(),
): Promise<string> {
  const wire = await decodeWireToken(token);
  const record = await store.load(wire.sid);
  if (record === null) {
    throw new Error(
      `Cannot advance: state file not found for session '${sidToString(wire.sid)}'. ` +
      `The planning folder may have been moved or deleted. Resolve via start_session or workflow restart.`
    );
  }
  const expectedSh = computeStateHash(record, wire.seq);
  if (!expectedSh.equals(wire.sh)) {
    throw new Error(
      `Cannot advance: state hash mismatch for session '${sidToString(wire.sid)}' at seq=${wire.seq}. ` +
      `The stored session record does not match what the token attests. Resolve via start_session or workflow restart.`
    );
  }
  const now = Math.floor(Date.now() / 1000);
  const newRecord = applyUpdates(record, updates, now);
  const newSeq = wire.seq + 1;
  const newSh = computeStateHash(newRecord, newSeq);
  await store.save(wire.sid, newRecord, newSh);

  // bcp lives on the wire only; reconcile with the updates flag.
  let newBcp: string | undefined;
  if (updates.bcp === undefined) newBcp = wire.bcp;
  else if (updates.bcp === null) newBcp = undefined;
  else newBcp = updates.bcp;

  return encodeWireToken(newBcp !== undefined
    ? { sid: wire.sid, seq: newSeq, ts: now, bcp: newBcp, sh: newSh }
    : { sid: wire.sid, seq: newSeq, ts: now, sh: newSh });
}

/**
 * Throws if the session has an active checkpoint awaiting resolution.
 * Call in every tool handler EXCEPT present_checkpoint and respond_checkpoint
 * (those are the resolution mechanism).
 */
export function assertCheckpointsResolved(view: SessionView): void {
  if (view.bcp) {
    throw new Error(
      `Blocked: Active checkpoint '${view.bcp}' on activity '${view.act}'. ` +
      `All tools are gated until the checkpoint is resolved. ` +
      `The orchestrator must call respond_checkpoint with the checkpoint_handle to clear the gate before any other tool calls can proceed.`
    );
  }
}

export const sessionTokenParam = {
  session_token: z.string()
    .min(1, 'Session token is required')
    .describe('REQUIRED. The session token string returned by start_session (or the updated token from the previous tool response). Every tool call after start_session must include this parameter.'),
};

// Re-exports for callers that want direct access to lower layers.
export type { WireToken, SessionRecord };
export { decodeWireToken, decodeWireTokenUnverified };
