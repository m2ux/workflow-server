import {
  resolveSessionIndex,
  verifySeal,
  writeSessionFile,
  SessionStoreError,
} from './session-store.js';
import { safeValidateSessionFile, type SessionFile } from '../schema/session.schema.js';
import type { SessionView } from './validation.js';

/**
 * Project a `SessionFile` onto the abstract `SessionView` consumed by the
 * validation helpers. Bridges the Phase 4 swap from token-decoded
 * `SessionPayload` to the server-managed `SessionFile` without duplicating the
 * validation surface.
 */
export function sessionView(state: SessionFile): SessionView {
  return {
    wf: state.workflowId,
    act: state.currentActivity,
    v: state.workflowVersion,
  };
}

/**
 * Result of `loadSessionForTool` — the verified `SessionFile`, the absolute
 * planning folder it lives in, and the original raw bytes (useful when the
 * caller wants to no-op-rewrite to refresh `ts` without re-canonicalising).
 */
export interface LoadedSession {
  state: SessionFile;
  folderAbsPath: string;
  bytes: string;
}

/**
 * Resolve a `session_index` to its planning folder, verify the seal, and
 * parse `session.json` as a `SessionFile`. Used by every authenticated tool
 * to load state before reading or mutating it.
 *
 * Errors:
 *   - `INVALID_INDEX` / `NOT_FOUND` / `COLLISION` from `resolveSessionIndex`.
 *   - `SEAL_MISMATCH` from `verifySeal` (state was hand-edited or torn).
 *   - Schema-validation failure (the file parses as JSON but does not match
 *     the `SessionFile` shape) — wrapped in a thrown `Error` with a clear
 *     message pointing at the planning folder.
 */
export async function loadSessionForTool(
  workspaceDir: string,
  sessionIndex: string,
): Promise<LoadedSession> {
  const folderAbsPath = await resolveSessionIndex(workspaceDir, sessionIndex);
  const { state: rawState, bytes } = await verifySeal(folderAbsPath);
  const parsed = safeValidateSessionFile(rawState);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new SessionStoreError(
      `session.json in ${folderAbsPath} does not match the SessionFile schema: ${issues}`,
      'SEAL_MISMATCH',
      { folder: folderAbsPath },
    );
  }
  return { state: parsed.data, folderAbsPath, bytes };
}

/**
 * Advance a `SessionFile` by one logical tool call: bumps `seq` and `ts`,
 * applies the caller-supplied mutation, and returns the new state without
 * writing it. Callers persist the result via `saveSessionForTool`.
 */
export function advanceSession(
  state: SessionFile,
  mutate?: (draft: SessionFile) => void,
): SessionFile {
  const next: SessionFile = {
    ...state,
    seq: state.seq + 1,
    ts: Math.floor(Date.now() / 1000),
  };
  // Deep-clone the parts a mutator is most likely to touch so callers can't
  // accidentally alias the previous state. We avoid structuredClone for older
  // Node compatibility; the JSON round-trip is fine for the SessionFile shape.
  const draft = JSON.parse(JSON.stringify(next)) as SessionFile;
  if (mutate) mutate(draft);
  draft.seq = next.seq;
  draft.ts = next.ts;
  return draft;
}

/**
 * Persist an updated `SessionFile` (and its seal) atomically. Returns the
 * canonical bytes that were written and the seal hex so the caller may
 * include them in trace events without re-reading the file.
 */
export async function saveSessionForTool(
  folderAbsPath: string,
  state: SessionFile,
): Promise<{ bytes: string; seal: string }> {
  return writeSessionFile(folderAbsPath, state);
}

/**
 * Convenience: load → mutate → persist. Most authenticated tools fit this
 * shape; the few that need to read without writing (`get_workflow_status`,
 * `get_trace`) can use `loadSessionForTool` directly.
 */
export async function withSession<R>(
  workspaceDir: string,
  sessionIndex: string,
  fn: (loaded: LoadedSession) => Promise<{ next: SessionFile; result: R }>,
): Promise<{ result: R; loaded: LoadedSession; written: { bytes: string; seal: string } }> {
  const loaded = await loadSessionForTool(workspaceDir, sessionIndex);
  const { next, result } = await fn(loaded);
  const written = await saveSessionForTool(loaded.folderAbsPath, next);
  return { result, loaded, written };
}

/**
 * Map a session-store error to an actionable user-facing message. Tools call
 * this when they catch a `SessionStoreError` so the response surfaces both
 * what went wrong and how to recover.
 */
export function describeSessionStoreError(err: unknown): string {
  if (!(err instanceof SessionStoreError)) {
    return err instanceof Error ? err.message : String(err);
  }
  switch (err.code) {
    case 'INVALID_INDEX':
      return `Invalid session_index: ${err.message}. The session_index must be the 6-character base32 string returned by start_session.`;
    case 'NOT_FOUND':
      return `${err.message}. Call start_session to create or resume a planning folder; the session_index is only valid against folders the server has previously sealed.`;
    case 'COLLISION':
      return `${err.message}. Two planning folders hashed to the same session_index — recreate the colliding session(s) or remove a stale folder under .engineering/artifacts/planning/.`;
    case 'SEAL_MISMATCH':
      return `${err.message}. The session.json (or its parsed contents) does not match the seal recorded in .session-token — restore the folder from the most recent commit before retrying.`;
    case 'WORKSPACE_INVALID':
      return `${err.message}. Restart the server with a valid --workspace=PATH or WORKFLOW_WORKSPACE pointing at the repository root.`;
    default:
      return err.message;
  }
}
