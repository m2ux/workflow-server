import {
  resolveSessionLocation,
  verifySeal,
  writeSessionFile,
  SessionStoreError,
} from './store.js';
import type { SessionJsonPath } from './derivation.js';
import { safeValidateSessionFile, type SessionFile } from '../../schema/session.schema.js';
import type { SessionView } from '../validation.js';

/**
 * Navigate into a SessionFile via a JSON path. The path is an array of
 * object keys (string) and array indices (number) — typically
 * `["triggeredWorkflows", N, "state", ...]` to reach an embedded child.
 *
 * Returns the addressed sub-state, or throws `SessionStoreError(NOT_FOUND)`
 * if the path cannot be resolved (missing key, out-of-bounds index, or
 * non-object intermediate node).
 */
export function navigatePath(root: SessionFile, jsonPath: SessionJsonPath): SessionFile {
  let cursor: unknown = root;
  for (let i = 0; i < jsonPath.length; i++) {
    const seg = jsonPath[i] as string | number;
    if (cursor === null || cursor === undefined || typeof cursor !== 'object') {
      throw new SessionStoreError(
        `navigatePath: cannot index into non-object at jsonPath[${i - 1}] (segment '${String(seg)}')`,
        'NOT_FOUND',
        { jsonPath: [...jsonPath] },
      );
    }
    if (typeof seg === 'number') {
      if (!Array.isArray(cursor)) {
        throw new SessionStoreError(
          `navigatePath: numeric segment ${seg} at jsonPath[${i}] but cursor is not an array`,
          'NOT_FOUND',
          { jsonPath: [...jsonPath] },
        );
      }
      cursor = cursor[seg];
    } else {
      cursor = (cursor as Record<string, unknown>)[seg];
    }
  }
  if (cursor === undefined || cursor === null) {
    throw new SessionStoreError(
      `navigatePath: jsonPath does not resolve to a value`,
      'NOT_FOUND',
      { jsonPath: [...jsonPath] },
    );
  }
  return cursor as SessionFile;
}

/**
 * Return a structurally-cloned `root` with the sub-state at `jsonPath`
 * replaced by `newSubState`. The original `root` is not mutated.
 *
 * When `jsonPath` is empty, returns `newSubState` directly (it IS the new
 * root). For non-empty paths, walks down cloning each intermediate
 * container so the result shares no references with `root` along the
 * mutation path — safe for downstream HMAC-seal computation.
 */
export function replacePath(root: SessionFile, jsonPath: SessionJsonPath, newSubState: SessionFile): SessionFile {
  if (jsonPath.length === 0) return newSubState;
  // Deep clone once; mutate the clone along jsonPath.
  const cloned = JSON.parse(JSON.stringify(root)) as SessionFile;
  let cursor: unknown = cloned;
  for (let i = 0; i < jsonPath.length - 1; i++) {
    const seg = jsonPath[i] as string | number;
    if (typeof seg === 'number') {
      cursor = (cursor as unknown[])[seg];
    } else {
      cursor = (cursor as Record<string, unknown>)[seg];
    }
    if (cursor === undefined || cursor === null) {
      throw new SessionStoreError(
        `replacePath: jsonPath[${i}] does not exist on root`,
        'NOT_FOUND',
        { jsonPath: [...jsonPath] },
      );
    }
  }
  const last = jsonPath[jsonPath.length - 1] as string | number;
  if (typeof last === 'number') {
    (cursor as unknown[])[last] = newSubState;
  } else {
    (cursor as Record<string, unknown>)[last as string] = newSubState;
  }
  return cloned;
}

/**
 * Project a `SessionFile` onto the abstract `SessionView` consumed by the
 * validation helpers, so the validation surface stays storage-agnostic.
 */
export function sessionView(state: SessionFile): SessionView {
  return {
    wf: state.workflowId,
    act: state.currentActivity,
    v: state.workflowVersion,
  };
}

/**
 * Result of `loadSessionForTool`.
 *
 * `state` is the SessionFile the tool should operate on — for root sessions
 * it's the top-level file, for embedded children it's the addressed
 * sub-state. `topState` is always the root of the on-disk file; combined
 * with `jsonPath` it allows the save path to re-insert mutations into the
 * correct location before re-canonicalising and re-sealing.
 */
export interface LoadedSession {
  /** The addressed SessionFile (may be the root or an embedded sub-state). */
  state: SessionFile;
  /** Absolute path to the top-level planning folder. */
  folderAbsPath: string;
  /** Raw bytes of the on-disk top file (pre-mutation). */
  bytes: string;
  /** Path inside `topState` to reach `state`. Empty for the root session. */
  jsonPath: SessionJsonPath;
  /** The root SessionFile of the on-disk file. */
  topState: SessionFile;
}

/**
 * Resolve a `session_index` to its location (top folder + jsonPath inside
 * `session.json`), verify the seal, and parse the file. The returned
 * `state` is the SessionFile addressed by the index — either the root
 * SessionFile of the file or an embedded sub-state at `jsonPath`.
 *
 * Errors:
 *   - `INVALID_INDEX` / `NOT_FOUND` / `COLLISION` from `resolveSessionLocation`.
 *   - `SEAL_MISMATCH` from `verifySeal`.
 *   - Schema-validation failure on the top file.
 *   - `NOT_FOUND` if `jsonPath` cannot be navigated on the parsed top state.
 */
export async function loadSessionForTool(
  workspaceDir: string,
  sessionIndex: string,
): Promise<LoadedSession> {
  const { folder, jsonPath } = await resolveSessionLocation(workspaceDir, sessionIndex);
  const { state: rawTopState, bytes } = await verifySeal(folder);
  const parsed = safeValidateSessionFile(rawTopState);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new SessionStoreError(
      `session.json in ${folder} does not match the SessionFile schema: ${issues}`,
      'SEAL_MISMATCH',
      { folder },
    );
  }
  const topState = parsed.data;
  const state = jsonPath.length === 0 ? topState : navigatePath(topState, jsonPath);
  return { state, folderAbsPath: folder, bytes, jsonPath, topState };
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
 * Persist a tool's mutated SessionFile back into its on-disk top file.
 *
 * When the loaded session is the root (empty jsonPath), `newState` becomes
 * the new top file. When it's an embedded sub-state, `replacePath` produces
 * a new top SessionFile with the mutation slotted in at `loaded.jsonPath`,
 * and that whole top file is re-canonicalised, sealed, and atomic-written.
 *
 * Returns the canonical bytes written and the seal hex.
 */
export async function saveSessionForTool(
  loaded: LoadedSession,
  newState: SessionFile,
): Promise<{ bytes: string; seal: string }> {
  const newTopState = loaded.jsonPath.length === 0
    ? newState
    : replacePath(loaded.topState, loaded.jsonPath, newState);
  return writeSessionFile(loaded.folderAbsPath, newTopState);
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
      return `${err.message}. Restart the server with a valid --repo=owner/repo, --workspace=PATH, or WORKFLOW_WORKSPACE / WORKFLOW_SERVER_REPO.`;
    default:
      return err.message;
  }
}
