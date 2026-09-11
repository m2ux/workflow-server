import {
  replaceSessionFile,
  resolveSessionLocation,
  verifySeal,
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
 * Close the launched-workflow record that embeds the session at `jsonPath`:
 * the record's status becomes `completed`, its completion is stamped, and the
 * session whose list holds the record gains a `workflow_returned` event.
 *
 * A `jsonPath` that no record embeds addresses a root session, which no parent
 * launched; a record not `running` has already been closed. Both leave `top`
 * untouched, so this is safe to apply on every terminal transition.
 *
 * Mutates `top` in place — the record and the session it embeds live in one
 * file, so this composes onto the write that records the child's own
 * completion (`saveSessionForTool`'s `mutateTop`) rather than taking a write
 * of its own.
 */
export function closeLaunchedRecord(top: SessionFile, jsonPath: SessionJsonPath, completedAt: string): void {
  const embedsARecord = jsonPath.length >= 3
    && jsonPath[jsonPath.length - 1] === 'state'
    && typeof jsonPath[jsonPath.length - 2] === 'number'
    && jsonPath[jsonPath.length - 3] === 'triggeredWorkflows';
  if (!embedsARecord) return;

  const recordIndex = jsonPath[jsonPath.length - 2] as number;
  const holderPath = jsonPath.slice(0, -3);
  const holder = holderPath.length === 0 ? top : navigatePath(top, holderPath);
  const record = holder.triggeredWorkflows[recordIndex];
  if (!record || record.status !== 'running') return;

  record.status = 'completed';
  record.completedAt = completedAt;
  holder.history.push({
    timestamp: completedAt,
    type: 'workflow_returned',
    data: { sessionIndex: record.sessionIndex, workflowId: record.workflowId },
  });
}

/**
 * The activity a call belongs to: the one it names, when the frontier holds it. Undefined
 * otherwise — including when a call names none and the frontier is not empty, which is not a
 * single-entry convenience but the case that must refuse. Inferring the sole entry would let a
 * second advance off an already-retired activity resolve against whatever the frontier then held
 * and record it complete before its first step. So the caller refuses rather than guessing, and a
 * guess would also serve one branch another branch's activity.
 *
 * The comparison is an exact string match over a list of distinct strings: the id a call names is
 * unique in the frontier by construction, so a fan instance is found without disambiguating.
 */
export function heldActivity(state: SessionFile, named: string | undefined): string | undefined {
  if (named === undefined || named === '') return undefined;
  return state.frontier.includes(named) ? named : undefined;
}

/**
 * The activity a DELIVERY call is served against: the one it names, or the sole entry where a
 * single activity is in flight. The parameterless convention is what every ordinary walk uses; it
 * is the exclusivity that retires, not the calling shape. Undefined where the caller must be
 * refused — see `frontierRefusal` for the message each case owes.
 */
export function servedActivity(state: SessionFile, named: string | undefined): string | undefined {
  if (named !== undefined && named !== '') return state.frontier.includes(named) ? named : undefined;
  return state.frontier.length === 1 ? state.frontier[0]! : undefined;
}

/**
 * Why a delivery call cannot be served, or undefined when it can. Three refusals, the middle one
 * naming every entry in flight: a worker is served the activity it was dispatched for, never
 * guessed at.
 */
export function frontierRefusal(state: SessionFile, tool: string, named: string | undefined): string | undefined {
  if (named !== undefined && named !== '') {
    if (state.frontier.includes(named)) return undefined;
    if (state.frontier.length === 0) return `${tool}: no activity in flight. Call next_activity first.`;
    return `${tool}: this session is on '${state.frontier.join(', ')}', not the '${named}' you were `
      + 'dispatched for. Report the mismatch to your orchestrator rather than retrying without activity_id.';
  }
  if (state.frontier.length > 1) {
    return `${tool}: ${state.frontier.length} activities are in flight (${state.frontier.join(', ')}). `
      + 'Pass activity_id naming the one you were dispatched for, activity and instance together.';
  }
  return undefined;
}

/**
 * The refusal a tool that writes ONE activity id into the record owes while several are in flight.
 * Its subject is the ambiguity rather than the tool, so both callers report the same reading.
 */
export function ambiguousFrontier(state: SessionFile, action: string): string | undefined {
  if (state.frontier.length <= 1) return undefined;
  return `Cannot ${action}: ${state.frontier.length} activities are in flight (${state.frontier.join(', ')}).`;
}

/**
 * Project a `SessionFile` onto the abstract `SessionView` consumed by the validation helpers, so
 * the validation surface stays storage-agnostic. `act` is the activity the CALL is about, which
 * under a fan is a per-call resolution rather than a field of the record — so the caller passes
 * what it resolved, and an ordinary walk passes nothing and gets its sole entry.
 */
export function sessionView(state: SessionFile, act?: string): SessionView {
  return {
    wf: state.workflowId,
    act: act ?? (state.frontier.length === 1 ? state.frontier[0]! : ''),
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
  /**
   * Raw bytes of the on-disk top file this session was read from. The save
   * path compares them against the file to refuse a write built on a read
   * another call has since superseded.
   */
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
  options?: { planningRelativeDir?: string; searchRoots?: readonly string[] },
): Promise<LoadedSession> {
  const { folder, jsonPath } = await resolveSessionLocation(workspaceDir, sessionIndex, options);
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
  assertNotPreFrontier(rawTopState, folder);
  const state = jsonPath.length === 0 ? topState : navigatePath(topState, jsonPath);
  return { state, folderAbsPath: folder, bytes, jsonPath, topState };
}

/**
 * A session recorded before the frontier does not resume, and is refused rather than resumed
 * silently. Such a record carries the run's position in a scalar the schema no longer knows, so the
 * non-strict object strips it and the frontier's default supplies an empty list — a shape
 * indistinguishable from a session's first call, whose next transition would retire nothing and
 * enter as though the run were starting. The legacy converter never reaches one: it converts a
 * folder holding no session file, and a pre-frontier record is a session file.
 */
function assertNotPreFrontier(raw: unknown, folder: string): void {
  if (typeof raw !== 'object' || raw === null) return;
  const record = raw as Record<string, unknown>;
  const scalar = record['currentActivity'];
  if (typeof scalar !== 'string' || 'frontier' in record) return;
  throw new SessionStoreError(
    `session.json in ${folder} predates the frontier: it records one current activity ('${scalar}') `
    + 'where the run\'s position is now the list of activities in flight. Such a record has no '
    + 'position to resume from — reading it would look like a session that has not started, and the '
    + 'next transition would retire nothing. Start a fresh session.',
    'SEAL_MISMATCH',
    { folder },
  );
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
 * and that whole top file is re-canonicalised, sealed, and written.
 *
 * `mutateTop` composes further changes onto the top file about to be written,
 * so a change spanning an embedded session and the parent holding it lands in
 * one write — see `closeLaunchedRecord`.
 *
 * The write is a compare-and-swap against the bytes `loaded` was read from:
 * a parent and its children share one file, so a call that composed its
 * change from a superseded read is refused with `STALE_WRITE` rather than
 * replacing what landed in between. The caller reloads and composes again.
 *
 * Returns the canonical bytes written and the seal hex.
 */
export async function saveSessionForTool(
  loaded: LoadedSession,
  newState: SessionFile,
  mutateTop?: (top: SessionFile) => void,
): Promise<{ bytes: string; seal: string }> {
  const newTopState = loaded.jsonPath.length === 0
    ? newState
    : replacePath(loaded.topState, loaded.jsonPath, newState);
  if (mutateTop) mutateTop(newTopState);
  return replaceSessionFile(loaded.folderAbsPath, newTopState, loaded.bytes);
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
      return `${err.message}. Two planning folders hashed to the same session_index — recreate the colliding session(s) or remove a stale folder under the active planning root (legacy: .engineering/artifacts/planning/; repo mode: artifacts/planning/ under the engineering checkout).`;
    case 'SEAL_MISMATCH':
      return `${err.message}. The session.json (or its parsed contents) does not match the seal recorded in .session-token — a rotated signing key is the likely cause. Restore the folder from the most recent commit before retrying. Nothing was written.`;
    case 'FOLDER_OCCUPIED': {
      const occupiedIndex = err.details?.['session_index'];
      const continueHint =
        typeof occupiedIndex === 'string'
          ? `Pass session_index ${occupiedIndex} to continue that run, or pass a distinct planning_folder to open another.`
          : 'Pass that session_index to continue it, or pass a distinct planning_folder to open another.';
      return `${err.message}. The folder already holds a run; nothing was written. ${continueHint}`;
    }
    case 'STALE_WRITE':
      return `${err.message}. CALL THIS TOOL AGAIN with the same arguments. Nothing was written, so the repeat is not a double-record: it reads the state as it now stands and applies your change to that. Another call recorded against this session while this one was in flight, and admitting this write would have discarded what that call recorded. Two calls in flight against one session produce this — a parent and its children share a single file, so a parent and one of its children count as two. Keep one call in flight per session and it does not arise.`;
    case 'WORKSPACE_INVALID':
      return `${err.message}. Restart the server with a valid --workspace=PATH (or WORKFLOW_WORKSPACE / WORKTREE_ROOT), or pass repo on start_session when using an install multi-root.`;
    default:
      return err.message;
  }
}
