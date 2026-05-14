/**
 * Legacy session-state migration converter.
 *
 * Converts a pre-Phase-5 planning folder (containing
 * `workflow-state.json` + legacy `.session-token` token) into the new
 * server-managed shape (`session.json` + new `.session-token` seal pair).
 *
 * Invocation model:
 *   - `start_session` calls `migratePlanningFolder(folder)` against the
 *     resolved planning folder before deciding whether to resume or create.
 *   - Pure detect-on-read: if `session.json` already exists, the converter
 *     short-circuits and returns `{ migrated: false, reason: 'already-migrated' }`.
 *   - If neither `session.json` nor `workflow-state.json` is present, the
 *     folder is fresh and the converter returns
 *     `{ migrated: false, reason: 'no-legacy-state' }`.
 *
 * Failure surface:
 *   - Corrupt legacy envelope (JSON parse failure, missing required fields)
 *     throws a tagged error that surfaces a recovery hint pointing at the
 *     legacy path.
 *   - Legacy token decode failure (no `.session-token`, or malformed payload)
 *     is non-fatal: the converter falls back to a minimal session shape
 *     reconstructed from whatever fields the envelope itself carries.
 *
 * Test cases: PR116-TC-51 .. PR116-TC-58 (migration variants + idempotency +
 * error paths).
 */

import { readFile, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import {
  PLANNING_FILE_MODE,
  SESSION_FILE_NAME,
  SEAL_FILE_NAME,
  SessionStoreError,
  sessionFileExists,
  writeSessionFile,
} from './session-store.js';
import { computeSessionIndex } from './session-index.js';
import {
  createInitialSessionFile,
  safeValidateSessionFile,
  type SessionFile,
} from '../schema/session.schema.js';

/** Filename of the legacy state envelope. */
export const LEGACY_STATE_FILE_NAME = 'workflow-state.json';

/**
 * Outcome of a migration attempt. `migrated: true` indicates that
 * `session.json` + new seal were written and legacy artifacts cleaned up;
 * `migrated: false` indicates the converter short-circuited (already
 * migrated, or no legacy state present).
 */
export interface MigrationResult {
  migrated: boolean;
  reason:
    | 'already-migrated'
    | 'no-legacy-state'
    | 'converted-from-envelope'
    | 'converted-from-orphan-token';
  /** When `migrated: true`, the resulting SessionFile. */
  state?: SessionFile;
}

/**
 * Domain-tagged error raised when a legacy folder cannot be migrated. The
 * message is user-facing and points at the legacy path; the caller is
 * expected to surface it verbatim in the MCP error response.
 */
export class MigrationError extends Error {
  constructor(message: string, readonly folder: string) {
    super(message);
    this.name = 'MigrationError';
  }
}

/**
 * Decode the b64.signature legacy token payload WITHOUT verifying the HMAC
 * signature. The old server may have signed the token with a key that no
 * longer matches (key rotation, server reinstall); we only need the payload
 * fields (`wf`, `v`, `sid`, `aid`, `act`, plus optional `psid`, `pwf`, `pact`,
 * `pv`) to reconstruct a `SessionFile`. Returns `null` for any structural
 * failure (no `.`-separator, base64 decode failure, JSON parse failure).
 */
function decodeLegacyPayload(token: string): Record<string, unknown> | null {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return null;
  const b64 = token.substring(0, dotIndex);
  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as unknown;
    if (parsed === null || typeof parsed !== 'object') return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Read the legacy `.session-token` if present. Returns the trimmed raw token
 * string, or `null` if the file does not exist. Other read errors propagate.
 */
async function readLegacyToken(folder: string): Promise<string | null> {
  try {
    const raw = await readFile(join(folder, SEAL_FILE_NAME), 'utf8');
    return raw.trim();
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Read the legacy `workflow-state.json` envelope if present. Returns parsed
 * JSON on success or `null` if the file does not exist. Throws
 * `MigrationError` on JSON parse failure (corrupt envelope).
 */
async function readLegacyEnvelope(folder: string): Promise<Record<string, unknown> | null> {
  const path = join(folder, LEGACY_STATE_FILE_NAME);
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }
    throw err;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== 'object') {
      throw new MigrationError(
        `migration: legacy ${LEGACY_STATE_FILE_NAME} at ${path} is not a JSON object — rerun against the most recent valid commit.`,
        folder,
      );
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof MigrationError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new MigrationError(
      `migration: legacy ${LEGACY_STATE_FILE_NAME} at ${path} could not be parsed as JSON (${msg}) — rerun against the most recent valid commit.`,
      folder,
    );
  }
}

/**
 * Coerce a value into a non-empty string, or `undefined` if it isn't one.
 */
function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Build a `SessionFile` from a decoded legacy token payload and the
 * envelope's `state` field (if any). Drops history (legacy `event`-keyed
 * entries don't match the new `type`-keyed schema; the trace store is the
 * authoritative event log going forward).
 */
function buildSessionFromLegacy(args: {
  sessionIndex: string;
  legacyPayload: Record<string, unknown> | null;
  envelopeState: Record<string, unknown> | null;
  startedAtIso?: string;
}): SessionFile {
  const payload = args.legacyPayload ?? {};
  const state = args.envelopeState ?? {};

  const workflowId = asString(payload['wf']) ?? asString(state['workflowId']) ?? 'meta';
  const workflowVersion =
    asString(payload['v']) ?? asString(state['workflowVersion']) ?? '0.0.0';
  const agentId = asString(payload['aid']) ?? 'orchestrator';
  const currentActivity = asString(payload['act']) ?? asString(state['currentActivity']) ?? '';
  const currentSkill = asString(payload['skill']) ?? asString(state['currentSkill']) ?? '';
  const condition = asString(payload['cond']) ?? '';

  // Build minimal valid SessionFile with the resolved sessionIndex.
  const base = createInitialSessionFile({
    sessionIndex: args.sessionIndex,
    workflowId,
    workflowVersion: /^\d+\.\d+\.\d+$/.test(workflowVersion) ? workflowVersion : '0.0.0',
    agentId,
  });

  // Override startedAt from envelope if present (preserves session age).
  const startedAt =
    args.startedAtIso ??
    asString(state['startedAt']) ??
    base.startedAt;

  // Carry over variables / completedActivities / skippedActivities /
  // checkpointResponses verbatim when they exist in the envelope. History is
  // intentionally dropped (format mismatch).
  const variables =
    state['variables'] && typeof state['variables'] === 'object'
      ? (state['variables'] as Record<string, unknown>)
      : {};
  const completedActivities = Array.isArray(state['completedActivities'])
    ? (state['completedActivities'] as unknown[]).filter(
        (v): v is string => typeof v === 'string',
      )
    : [];
  const skippedActivities = Array.isArray(state['skippedActivities'])
    ? (state['skippedActivities'] as unknown[]).filter(
        (v): v is string => typeof v === 'string',
      )
    : [];
  const checkpointResponses =
    state['checkpointResponses'] && typeof state['checkpointResponses'] === 'object'
      ? (state['checkpointResponses'] as Record<string, unknown>)
      : {};

  // Legacy `checkpointResponses` may be `{ checkpointId: optionId }` (bare
  // string) or `{ "activityId-checkpointId": CheckpointResponse }`. Normalise
  // the bare-string form into the new CheckpointResponse shape so the schema
  // validates; key prefixing is best-effort (we use the legacy key verbatim
  // when activity is unknown).
  const normalisedResponses: Record<string, unknown> = {};
  const respondedAt = new Date(0).toISOString();
  for (const [key, value] of Object.entries(checkpointResponses)) {
    if (typeof value === 'string') {
      normalisedResponses[key] = { optionId: value, respondedAt };
    } else if (
      value !== null &&
      typeof value === 'object' &&
      'optionId' in (value as Record<string, unknown>)
    ) {
      normalisedResponses[key] = value;
    }
    // Anything else is silently dropped — the trace store is the authoritative
    // event log; we don't want to fail migration over an exotic legacy shape.
  }

  const result: SessionFile = {
    ...base,
    startedAt,
    currentActivity,
    currentSkill,
    condition,
    variables,
    completedActivities,
    skippedActivities,
    checkpointResponses: normalisedResponses as SessionFile['checkpointResponses'],
  };
  return result;
}

/**
 * Probe the legacy state envelope for an *embedded* `sessionToken` field
 * (the pre-split format used before the token was moved into a sibling
 * `.session-token` file). Returns the embedded token if present.
 */
function extractEmbeddedToken(envelope: Record<string, unknown> | null): string | null {
  if (!envelope) return null;
  const v = envelope['sessionToken'];
  return asString(v) ?? null;
}

/**
 * Migrate a planning folder from legacy session-state to the new
 * server-managed shape. Idempotent (detect-on-read short-circuits) and safe
 * to call against folders that have already been migrated.
 *
 * Side effects on success (`migrated: true`):
 *   - Writes `session.json` (canonical) + `.session-token` (seal hex,
 *     overwriting the legacy token in place) atomically.
 *   - Deletes the legacy `workflow-state.json`.
 *
 * Side effects on short-circuit (`migrated: false`):
 *   - None.
 */
export async function migratePlanningFolder(
  folderAbsPath: string,
): Promise<MigrationResult> {
  // 1. Already migrated?
  if (await sessionFileExists(folderAbsPath)) {
    return { migrated: false, reason: 'already-migrated' };
  }

  // 2. Read whatever legacy artefacts are present.
  const envelope = await readLegacyEnvelope(folderAbsPath);
  const legacyToken = await readLegacyToken(folderAbsPath);
  const embeddedToken = extractEmbeddedToken(envelope);

  // 3. No legacy artefacts → fresh folder; nothing to do.
  if (!envelope && !legacyToken) {
    return { migrated: false, reason: 'no-legacy-state' };
  }

  // 4. Resolve the session_index from the folder path (canonical).
  const sessionIndex = await computeSessionIndex(folderAbsPath);

  // 5. Decode the legacy token. Prefer the sibling file, fall back to the
  //    embedded form, then to no token at all (orphan-envelope case).
  const tokenToDecode = legacyToken ?? embeddedToken ?? null;
  let legacyPayload: Record<string, unknown> | null = null;
  if (tokenToDecode) {
    legacyPayload = decodeLegacyPayload(tokenToDecode);
    if (!legacyPayload && !envelope) {
      // Orphan token (no envelope) AND undecodable — surface error.
      throw new MigrationError(
        `migration: legacy ${SEAL_FILE_NAME} at ${folderAbsPath} could not be decoded as a session-token payload and no ${LEGACY_STATE_FILE_NAME} is present — rerun against the most recent valid commit.`,
        folderAbsPath,
      );
    }
  }

  // 6. Build the new SessionFile.
  const envelopeState =
    envelope && envelope['state'] && typeof envelope['state'] === 'object'
      ? (envelope['state'] as Record<string, unknown>)
      : null;
  const startedAtIso = envelope ? asString(envelope['startedAt']) : undefined;
  const args: {
    sessionIndex: string;
    legacyPayload: Record<string, unknown> | null;
    envelopeState: Record<string, unknown> | null;
    startedAtIso?: string;
  } = {
    sessionIndex,
    legacyPayload,
    envelopeState,
  };
  if (startedAtIso) args.startedAtIso = startedAtIso;
  const sessionFile = buildSessionFromLegacy(args);

  // 7. Schema-validate before writing — refuse to write garbage.
  const parsed = safeValidateSessionFile(sessionFile);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new MigrationError(
      `migration: reconstructed session.json at ${folderAbsPath} does not match the SessionFile schema (${issues}) — the legacy envelope is too incomplete to migrate; recreate the session.`,
      folderAbsPath,
    );
  }

  // 8. Write atomically (session.json first, then seal). The seal write
  //    overwrites the legacy `.session-token` in place; the legacy envelope
  //    is then deleted to complete the cutover.
  await writeSessionFile(folderAbsPath, parsed.data);
  await maybeUnlink(join(folderAbsPath, LEGACY_STATE_FILE_NAME));

  return {
    migrated: true,
    reason: envelope ? 'converted-from-envelope' : 'converted-from-orphan-token',
    state: parsed.data,
  };
}

/**
 * Best-effort unlink; silently ignores ENOENT (file already absent).
 */
async function maybeUnlink(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return;
    }
    throw err;
  }
}

/**
 * Convert a thrown migration error into a user-facing message; mirrors the
 * `describeSessionStoreError` helper so `start_session` can present a uniform
 * surface.
 */
export function describeMigrationError(err: unknown): string {
  if (err instanceof MigrationError) return err.message;
  if (err instanceof SessionStoreError) return err.message;
  return err instanceof Error ? err.message : String(err);
}

/**
 * Test-visible helper: probe for any legacy artifacts in a folder without
 * triggering the conversion. Returns `true` if either the envelope or the
 * legacy token is present. Used in tests and diagnostic tooling.
 */
export async function hasLegacyArtifacts(folderAbsPath: string): Promise<boolean> {
  try {
    const envSt = await stat(join(folderAbsPath, LEGACY_STATE_FILE_NAME));
    if (envSt.isFile()) return true;
  } catch {
    /* swallow */
  }
  try {
    const tokSt = await stat(join(folderAbsPath, SEAL_FILE_NAME));
    if (tokSt.isFile()) {
      // Distinguish a legacy token from a server-written seal. The new seal
      // is exactly 64 hex chars (HMAC-SHA256); the legacy token is a
      // b64url payload + "." + 64-char hex signature (usually >100 chars).
      const raw = (await readFile(join(folderAbsPath, SEAL_FILE_NAME), 'utf8')).trim();
      if (raw.includes('.')) return true;
    }
  } catch {
    /* swallow */
  }
  return false;
}

/** Re-export for callers that need the constant. */
export { PLANNING_FILE_MODE };
