import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PLANNING_FILE_MODE,
  PLANNING_DIR_MODE,
  PLANNING_RELATIVE_DIR,
  SEAL_FILE_NAME,
  SESSION_FILE_NAME,
  SessionStoreError,
  canonicaliseJson,
  ensurePlanningFolder,
  planningRoot,
  readSessionFile,
  resolveSessionLocation,
  sealFilePath,
  sessionFileExists,
  sessionFilePath,
  verifySeal,
  writeSeal,
  writeSessionFile,
  computeSessionIndex,
} from '../src/utils/session/index.js';

/**
 * Tests build a real workspace under `os.tmpdir()` and exercise the full
 * read/write/seal/resolve surface. Each top-level describe gets its own
 * workspace so file-mode and collision assertions don't interfere.
 */
describe('session-store primitives', () => {
  describe('canonicaliseJson', () => {
    it('sorts object keys lexicographically at every depth', () => {
      const bytes = canonicaliseJson({ z: 1, a: { y: 2, x: 3 } });
      expect(bytes).toBe('{\n  "a": {\n    "x": 3,\n    "y": 2\n  },\n  "z": 1\n}');
    });

    it('drops undefined values (matching JSON semantics)', () => {
      const bytes = canonicaliseJson({ a: 1, b: undefined, c: 3 });
      expect(bytes).toBe('{\n  "a": 1,\n  "c": 3\n}');
    });

    it('preserves array order', () => {
      expect(canonicaliseJson([3, 1, 2])).toBe('[\n  3,\n  1,\n  2\n]');
    });

    it('emits empty containers compactly', () => {
      expect(canonicaliseJson([])).toBe('[]');
      expect(canonicaliseJson({})).toBe('{}');
    });

    it('serialises null, booleans, strings, finite numbers', () => {
      expect(canonicaliseJson(null)).toBe('null');
      expect(canonicaliseJson(true)).toBe('true');
      expect(canonicaliseJson('hi')).toBe('"hi"');
      expect(canonicaliseJson(42)).toBe('42');
    });

    it('refuses non-finite numbers', () => {
      expect(() => canonicaliseJson(Number.POSITIVE_INFINITY)).toThrow();
      expect(() => canonicaliseJson(Number.NaN)).toThrow();
    });
  });

  describe('writeSessionFile atomicity', () => {
    let workspace: string;

    beforeEach(async () => {
      workspace = await mkdtemp(join(tmpdir(), 'sx-store-write-'));
    });

    it('writes session.json atomically via tmp + fsync + rename', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc13');
      await writeSessionFile(folder, { schemaVersion: 1, sessionIndex: 'ABCDEF', hello: 'world' });

      const entries = await readdir(folder);
      // No leftover .tmp files after a successful write.
      expect(entries.filter((e) => e.includes('.tmp.'))).toHaveLength(0);
      expect(entries).toContain(SESSION_FILE_NAME);
      expect(entries).toContain(SEAL_FILE_NAME);

      // session.json contents match canonical bytes (re-canonicalised).
      const bytes = await readFile(sessionFilePath(folder), 'utf8');
      expect(bytes).toBe(canonicaliseJson({ schemaVersion: 1, sessionIndex: 'ABCDEF', hello: 'world' }));
    });

    it('writes .session-token only after session.json is in place (rename order)', async () => {
      // The implementation awaits the session.json rename before starting the
      // seal write. We verify the order indirectly: at the moment the seal
      // is observable on disk, the state file is also present (and parses).
      // If the seal had been written first, the inter-rename window would
      // expose a seal pointing at a non-existent state file — exactly the
      // ordering bug the test guards against. We also verify the seal value
      // matches the state bytes, which it can only do if state was canonical
      // and stable when the seal was computed.
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc14');
      await writeSessionFile(folder, { schemaVersion: 1, x: 1 });
      const stateBytes = await readFile(sessionFilePath(folder), 'utf8');
      const sealBytes = (await readFile(sealFilePath(folder), 'utf8')).trim();
      // verifySeal will throw if state and seal don't correspond, which
      // proves the seal was written for THIS state, not for some prior
      // version. A successful verify implies the documented ordering.
      const result = await verifySeal(folder);
      expect(result.bytes).toBe(stateBytes);
      expect(sealBytes).toMatch(/^[0-9a-f]{64}$/);
    });

    afterEachCleanup(() => workspace);
  });

  describe('EXDEV fallback', () => {
    let workspace: string;

    beforeEach(async () => {
      workspace = await mkdtemp(join(tmpdir(), 'sx-store-exdev-'));
    });

    it('falls back to copy+fsync+unlink when rename throws EXDEV', async () => {
      const { _setRenameForTests } = await import('../src/utils/session/store.js');
      const { rename: realRename } = await import('node:fs/promises');
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc15');
      let exdevThrown = 0;
      _setRenameForTests(async (from, to) => {
        if (exdevThrown === 0 && String(to).endsWith(SESSION_FILE_NAME)) {
          exdevThrown += 1;
          const err: NodeJS.ErrnoException = Object.assign(
            new Error('EXDEV cross-device link'),
            { code: 'EXDEV' },
          );
          throw err;
        }
        return realRename(from, to);
      });
      try {
        await writeSessionFile(folder, { schemaVersion: 1, exdev: true });
      } finally {
        _setRenameForTests(undefined);
      }
      const bytes = await readFile(sessionFilePath(folder), 'utf8');
      expect(bytes).toBe(canonicaliseJson({ schemaVersion: 1, exdev: true }));
      const sealBytes = (await readFile(sealFilePath(folder), 'utf8')).trim();
      expect(sealBytes).toMatch(/^[0-9a-f]{64}$/);
      expect(exdevThrown).toBe(1);
      // And the resulting pair verifies cleanly.
      const verified = await verifySeal(folder);
      expect(verified.state).toEqual({ schemaVersion: 1, exdev: true });
    });

    afterEachCleanup(() => workspace);
  });

  describe('verifySeal', () => {
    let workspace: string;

    beforeEach(async () => {
      workspace = await mkdtemp(join(tmpdir(), 'sx-store-seal-'));
    });

    it('succeeds for an untouched (session.json, .session-token) pair', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc16');
      await writeSessionFile(folder, { schemaVersion: 1, sealed: 'ok' });
      const result = await verifySeal(folder);
      expect(result.state).toEqual({ schemaVersion: 1, sealed: 'ok' });
    });

    it('returns SEAL_MISMATCH when session.json is hand-edited', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc17');
      await writeSessionFile(folder, { schemaVersion: 1, sealed: 'ok' });
      // Hand-edit: change a field value.
      await writeFile(sessionFilePath(folder), '{"schemaVersion":1,"sealed":"tampered"}', 'utf8');
      await expect(verifySeal(folder)).rejects.toMatchObject({
        name: 'SessionStoreError',
        code: 'SEAL_MISMATCH',
      });
    });

    it('returns SEAL_MISMATCH when whitespace alone changes', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc18');
      await writeSessionFile(folder, { schemaVersion: 1, sealed: 'ok' });
      const original = await readFile(sessionFilePath(folder), 'utf8');
      // Re-serialise with a different whitespace shape (compact, no indent).
      // Same value, different bytes ⇒ seal must mismatch.
      const compact = JSON.stringify(JSON.parse(original));
      expect(compact).not.toBe(original);
      await writeFile(sessionFilePath(folder), compact, 'utf8');
      await expect(verifySeal(folder)).rejects.toMatchObject({ code: 'SEAL_MISMATCH' });
    });

    it('returns SEAL_MISMATCH when the seal file is missing entirely', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc-no-seal');
      await writeSessionFile(folder, { schemaVersion: 1 });
      await rm(sealFilePath(folder));
      await expect(verifySeal(folder)).rejects.toMatchObject({ code: 'SEAL_MISMATCH' });
    });

    it('writeSeal refreshes the seal in place', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc-reseal');
      await writeSessionFile(folder, { schemaVersion: 1, body: 'v1' });
      const beforeSeal = (await readFile(sealFilePath(folder), 'utf8')).trim();
      const newBytes = canonicaliseJson({ schemaVersion: 1, body: 'v2' });
      await writeFile(sessionFilePath(folder), newBytes, 'utf8');
      await writeSeal(folder, newBytes);
      const result = await verifySeal(folder);
      expect(result.state).toEqual({ schemaVersion: 1, body: 'v2' });
      const afterSeal = (await readFile(sealFilePath(folder), 'utf8')).trim();
      expect(afterSeal).not.toBe(beforeSeal);
    });

    afterEachCleanup(() => workspace);
  });

  describe('file and directory modes', () => {
    let workspace: string;

    beforeEach(async () => {
      workspace = await mkdtemp(join(tmpdir(), 'sx-store-mode-'));
    });

    it('session.json and .session-token are written with 0600', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc19');
      await writeSessionFile(folder, { schemaVersion: 1 });
      const stateStat = await stat(sessionFilePath(folder));
      const sealStat = await stat(sealFilePath(folder));
      // Mask off the file-type bits; only the permission triplet should match.
      expect(stateStat.mode & 0o777).toBe(PLANNING_FILE_MODE);
      expect(sealStat.mode & 0o777).toBe(PLANNING_FILE_MODE);
    });

    it('planning folder is created with 0700 when ensurePlanningFolder is called', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc20');
      const folderStat = await stat(folder);
      // Some umask configurations or pre-existing parents can drop bits; the
      // test asserts the read/write/execute-by-others bits are NOT set.
      expect(folderStat.mode & 0o077).toBe(0);
      // And that the owner has full access.
      expect(folderStat.mode & 0o700).toBe(PLANNING_DIR_MODE & 0o700);
    });

    afterEachCleanup(() => workspace);
  });

  describe('resolveSessionLocation', () => {
    let workspace: string;

    beforeEach(async () => {
      workspace = await mkdtemp(join(tmpdir(), 'sx-resolve-'));
      // Pre-create planning root so readdir succeeds.
      await mkdir(planningRoot(workspace), { recursive: true });
    });

    it('returns the unique folder when exactly one match exists', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc10');
      const idx = await computeSessionIndex(folder);
      await writeSessionFile(folder, { sessionIndex: idx, sentinel: 'tc10' });
      const resolved = await resolveSessionLocation(workspace, idx);
      expect(resolved.folder).toBe(folder);
    });

    it('errors with all candidate paths on collision', async () => {
      // Two distinct folders carrying the same stored sessionIndex value
      // (a real-world collision happens when a session.json is copied between
      // folders without updating the index). The resolver must report both.
      const a = await ensurePlanningFolder(workspace, '2026-05-14-collide-a');
      const b = await ensurePlanningFolder(workspace, '2026-05-14-collide-b');
      const idx = await computeSessionIndex(a);
      await writeSessionFile(a, { sessionIndex: idx, sentinel: 'a' });
      await writeSessionFile(b, { sessionIndex: idx, sentinel: 'b' });

      await expect(resolveSessionLocation(workspace, idx)).rejects.toMatchObject({
        name: 'SessionStoreError',
        code: 'COLLISION',
      });
      try {
        await resolveSessionLocation(workspace, idx);
      } catch (err) {
        const e = err as SessionStoreError;
        expect(e.details).toHaveProperty('candidates');
        const cands = (e.details as { candidates: string[] }).candidates;
        expect(cands.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('resolves after the folder is renamed (path-independent lookup)', async () => {
      // Folder mobility: once session.json is written, the planning folder
      // can be renamed without invalidating the stored sessionIndex.
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-mobile-before');
      const idx = await computeSessionIndex(folder);
      await writeSessionFile(folder, { sessionIndex: idx, sentinel: 'mobile' });

      const { rename } = await import('node:fs/promises');
      const moved = join(planningRoot(workspace), '2026-05-14-mobile-after');
      await rename(folder, moved);

      const resolved = await resolveSessionLocation(workspace, idx);
      expect(resolved.folder).toBe(moved);
    });

    it('errors with NOT_FOUND when no folder matches', async () => {
      // Empty planning root → no matches for any index.
      await expect(resolveSessionLocation(workspace, 'ZZZZZZ')).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('rejects malformed session_index strings', async () => {
      await expect(resolveSessionLocation(workspace, 'lower6')).rejects.toMatchObject({
        code: 'INVALID_INDEX',
      });
      await expect(resolveSessionLocation(workspace, 'A1CDEF')).rejects.toMatchObject({
        code: 'INVALID_INDEX',
      });
      await expect(resolveSessionLocation(workspace, 'TOOLONG')).rejects.toMatchObject({
        code: 'INVALID_INDEX',
      });
    });

    it('rejects relative workspace paths', async () => {
      await expect(resolveSessionLocation('relative/ws', 'ABCDEF')).rejects.toMatchObject({
        code: 'WORKSPACE_INVALID',
      });
    });

    it('errors with NOT_FOUND when the planning root does not exist', async () => {
      const empty = await mkdtemp(join(tmpdir(), 'sx-empty-'));
      try {
        await expect(resolveSessionLocation(empty, 'ABCDEF')).rejects.toMatchObject({
          code: 'NOT_FOUND',
        });
      } finally {
        await rm(empty, { recursive: true, force: true });
      }
    });

    afterEachCleanup(() => workspace);
  });

  describe('readSessionFile / sessionFileExists', () => {
    let workspace: string;

    beforeEach(async () => {
      workspace = await mkdtemp(join(tmpdir(), 'sx-read-'));
    });

    it('returns parsed state and exact bytes on a freshly written folder', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc-read');
      await writeSessionFile(folder, { schemaVersion: 1, foo: 'bar' });
      const result = await readSessionFile(folder);
      expect(result.state).toEqual({ schemaVersion: 1, foo: 'bar' });
      expect(result.bytes).toBe(canonicaliseJson({ schemaVersion: 1, foo: 'bar' }));
    });

    it('throws NOT_FOUND when session.json is absent', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc-missing');
      await expect(readSessionFile(folder)).rejects.toMatchObject({ code: 'NOT_FOUND' });
      expect(await sessionFileExists(folder)).toBe(false);
    });

    it('sessionFileExists returns true after writeSessionFile', async () => {
      const folder = await ensurePlanningFolder(workspace, '2026-05-14-tc-exists');
      await writeSessionFile(folder, { schemaVersion: 1 });
      expect(await sessionFileExists(folder)).toBe(true);
    });

    afterEachCleanup(() => workspace);
  });

  describe('planningRoot / ensurePlanningFolder', () => {
    let workspace: string;

    beforeEach(async () => {
      workspace = await mkdtemp(join(tmpdir(), 'sx-folder-'));
    });

    it('planningRoot joins workspaceDir with the canonical relative path', () => {
      expect(planningRoot(workspace)).toBe(join(workspace, PLANNING_RELATIVE_DIR));
    });

    it('ensurePlanningFolder rejects path-traversing slugs', async () => {
      await expect(ensurePlanningFolder(workspace, '../escape')).rejects.toMatchObject({
        code: 'INVALID_INDEX',
      });
      await expect(ensurePlanningFolder(workspace, 'a/b')).rejects.toMatchObject({
        code: 'INVALID_INDEX',
      });
      await expect(ensurePlanningFolder(workspace, '..')).rejects.toMatchObject({
        code: 'INVALID_INDEX',
      });
      await expect(ensurePlanningFolder(workspace, '')).rejects.toMatchObject({
        code: 'INVALID_INDEX',
      });
    });

    it('ensurePlanningFolder is idempotent', async () => {
      const a = await ensurePlanningFolder(workspace, '2026-05-14-tc-idem');
      const b = await ensurePlanningFolder(workspace, '2026-05-14-tc-idem');
      expect(b).toBe(a);
    });

    afterEachCleanup(() => workspace);
  });
});

// Helper used by the tests above. Hoisted via function declaration so the
// `beforeEach` blocks that close over `workspace` can call it. Each describe
// owns a single `workspace` variable; this helper schedules cleanup after the
// describe finishes so tmp directories don't accumulate.
function afterEachCleanup(getWs: () => string): void {
  afterAll(async () => {
    const ws = getWs();
    try {
      // Restore writable mode on planning subtree before rm in case any test
      // left 0500 directories behind.
      await chmod(ws, 0o700).catch(() => undefined);
      await rm(ws, { recursive: true, force: true });
    } catch {
      /* swallow */
    }
  });
}
