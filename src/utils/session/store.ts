import {
  mkdir,
  open,
  readFile,
  readdir,
  rm,
  stat,
} from 'node:fs/promises';
import {
  closeSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { tmpdir } from 'node:os';
import { getOrCreateServerKey } from './crypto.js';
import type { SessionJsonPath } from './derivation.js';
import { assertPathInsideRoot } from '../../worktree-validator.js';

/**
 * Tiny FS adapter object used internally by `swapIntoPlace`. Existing only so
 * tests can swap in a `rename` that throws EXDEV without using `vi.mock` on
 * `node:fs` (which is brittle across ESM/CJS interop). Production code never
 * touches this object.
 */
const fsAdapter: { renameSync: typeof renameSync } = { renameSync };

/** @internal — test hook. Overrides the rename used when a staged file is swapped into place. */
export function _setRenameForTests(fn: typeof renameSync | undefined): void {
  fsAdapter.renameSync = fn ?? renameSync;
}

/**
 * Filename of the JSON state file inside a planning folder. Owned and
 * mutated by the server; agent code reads it but never writes it.
 */
export const SESSION_FILE_NAME = 'session.json';

/**
 * Filename of the seal file inside a planning folder. Contains the
 * hex-encoded HMAC-SHA-256 of the canonical `session.json` bytes; tampering
 * with `session.json` invalidates the seal, which the server detects on the
 * next authenticated call.
 */
export const SEAL_FILE_NAME = '.session-token';

/**
 * Default subdirectory under the **engineering** root that holds planning
 * folders (legacy single-root: engineering root === workspace root).
 * Every session lives at `<engineeringDir>/<activeRelativeDir>/<slug>/`
 * (call sites pass `resolveEngineeringDir(config)` into `planningRoot`).
 * Repo / split-root mode uses `artifacts/planning` instead (see
 * `REPO_PLANNING_RELATIVE_DIR` in config). Override once at startup via
 * `setPlanningRelativeDir` (from `PLANNING_SLUG` / config).
 */
export const PLANNING_RELATIVE_DIR = '.engineering/artifacts/planning';

/** Active planning relative directory used by `planningRoot`. */
let activePlanningRelativeDir = PLANNING_RELATIVE_DIR;

/**
 * Set the planning relative directory used by `planningRoot`. Empty / whitespace
 * falls back to `PLANNING_RELATIVE_DIR`. Call once at server startup from
 * `createServer` / `loadConfig` — prefer this over scattered `process.env` reads
 * on hot paths.
 */
export function setPlanningRelativeDir(relativeDir: string): void {
  const trimmed = relativeDir.trim();
  activePlanningRelativeDir = trimmed || PLANNING_RELATIVE_DIR;
}

/** Directory mode for planning folders (`drwx------`). */
export const PLANNING_DIR_MODE = 0o700;

/** File mode for `session.json` and `.session-token` (`-rw-------`). */
export const PLANNING_FILE_MODE = 0o600;

/**
 * Domain-tagged error for session-store failures. Distinguishes resolution /
 * collision / seal-mismatch faults from generic FS errors so callers can map
 * them onto user-facing MCP responses without inspecting message strings.
 */
export class SessionStoreError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'NOT_FOUND'
      | 'COLLISION'
      | 'SEAL_MISMATCH'
      | 'INVALID_INDEX'
      | 'STALE_WRITE'
      | 'WORKSPACE_INVALID',
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'SessionStoreError';
  }
}

/**
 * Top-level key priority for `canonicaliseJson`. Keys that appear in this list
 * are emitted in this order at depth 0 of an object; keys not in the list fall
 * back to lexicographic order after the priority block. Nested objects are
 * still sorted lexicographically. Purpose: produce a human-friendly layout
 * for `session.json` (current state up top, audit fields next, history last)
 * without sacrificing determinism.
 */
const TOP_LEVEL_KEY_PRIORITY = [
  'schemaVersion',
  'status',
  'workflowId',
  'workflowVersion',
  'agentId',
  'sessionIndex',
  'planningFolderPath',
  'frontier',
  'currentTechnique',
  'exit',
  'activeCheckpoint',
  'seq',
  'ts',
  'startedAt',
  'completedActivities',
  'variables',
  'checkpointResponses',
  'history',
  'triggeredWorkflows',
];

/**
 * Canonicalise an arbitrary JSON-serialisable value to a deterministic UTF-8
 * byte string. Keys at depth 0 follow `TOP_LEVEL_KEY_PRIORITY` first (then
 * lexicographic); nested objects sort lexicographically at every depth.
 * Arrays preserve order; `undefined` values are dropped. Output is pretty-
 * printed with 2-space indentation. Deterministic because key order and
 * whitespace rules are fixed. The output is the byte sequence that gets
 * HMAC-sealed and written to disk.
 */
export function canonicaliseJson(value: unknown): string {
  return canonicaliseValue(value, 0);
}

const INDENT = '  ';

function sortedKeys(obj: Record<string, unknown>, depth: number): string[] {
  const present = Object.keys(obj).filter((k) => obj[k] !== undefined);
  if (depth !== 0) return present.sort();
  const priority = TOP_LEVEL_KEY_PRIORITY.filter((k) => present.includes(k));
  const remaining = present.filter((k) => !TOP_LEVEL_KEY_PRIORITY.includes(k)).sort();
  return [...priority, ...remaining];
}

function canonicaliseValue(v: unknown, depth: number): string {
  if (v === null) return 'null';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) {
      throw new SessionStoreError(
        `canonicaliseJson: refusing to serialise non-finite number (${String(v)}); session-state values must round-trip through JSON.`,
        'INVALID_INDEX',
      );
    }
    return JSON.stringify(v);
  }
  if (typeof v === 'string' || typeof v === 'boolean') return JSON.stringify(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    const inner = INDENT.repeat(depth + 1);
    const outer = INDENT.repeat(depth);
    return '[\n' + v.map((item) => inner + canonicaliseValue(item, depth + 1)).join(',\n') + '\n' + outer + ']';
  }
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    const keys = sortedKeys(obj, depth);
    if (keys.length === 0) return '{}';
    const inner = INDENT.repeat(depth + 1);
    const outer = INDENT.repeat(depth);
    return (
      '{\n' +
      keys
        .map((k) => `${inner}${JSON.stringify(k)}: ${canonicaliseValue(obj[k], depth + 1)}`)
        .join(',\n') +
      '\n' + outer + '}'
    );
  }
  // `undefined`, functions, symbols — dropped at the parent level. If we
  // reach this branch at the root, that's a caller bug.
  throw new SessionStoreError(
    `canonicaliseJson: unsupported value type ${typeof v} at root`,
    'INVALID_INDEX',
  );
}

/**
 * Compute the seal hex string for a given canonical JSON byte sequence.
 * Equivalent to `hmacSign` from `crypto.ts` but accepts a buffer input.
 */
async function computeSeal(canonicalJson: string): Promise<string> {
  const key = await getOrCreateServerKey();
  return createHmac('sha256', key).update(canonicalJson, 'utf8').digest('hex');
}

/** A file written to its own directory as `<path>.tmp.…`, awaiting its swap. */
interface StagedFile {
  /** Absolute path of the temp file holding the new contents. */
  tmp: string;
  /** Final destination the temp file is swapped onto. */
  dest: string;
  /** The bytes staged, reused by the cross-device fallback. */
  data: Buffer;
  /** Mode the destination is created with on the cross-device path. */
  mode: number;
}

/**
 * Stage `contents` for `path`: create the parent directory, write the bytes to
 * `<path>.tmp.<pid>.<ts>.<rand>`, and fsync them. Staging touches nothing a
 * reader can see; `swapIntoPlace` publishes the result.
 *
 * The temp file lands in the destination's own directory, so the swap is a
 * rename within one directory.
 */
async function stageFile(
  path: string,
  contents: string,
  mode: number,
): Promise<StagedFile> {
  await mkdir(dirname(path), { recursive: true, mode: PLANNING_DIR_MODE });
  const tmp = `${path}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  const data = Buffer.from(contents, 'utf8');
  const fh = await open(tmp, 'w', mode);
  try {
    await fh.writeFile(data);
    await fh.sync();
  } finally {
    await fh.close();
  }
  return { tmp, dest: path, data, mode };
}

/** Remove a staged temp file that will not be published. */
function discardStaged(staged: StagedFile): void {
  try {
    unlinkSync(staged.tmp);
  } catch {
    /* tmp cleanup is best-effort */
  }
}

/**
 * Publish a staged file by renaming it over its destination.
 *
 * Synchronous throughout, which is what lets `persistSessionFile` read the
 * destination and swap in one indivisible step: this process runs no other
 * request between the two, so a compare-and-swap cannot be split by a
 * concurrent write.
 *
 * Falls back to copy+fsync+unlink on EXDEV (cross-device). A staged file sits
 * in its destination's directory, so the fallback covers only exotic layouts
 * where that directory spans devices.
 */
function swapIntoPlace(staged: StagedFile): void {
  try {
    fsAdapter.renameSync(staged.tmp, staged.dest);
    return;
  } catch (err: unknown) {
    if (!(err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'EXDEV')) {
      discardStaged(staged);
      throw err;
    }
  }
  const fd = openSync(staged.dest, 'w', staged.mode);
  try {
    writeFileSync(fd, staged.data);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  discardStaged(staged);
}

/**
 * Best-effort directory fsync so a completed swap hits the disk before the
 * caller returns. Some filesystems (notably tmpfs on macOS) reject O_RDONLY
 * on a directory; failures are ignored, so this is defence in depth rather
 * than load-bearing.
 */
async function syncDirectory(path: string): Promise<void> {
  try {
    const dirFh = await open(path, 'r');
    try {
      await dirFh.sync();
    } finally {
      await dirFh.close();
    }
  } catch {
    /* ignore */
  }
}

/** Absolute path to `session.json` inside a planning folder. */
export function sessionFilePath(folderAbsPath: string): string {
  return join(folderAbsPath, SESSION_FILE_NAME);
}

/** Absolute path to `.session-token` inside a planning folder. */
export function sealFilePath(folderAbsPath: string): string {
  return join(folderAbsPath, SEAL_FILE_NAME);
}

/**
 * Read and parse `session.json` from a planning folder. Returns the parsed
 * JSON value plus the exact byte sequence read so callers verifying the seal
 * can rehash the unmodified bytes (avoids re-canonicalisation drift on
 * re-read).
 *
 * Throws SessionStoreError(NOT_FOUND) when the file is missing — callers can
 * branch on this to detect "fresh session" vs. "should resume".
 */
export async function readSessionFile(
  folderAbsPath: string,
): Promise<{ state: unknown; bytes: string }> {
  const path = sessionFilePath(folderAbsPath);
  let bytes: string;
  try {
    bytes = await readFile(path, 'utf8');
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new SessionStoreError(
        `session.json not found in ${folderAbsPath}`,
        'NOT_FOUND',
        { folder: folderAbsPath },
      );
    }
    throw err;
  }
  let state: unknown;
  try {
    state = JSON.parse(bytes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new SessionStoreError(
      `session.json in ${folderAbsPath} is not valid JSON: ${msg}`,
      'SEAL_MISMATCH',
      { folder: folderAbsPath },
    );
  }
  return { state, bytes };
}

/**
 * Write `state` to `session.json` and its seal to `.session-token`.
 *
 * Both files are staged first and then swapped into place synchronously, state
 * before seal, so a reader never observes half a file and never observes a
 * seal from one state beside another. When `expectedBytes` is supplied, the
 * bytes on disk are compared against it in that same synchronous step and the
 * swap is abandoned on any difference — the compare-and-swap that
 * `replaceSessionFile` exposes.
 *
 * Returns the canonical JSON bytes written and the seal hex, so a caller can
 * populate a response envelope, or expect these bytes on its next write,
 * without re-reading the file.
 */
async function persistSessionFile(
  folderAbsPath: string,
  state: unknown,
  expectedBytes?: string,
): Promise<{ bytes: string; seal: string }> {
  await mkdir(folderAbsPath, { recursive: true, mode: PLANNING_DIR_MODE });
  const bytes = canonicaliseJson(state);
  const seal = await computeSeal(bytes);
  const statePath = sessionFilePath(folderAbsPath);
  const stagedState = await stageFile(statePath, bytes, PLANNING_FILE_MODE);
  const stagedSeal = await stageFile(sealFilePath(folderAbsPath), seal, PLANNING_FILE_MODE);

  if (expectedBytes !== undefined) {
    let onDisk: string | undefined;
    try {
      onDisk = readFileSync(statePath, 'utf8');
    } catch {
      onDisk = undefined;
    }
    if (onDisk !== expectedBytes) {
      discardStaged(stagedState);
      discardStaged(stagedSeal);
      throw new SessionStoreError(
        `stale write refused for ${folderAbsPath}: session.json changed since it was read` +
          `${onDisk === undefined ? ' (the file is now absent)' : ''}`,
        'STALE_WRITE',
        { folder: folderAbsPath },
      );
    }
  }
  try {
    swapIntoPlace(stagedState);
  } catch (err) {
    // The seal was staged for a state that never landed; drop it so the
    // folder is left holding the pair it already had.
    discardStaged(stagedSeal);
    throw err;
  }
  swapIntoPlace(stagedSeal);

  await syncDirectory(folderAbsPath);
  return { bytes, seal };
}

/**
 * Write `state` to a planning folder unconditionally, replacing whatever the
 * folder holds. For a session file no read stands behind: a fresh session, a
 * migrated legacy folder, a promoted transient parent.
 *
 * A write that carries forward state read from disk goes through
 * `replaceSessionFile` instead, so a concurrent write is refused rather than
 * overwritten.
 */
export async function writeSessionFile(
  folderAbsPath: string,
  state: unknown,
): Promise<{ bytes: string; seal: string }> {
  return persistSessionFile(folderAbsPath, state);
}

/**
 * Write `state` to a planning folder only while `session.json` still holds
 * `expectedBytes` — the bytes the caller's state was read from, as returned by
 * `readSessionFile`, `verifySeal` or a prior write.
 *
 * Throws `SessionStoreError(STALE_WRITE)` when the file has changed or gone,
 * leaving both files as they are. The caller reloads and composes its change
 * against what is now on disk; nothing recorded in between is lost.
 */
export async function replaceSessionFile(
  folderAbsPath: string,
  state: unknown,
  expectedBytes: string,
): Promise<{ bytes: string; seal: string }> {
  return persistSessionFile(folderAbsPath, state, expectedBytes);
}

/**
 * Write a seal over an already-known JSON byte sequence (e.g. when the
 * caller has the canonical bytes from a prior write and only needs to
 * refresh the seal). Exposed mainly for tests; production code uses
 * `writeSessionFile` / `replaceSessionFile`, which write both files in the
 * correct order.
 */
export async function writeSeal(
  folderAbsPath: string,
  jsonBytes: string,
): Promise<string> {
  const seal = await computeSeal(jsonBytes);
  const sealPath = sealFilePath(folderAbsPath);
  swapIntoPlace(await stageFile(sealPath, seal, PLANNING_FILE_MODE));
  await syncDirectory(dirname(sealPath));
  return seal;
}

/**
 * Verify that `.session-token` in `folderAbsPath` is the HMAC of the exact
 * bytes currently in `session.json`. Returns the parsed state on success;
 * throws `SessionStoreError(SEAL_MISMATCH)` on any drift (hand-edit,
 * whitespace change, torn write).
 *
 * The comparison uses `timingSafeEqual` over the hex strings; the seal is
 * not secret per se, but a constant-time check costs nothing and keeps the
 * code uniform with the existing `hmacVerify` helper.
 */
export async function verifySeal(
  folderAbsPath: string,
): Promise<{ state: unknown; bytes: string }> {
  const { state, bytes } = await readSessionFile(folderAbsPath);
  let sealHex: string;
  try {
    sealHex = (await readFile(sealFilePath(folderAbsPath), 'utf8')).trim();
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new SessionStoreError(
        `.session-token missing in ${folderAbsPath} — session.json is present but unsealed`,
        'SEAL_MISMATCH',
        { folder: folderAbsPath },
      );
    }
    throw err;
  }
  const expected = await computeSeal(bytes);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(sealHex, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new SessionStoreError(
      `seal mismatch in ${folderAbsPath}: session.json has been modified outside the server`,
      'SEAL_MISMATCH',
      { folder: folderAbsPath },
    );
  }
  return { state, bytes };
}

/**
 * Absolute path to the planning-folder root for a workspace.
 * `<workspaceDir>/<activePlanningRelativeDir>` (default
 * `.engineering/artifacts/planning`). Signature is intentionally one argument
 * — configure the relative segment via `setPlanningRelativeDir` at startup.
 */
/**
 * Planning directory under an engineering (or legacy workspace) root.
 * Optional `relativeDir` overrides the process-global slug for this call —
 * used when multi-root sessions always use `artifacts/planning` under each
 * repo checkout while legacy single-root keeps `.engineering/artifacts/planning`.
 */
export function planningRoot(workspaceDir: string, relativeDir?: string): string {
  const rel = relativeDir?.trim() || activePlanningRelativeDir;
  return join(workspaceDir, rel);
}

/**
 * Result of `resolveSessionLocation` — the absolute path to the top-level
 * planning folder and the JSON path to navigate inside `session.json` to
 * reach the addressed SessionFile. `jsonPath` is empty when the index
 * identifies the top-level (root) session of the folder.
 */
export interface SessionLocation {
  folder: string;
  jsonPath: import('./derivation.js').SessionJsonPath;
}

/**
 * Resolve a `session_index` to its location in the workspace: a top-level
 * planning folder + the jsonPath of the embedded SessionFile (empty path
 * for the root session). Walks top-level folders, reading each folder's
 * `session.json` to match the stored `sessionIndex` field at the root and
 * recursively under `triggeredWorkflows[i].state`.
 *
 * Transient (in-memory) sessions resolve via the registry first.
 */
/**
 * Search one engineering root for a session_index. Returns all matches
 * (caller aggregates across multi-root checkouts).
 */
async function findSessionsInEngineeringRoot(
  engineeringDir: string,
  sessionIndex: string,
  planningRelativeDir?: string,
): Promise<SessionLocation[]> {
  const root = planningRoot(engineeringDir, planningRelativeDir);
  let topEntries: Array<{ name: string; isDirectory: () => boolean; isSymbolicLink: () => boolean }>;
  try {
    topEntries = await readdir(root, { withFileTypes: true });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const matches: SessionLocation[] = [];

  function walkEmbedded(topState: unknown, folder: string, prefix: SessionJsonPath): void {
    if (!topState || typeof topState !== 'object') return;
    const tw = (topState as { triggeredWorkflows?: unknown }).triggeredWorkflows;
    if (!Array.isArray(tw)) return;
    for (let i = 0; i < tw.length; i++) {
      const entry = tw[i];
      if (!entry || typeof entry !== 'object') continue;
      const childState = (entry as { state?: unknown }).state;
      if (!childState || typeof childState !== 'object') continue;
      const childPath: SessionJsonPath = [...prefix, 'triggeredWorkflows', i, 'state'];
      const idx = (childState as { sessionIndex?: unknown }).sessionIndex;
      if (typeof idx === 'string' && idx === sessionIndex) {
        matches.push({ folder, jsonPath: childPath });
      }
      walkEmbedded(childState, folder, childPath);
    }
  }

  async function walkFolders(dirPath: string): Promise<void> {
    let dirEntries: typeof topEntries;
    try {
      dirEntries = await readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of dirEntries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const folderPath = resolve(dirPath, entry.name);
      try {
        const st = await stat(folderPath);
        if (!st.isDirectory()) continue;
        try {
          const { state } = await readSessionFile(folderPath);
          const rootIdx = (state as { sessionIndex?: unknown }).sessionIndex;
          if (typeof rootIdx === 'string' && rootIdx === sessionIndex) {
            matches.push({ folder: folderPath, jsonPath: [] });
          }
          walkEmbedded(state, folderPath, []);
        } catch {
          /* keep recursing */
        }
      } catch {
        continue;
      }
      await walkFolders(folderPath);
    }
  }

  for (const entry of topEntries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const folderPath = resolve(root, entry.name);
    try {
      const st = await stat(folderPath);
      if (!st.isDirectory()) continue;
      try {
        const { state } = await readSessionFile(folderPath);
        const rootIdx = (state as { sessionIndex?: unknown }).sessionIndex;
        if (typeof rootIdx === 'string' && rootIdx === sessionIndex) {
          matches.push({ folder: folderPath, jsonPath: [] });
        }
        walkEmbedded(state, folderPath, []);
      } catch {
        /* no session.json at this level */
      }
    } catch {
      continue;
    }
    await walkFolders(folderPath);
  }

  return matches;
}

export async function resolveSessionLocation(
  workspaceDir: string,
  sessionIndex: string,
  options?: { planningRelativeDir?: string; searchRoots?: readonly string[] },
): Promise<SessionLocation> {
  if (!isAbsolute(workspaceDir)) {
    throw new SessionStoreError(
      `resolveSessionLocation: workspaceDir must be absolute, got ${workspaceDir}`,
      'WORKSPACE_INVALID',
      { workspaceDir },
    );
  }
  if (!/^[A-Z2-7]{6}$/.test(sessionIndex)) {
    throw new SessionStoreError(
      `resolveSessionLocation: session_index must be 6 uppercase RFC 4648 base32 characters (A-Z, 2-7), got '${sessionIndex}'`,
      'INVALID_INDEX',
      { sessionIndex },
    );
  }

  // Transient (meta-bootstrap) sessions live under os.tmpdir() and never
  // appear in the workspace enumeration. They are always at the root of
  // their tmp folder (no embedded children for transients).
  const transient = transientFolderByIndex.get(sessionIndex);
  if (transient) return { folder: transient, jsonPath: [] };

  const roots = options?.searchRoots?.length
    ? [...options.searchRoots]
    : [workspaceDir];
  const planningRel = options?.planningRelativeDir;
  const matches: SessionLocation[] = [];
  for (const eng of roots) {
    const found = await findSessionsInEngineeringRoot(eng, sessionIndex, planningRel);
    matches.push(...found);
  }

  if (matches.length === 0) {
    throw new SessionStoreError(
      `resolveSessionLocation: no session under ${roots.join(', ')} has session_index '${sessionIndex}'`,
      'NOT_FOUND',
      { workspaceDir, roots, sessionIndex },
    );
  }
  if (matches.length > 1) {
    throw new SessionStoreError(
      `resolveSessionLocation: session_index '${sessionIndex}' collides across ${matches.length} sessions`,
      'COLLISION',
      { workspaceDir, sessionIndex, candidates: matches },
    );
  }
  return matches[0] as SessionLocation;
}

/**
 * Validate a single-segment planning-folder slug. Rejects slashes,
 * backslashes, and `.` / `..` so callers can't escape the planning root.
 */
function assertValidSlug(slug: string): void {
  if (!slug || slug.includes('/') || slug.includes('\\') || slug === '.' || slug === '..') {
    throw new SessionStoreError(
      `planning slug must be a single path segment, got '${slug}'`,
      'INVALID_INDEX',
      { slug },
    );
  }
}

/**
 * Find a persistent planning folder by slug at any depth under the workspace
 * planning root. A folder matches when its basename equals the slug AND it
 * contains a `session.json`. Returns the absolute path of the first match,
 * `undefined` if no folder matches, or throws on slug collision (the same
 * slug used at multiple nesting depths).
 */
export async function findPlanningFolderBySlug(
  workspaceDir: string,
  slug: string,
  options?: { planningRelativeDir?: string; searchRoots?: readonly string[] },
): Promise<string | undefined> {
  assertValidSlug(slug);
  const roots = options?.searchRoots?.length
    ? [...options.searchRoots]
    : [workspaceDir];
  const planningRel = options?.planningRelativeDir;
  const matches: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries: Array<{ name: string; isDirectory: () => boolean; isSymbolicLink: () => boolean }>;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const folderPath = resolve(dir, entry.name);
      try {
        const st = await stat(folderPath);
        if (!st.isDirectory()) continue;
      } catch {
        continue;
      }
      if (entry.name === slug && await sessionFileExists(folderPath)) {
        matches.push(folderPath);
      }
      await walk(folderPath);
    }
  }

  for (const eng of roots) {
    const root = planningRoot(eng, planningRel);
    try {
      await walk(root);
    } catch {
      /* skip missing root */
    }
  }

  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];
  const sorted = [...matches].sort();
  throw new SessionStoreError(
    `findPlanningFolderBySlug: slug '${slug}' matches ${sorted.length} planning folders at different nesting depths: ${sorted.join(', ')}`,
    'COLLISION',
    { slug, candidates: sorted },
  );
}

/**
 * Create a top-level planning folder at
 * `<workspaceDir>/<activePlanningRelativeDir>/<slug>` with mode 0700.
 * Idempotent. Returns the absolute path. Requires the derived planning root
 * and folder path to resolve inside the configured worktree / workspace root.
 */
export async function ensurePlanningFolder(
  workspaceDir: string,
  slug: string,
  options?: { planningRelativeDir?: string },
): Promise<string> {
  assertValidSlug(slug);
  const absoluteWorkspace = resolve(workspaceDir);
  const root = planningRoot(absoluteWorkspace, options?.planningRelativeDir);
  // Assert derived paths stay inside the engineering/worktree root before mkdir.
  assertPathInsideRoot(absoluteWorkspace, root);
  const folder = resolve(root, slug);
  assertPathInsideRoot(absoluteWorkspace, folder);
  await mkdir(folder, { recursive: true, mode: PLANNING_DIR_MODE });
  return folder;
}

/**
 * Transient (bootstrap) session support. Orchestrator-only sessions (notably
 * the meta workflow) never need a workspace folder — their state lives only
 * long enough to dispatch a child workflow. On that dispatch the parent is
 * promoted to a durable workspace planning folder and the transient index is
 * repointed at it (see `dispatch_child`'s transient branch); the child is then
 * embedded under `triggeredWorkflows[0].state` in that file.
 *
 * To keep the workspace planning root free of one-shot bootstrap folders,
 * transient sessions live under `os.tmpdir()/workflow-server-transient-<uuid>/`
 * and are registered in an in-memory map keyed by `session_index` (and
 * optionally by slug for cross-call lookups during the same dispatch).
 *
 * Registry is process-local; on server restart, any /tmp leftovers are
 * orphaned and reaped by the OS.
 */
const TRANSIENT_DIR_PREFIX = 'workflow-server-transient-';
const transientFolderByIndex = new Map<string, string>();
const transientFolderBySlug = new Map<string, string>();

/** Create a fresh transient planning folder under `os.tmpdir()`. */
export async function createTransientFolder(): Promise<string> {
  const folder = join(tmpdir(), `${TRANSIENT_DIR_PREFIX}${randomUUID()}`);
  await mkdir(folder, { recursive: true, mode: PLANNING_DIR_MODE });
  return folder;
}

/** Register a transient folder so `resolveSessionLocation` and slug-lookup find it. */
export function registerTransient(
  sessionIndex: string,
  folder: string,
  slug?: string,
): void {
  transientFolderByIndex.set(sessionIndex, folder);
  if (slug) transientFolderBySlug.set(slug, folder);
}

/** Look up a transient folder by the slug it was registered under. */
export function lookupTransientBySlug(slug: string): string | undefined {
  return transientFolderBySlug.get(slug);
}

/** Reverse lookup: find the slug a transient folder was registered under. */
export function lookupTransientSlugByFolder(folder: string): string | undefined {
  for (const [slug, f] of transientFolderBySlug.entries()) {
    if (f === folder) return slug;
  }
  return undefined;
}

/** `true` if `folder` lives under the os.tmpdir() transient prefix. */
export function isTransientFolder(folder: string): boolean {
  return folder.startsWith(join(tmpdir(), TRANSIENT_DIR_PREFIX));
}

/**
 * Used by dispatch_child after promoting a transient parent to a workspace
 * planning folder. The caller's session_index (issued at start_session
 * against the tmp folder) would otherwise be orphaned: a naive folder swap
 * would drop the index→folder entry, and resolveSessionLocation derives indices
 * by hashing folder paths — so the workspace folder hashes to a different
 * value. Repointing the existing transientFolderByIndex entry at the new
 * workspace folder keeps the caller's index resolvable for the lifetime of
 * this process. The slug-keyed entry is dropped (the workspace folder owns
 * the slug now; nothing should look it up via the transient registry).
 * The tmp folder is removed last.
 */
export async function redirectTransientToWorkspace(
  oldFolder: string,
  newFolder: string,
): Promise<void> {
  if (!isTransientFolder(oldFolder)) return;
  for (const [idx, f] of transientFolderByIndex.entries()) {
    if (f === oldFolder) transientFolderByIndex.set(idx, newFolder);
  }
  for (const [slug, f] of transientFolderBySlug.entries()) {
    if (f === oldFolder) transientFolderBySlug.delete(slug);
  }
  try {
    await rm(oldFolder, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

/**
 * `true` if `folder` contains a readable `session.json`. Used by callers to
 * distinguish "fresh" from "resume" without catching `SessionStoreError`.
 */
export async function sessionFileExists(folderAbsPath: string): Promise<boolean> {
  try {
    const st = await stat(sessionFilePath(folderAbsPath));
    return st.isFile();
  } catch {
    return false;
  }
}

/** Throwable type alias kept stable for test imports. */
export type { SessionStoreError as SessionStoreErrorType };

/**
 * Lower-level: write the seal file beside an already-written `session.json`
 * after reading the bytes back from disk. Test-only helper.
 */
export async function _writeSealFromDiskForTests(
  folderAbsPath: string,
): Promise<string> {
  const { bytes } = await readSessionFile(folderAbsPath);
  return writeSeal(folderAbsPath, bytes);
}
