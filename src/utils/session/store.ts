import {
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  unlink,
} from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { tmpdir } from 'node:os';
import { getOrCreateServerKey } from './crypto.js';
import { computeSessionIndexSync, computeEmbeddedSessionIndexSync } from './derivation.js';

/**
 * Tiny FS adapter object used internally by `writeAtomic`. Existing only so
 * tests can swap in a `rename` that throws EXDEV without using `vi.mock` on
 * `node:fs/promises` (which is brittle across ESM/CJS interop). Production
 * code never touches this object.
 */
const fsAdapter: { rename: typeof rename } = { rename };

/** @internal — test hook. Overrides the rename function used by writeAtomic. */
export function _setRenameForTests(fn: typeof rename | undefined): void {
  fsAdapter.rename = fn ?? rename;
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
 * Subdirectory under the workspace root that holds planning folders. Every
 * session lives at `<workspaceDir>/<PLANNING_RELATIVE_DIR>/<slug>/`.
 */
export const PLANNING_RELATIVE_DIR = '.engineering/artifacts/planning';

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
  'currentActivity',
  'currentSkill',
  'condition',
  'activeCheckpoint',
  'seq',
  'ts',
  'startedAt',
  'completedActivities',
  'skippedActivities',
  'variables',
  'checkpointResponses',
  'history',
  'triggeredWorkflows',
  'parentSession',
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

/**
 * Atomic write helper: stage to `<path>.tmp.<pid>.<ts>.<rand>`, fsync the
 * file descriptor, fsync the parent directory, then `rename` over the
 * destination. Falls back to copy+fsync+unlink on EXDEV (cross-device) — the
 * tmp file and destination normally live in the same planning folder, but the
 * fallback protects against `/tmp` overlays in CI / container setups.
 */
async function writeAtomic(
  path: string,
  contents: string | Buffer,
  mode: number,
): Promise<void> {
  const parent = dirname(path);
  await mkdir(parent, { recursive: true, mode: PLANNING_DIR_MODE });
  const tmp = `${path}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  const data = typeof contents === 'string' ? Buffer.from(contents, 'utf8') : contents;

  const fh = await open(tmp, 'w', mode);
  try {
    await fh.writeFile(data);
    await fh.sync();
  } finally {
    await fh.close();
  }

  try {
    await fsAdapter.rename(tmp, path);
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'EXDEV') {
      // Cross-filesystem rename — copy contents, fsync, then unlink the tmp.
      const fhDest = await open(path, 'w', mode);
      try {
        await fhDest.writeFile(data);
        await fhDest.sync();
      } finally {
        await fhDest.close();
      }
      try {
        await unlink(tmp);
      } catch {
        /* tmp cleanup is best-effort */
      }
    } else {
      // Clean up tmp on any other failure.
      try {
        await unlink(tmp);
      } catch {
        /* ignore */
      }
      throw err;
    }
  }

  // Best-effort directory fsync so the rename hits the disk before we return.
  // Some filesystems (notably tmpfs on macOS) reject O_RDONLY on a directory;
  // ignore failures so test runs on those platforms still work.
  try {
    const dirFh = await open(parent, 'r');
    try {
      await dirFh.sync();
    } finally {
      await dirFh.close();
    }
  } catch {
    /* ignore — directory fsync is a defence-in-depth measure, not load-bearing */
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
 * Write `state` to `session.json` atomically, then write the seal atomically.
 * Order is fixed (state first, seal second) so that a reader observing the
 * inter-rename window sees a seal that no longer matches the state and fails
 * fast — the documented torn-write failure mode.
 *
 * Returns the canonical JSON bytes that were written and the seal hex; the
 * caller can use these to populate a response envelope without re-reading
 * the file.
 */
export async function writeSessionFile(
  folderAbsPath: string,
  state: unknown,
): Promise<{ bytes: string; seal: string }> {
  await mkdir(folderAbsPath, { recursive: true, mode: PLANNING_DIR_MODE });
  const bytes = canonicaliseJson(state);
  const seal = await computeSeal(bytes);
  await writeAtomic(sessionFilePath(folderAbsPath), bytes, PLANNING_FILE_MODE);
  await writeAtomic(sealFilePath(folderAbsPath), seal, PLANNING_FILE_MODE);
  return { bytes, seal };
}

/**
 * Write a seal over an already-known JSON byte sequence (e.g. when the
 * caller has the canonical bytes from a prior write and only needs to
 * refresh the seal). Exposed mainly for tests; production code uses
 * `writeSessionFile` which writes both files in the correct order.
 */
export async function writeSeal(
  folderAbsPath: string,
  jsonBytes: string,
): Promise<string> {
  const seal = await computeSeal(jsonBytes);
  await writeAtomic(sealFilePath(folderAbsPath), seal, PLANNING_FILE_MODE);
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
 * `<workspaceDir>/.engineering/artifacts/planning`.
 */
export function planningRoot(workspaceDir: string): string {
  return join(workspaceDir, PLANNING_RELATIVE_DIR);
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
 * for the root session). Walks top-level folders, and for each folder
 * walks the embedded `triggeredWorkflows[i].state` tree recursively.
 *
 * Transient (in-memory) sessions resolve via the registry first.
 */
export async function resolveSessionLocation(
  workspaceDir: string,
  sessionIndex: string,
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

  const root = planningRoot(workspaceDir);
  let topEntries: Array<{ name: string; isDirectory: () => boolean; isSymbolicLink: () => boolean }>;
  try {
    topEntries = await readdir(root, { withFileTypes: true });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new SessionStoreError(
        `resolveSessionLocation: planning root ${root} does not exist`,
        'NOT_FOUND',
        { workspaceDir, root, sessionIndex },
      );
    }
    throw err;
  }

  const key = await getOrCreateServerKey();
  const matches: SessionLocation[] = [];

  // Walk the embedded triggeredWorkflows[i].state tree of `topState`,
  // pushing every (jsonPath, computedIndex) hit that matches sessionIndex.
  function walkEmbedded(topState: unknown, folder: string, prefix: import('./derivation.js').SessionJsonPath): void {
    if (!topState || typeof topState !== 'object') return;
    const tw = (topState as { triggeredWorkflows?: unknown }).triggeredWorkflows;
    if (!Array.isArray(tw)) return;
    for (let i = 0; i < tw.length; i++) {
      const entry = tw[i];
      if (!entry || typeof entry !== 'object') continue;
      const childState = (entry as { state?: unknown }).state;
      if (!childState || typeof childState !== 'object') continue;
      const childPath: import('./derivation.js').SessionJsonPath = [...prefix, 'triggeredWorkflows', i, 'state'];
      const idx = computeEmbeddedSessionIndexSync(folder, childPath, key);
      if (idx === sessionIndex) matches.push({ folder, jsonPath: childPath });
      walkEmbedded(childState, folder, childPath);
    }
  }

  // Walk every directory under the planning root. For each folder:
  //   1. compute its root index (legacy nested-folder layout uses one
  //      session.json per folder, so a deeply-nested folder may itself be
  //      a session that matches).
  //   2. if it has a session.json, walk the embedded triggeredWorkflows tree
  //      inside it for matches against the new embedded-state layout.
  // The double-coverage lets old (separate-folder children) and new
  // (embedded children) layouts coexist during migration.
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
        const rootIdx = computeEmbeddedSessionIndexSync(folderPath, [], key);
        if (rootIdx === sessionIndex) matches.push({ folder: folderPath, jsonPath: [] });
        try {
          const { state } = await readSessionFile(folderPath);
          walkEmbedded(state, folderPath, []);
        } catch {
          // No session.json here — keep recursing in case nested folders
          // have one (transitional separate-folder layout).
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
      const rootIdx = computeEmbeddedSessionIndexSync(folderPath, [], key);
      if (rootIdx === sessionIndex) matches.push({ folder: folderPath, jsonPath: [] });
      try {
        const { state } = await readSessionFile(folderPath);
        walkEmbedded(state, folderPath, []);
      } catch {
        /* no session.json at this level */
      }
    } catch {
      continue;
    }
    await walkFolders(folderPath);
  }

  if (matches.length === 0) {
    throw new SessionStoreError(
      `resolveSessionLocation: no session under ${root} hashes to session_index '${sessionIndex}'`,
      'NOT_FOUND',
      { workspaceDir, root, sessionIndex },
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
 * Resolve a `session_index` to the absolute path of its top-level planning
 * folder. Convenience wrapper that drops the `jsonPath` component — useful
 * when the caller only needs the folder (e.g. for `verifySeal` which always
 * operates at the top file level).
 *
 * Behaviour:
 *   - Exactly one match → returns its absolute path.
 *   - Two or more matches → throws `SessionStoreError(COLLISION)`.
 *   - Zero matches → throws `SessionStoreError(NOT_FOUND)`.
 */
export async function resolveSessionIndex(
  workspaceDir: string,
  sessionIndex: string,
): Promise<string> {
  if (!isAbsolute(workspaceDir)) {
    throw new SessionStoreError(
      `resolveSessionIndex: workspaceDir must be absolute, got ${workspaceDir}`,
      'WORKSPACE_INVALID',
      { workspaceDir },
    );
  }
  if (!/^[A-Z2-7]{6}$/.test(sessionIndex)) {
    throw new SessionStoreError(
      `resolveSessionIndex: session_index must be 6 uppercase RFC 4648 base32 characters (A-Z, 2-7), got '${sessionIndex}'`,
      'INVALID_INDEX',
      { sessionIndex },
    );
  }

  // Check the in-memory transient registry first — bootstrap (meta)
  // sessions live under os.tmpdir() and never appear in the workspace
  // enumeration below.
  const transient = transientFolderByIndex.get(sessionIndex);
  if (transient) return transient;

  const root = planningRoot(workspaceDir);
  let entries: Array<{ name: string; isDirectory: () => boolean; isSymbolicLink: () => boolean }>;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new SessionStoreError(
        `resolveSessionIndex: planning root ${root} does not exist`,
        'NOT_FOUND',
        { workspaceDir, root, sessionIndex },
      );
    }
    throw err;
  }

  const key = await getOrCreateServerKey();
  const matches: string[] = [];

  /**
   * Walk every directory under the planning root recursively. Each folder
   * that hashes to the requested session_index is a match. Recursion is
   * needed because persistent children of persistent parents nest under
   * the parent's folder rather than living at the workspace top level.
   */
  async function walk(dirPath: string): Promise<void> {
    let dirEntries: typeof entries;
    try {
      dirEntries = await readdir(dirPath, { withFileTypes: true });
    } catch {
      // Permission denied / race deletion — best-effort, skip.
      return;
    }
    for (const entry of dirEntries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const folderPath = resolve(dirPath, entry.name);
      try {
        const st = await stat(folderPath);
        if (!st.isDirectory()) continue;
        const index = computeSessionIndexSync(folderPath, key);
        if (index === sessionIndex) matches.push(folderPath);
      } catch {
        // realpath / stat failed (broken symlink, race deletion); skip.
        continue;
      }
      await walk(folderPath);
    }
  }

  // Seed the walk with the immediate planning-root entries we already read.
  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const folderPath = resolve(root, entry.name);
    try {
      const st = await stat(folderPath);
      if (!st.isDirectory()) continue;
      const index = computeSessionIndexSync(folderPath, key);
      if (index === sessionIndex) matches.push(folderPath);
    } catch {
      continue;
    }
    await walk(folderPath);
  }

  if (matches.length === 0) {
    throw new SessionStoreError(
      `resolveSessionIndex: no planning folder under ${root} hashes to session_index '${sessionIndex}'`,
      'NOT_FOUND',
      { workspaceDir, root, sessionIndex },
    );
  }
  if (matches.length > 1) {
    // Sort for determinism in the error payload.
    const sorted = [...matches].sort();
    throw new SessionStoreError(
      `resolveSessionIndex: session_index '${sessionIndex}' collides between ${sorted.length} planning folders: ${sorted.join(', ')}`,
      'COLLISION',
      { workspaceDir, sessionIndex, candidates: sorted },
    );
  }
  return matches[0] as string;
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
): Promise<string | undefined> {
  assertValidSlug(slug);
  const root = planningRoot(workspaceDir);
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

  try {
    await walk(root);
  } catch {
    return undefined;
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
 * `<workspaceDir>/<PLANNING_RELATIVE_DIR>/<slug>` with mode 0700.
 * Idempotent. Returns the absolute path.
 */
export async function ensurePlanningFolder(
  workspaceDir: string,
  slug: string,
): Promise<string> {
  assertValidSlug(slug);
  const folder = resolve(planningRoot(workspaceDir), slug);
  await mkdir(folder, { recursive: true, mode: PLANNING_DIR_MODE });
  return folder;
}

/**
 * Create a nested planning folder at `<parentFolder>/<slug>` with mode 0700.
 * Used when dispatching a persistent child workflow from a persistent parent
 * so children live under their parent in the planning hierarchy rather than
 * adjacent to it at the workspace top level.
 */
export async function ensureNestedPlanningFolder(
  parentFolder: string,
  slug: string,
): Promise<string> {
  assertValidSlug(slug);
  const folder = resolve(parentFolder, slug);
  await mkdir(folder, { recursive: true, mode: PLANNING_DIR_MODE });
  return folder;
}

/**
 * Transient (bootstrap) session support. Orchestrator-only sessions (notably
 * the meta workflow) never need a workspace folder — their state lives only
 * long enough to dispatch a child workflow, which then snapshots them into
 * `session.json#parentSession` and discards the parent.
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

/** Register a transient folder so `resolveSessionIndex` and slug-lookup find it. */
export function registerTransient(sessionIndex: string, folder: string, slug?: string): void {
  transientFolderByIndex.set(sessionIndex, folder);
  if (slug) transientFolderBySlug.set(slug, folder);
}

/** Look up a transient folder by the slug it was registered under. */
export function lookupTransientBySlug(slug: string): string | undefined {
  return transientFolderBySlug.get(slug);
}

/** `true` if `folder` lives under the os.tmpdir() transient prefix. */
export function isTransientFolder(folder: string): boolean {
  return folder.startsWith(join(tmpdir(), TRANSIENT_DIR_PREFIX));
}

/**
 * Delete a transient folder (recursive) and remove all registry entries
 * pointing at it. Best-effort; failures are swallowed (the OS will reap
 * orphans eventually).
 */
export async function discardTransient(folder: string): Promise<void> {
  if (!isTransientFolder(folder)) return;
  for (const [idx, f] of transientFolderByIndex.entries()) {
    if (f === folder) transientFolderByIndex.delete(idx);
  }
  for (const [slug, f] of transientFolderBySlug.entries()) {
    if (f === folder) transientFolderBySlug.delete(slug);
  }
  try {
    await rm(folder, { recursive: true, force: true });
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

// Re-exports for test convenience; production callers should import directly.
export { writeAtomic as _writeAtomicForTests };

/**
 * Round-trip-and-re-canonicalise a JSON value. Helper for migration code
 * that ingests legacy state and re-emits it in canonical form before sealing.
 */
export function recanonicalise(value: unknown): string {
  return canonicaliseJson(value);
}

/** Convenience: write an arbitrary string directly (used by migration). */
export async function writeSessionFileRaw(
  folderAbsPath: string,
  canonicalJsonBytes: string,
): Promise<{ bytes: string; seal: string }> {
  await mkdir(folderAbsPath, { recursive: true, mode: PLANNING_DIR_MODE });
  // Validate the bytes parse as JSON so callers can't accidentally seal garbage.
  JSON.parse(canonicalJsonBytes);
  const seal = await computeSeal(canonicalJsonBytes);
  await writeAtomic(
    sessionFilePath(folderAbsPath),
    canonicalJsonBytes,
    PLANNING_FILE_MODE,
  );
  await writeAtomic(sealFilePath(folderAbsPath), seal, PLANNING_FILE_MODE);
  return { bytes: canonicalJsonBytes, seal };
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
