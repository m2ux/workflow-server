import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, writeFile, mkdir, unlink, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { SessionStore } from '../src/utils/session-store.js';
import type { SessionRecord } from '../src/utils/state-hash.js';

function mkRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    wf: 'work-package',
    act: 'plan-prepare',
    v: '3.7.0',
    aid: 'orchestrator',
    createdAt: 1700000000,
    updatedAt: 1700000010,
    ...overrides,
  };
}

describe('SessionStore', () => {
  let root: string;
  let store: SessionStore;
  let sid: Buffer;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'session-store-test-'));
    store = new SessionStore(root);
    sid = randomBytes(16);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  describe('create', () => {
    it('writes a state file and index, returning the state path', async () => {
      const record = mkRecord();
      const path = await store.create(sid, record);
      expect(path).toBe(store.fallbackStatePath(sid));
      expect((await stat(path)).isFile()).toBe(true);
    });

    it('produces a state file readable as JSON with schemaVersion 1', async () => {
      await store.create(sid, mkRecord({ act: 'strategic-review' }));
      const path = store.fallbackStatePath(sid);
      const raw = await readFile(path, 'utf8');
      const parsed = JSON.parse(raw);
      expect(parsed.schemaVersion).toBe(1);
      expect(parsed.sid).toBe(sid.toString('hex'));
      expect(parsed.record.act).toBe('strategic-review');
    });

    it('stores shAtSave when provided', async () => {
      const sh = randomBytes(16);
      await store.create(sid, mkRecord(), sh);
      const raw = await readFile(store.fallbackStatePath(sid), 'utf8');
      expect(JSON.parse(raw).shAtSave).toBe(sh.toString('hex'));
    });

    it('refuses to overwrite an existing session', async () => {
      await store.create(sid, mkRecord());
      await expect(store.create(sid, mkRecord())).rejects.toThrow(/index already exists/);
    });

    it('rejects an sid that is not 16 bytes', async () => {
      await expect(store.create(Buffer.alloc(15), mkRecord())).rejects.toThrow(/sid must be 16 bytes/);
    });
  });

  describe('load', () => {
    it('returns null when no index exists', async () => {
      expect(await store.load(sid)).toBeNull();
    });

    it('returns null when the index points at a path that does not exist', async () => {
      await store.create(sid, mkRecord());
      await unlink(store.fallbackStatePath(sid));
      expect(await store.load(sid)).toBeNull();
    });

    it('returns the record stored by create', async () => {
      const record = mkRecord({ act: 'implement', updatedAt: 1700001000 });
      await store.create(sid, record);
      const loaded = await store.load(sid);
      expect(loaded).toEqual(record);
    });

    it('throws on schemaVersion mismatch', async () => {
      await store.create(sid, mkRecord());
      const path = store.fallbackStatePath(sid);
      const raw = JSON.parse(await readFile(path, 'utf8'));
      raw.schemaVersion = 99;
      await writeFile(path, JSON.stringify(raw));
      await expect(store.load(sid)).rejects.toThrow(/unsupported schemaVersion 99/);
    });

    it('throws on sid mismatch (record file claims a different sid)', async () => {
      await store.create(sid, mkRecord());
      const path = store.fallbackStatePath(sid);
      const raw = JSON.parse(await readFile(path, 'utf8'));
      raw.sid = randomBytes(16).toString('hex');
      await writeFile(path, JSON.stringify(raw));
      await expect(store.load(sid)).rejects.toThrow(/sid mismatch/);
    });
  });

  describe('save', () => {
    it('overwrites the record at the indexed path', async () => {
      await store.create(sid, mkRecord({ act: 'plan-prepare' }));
      await store.save(sid, mkRecord({ act: 'implement' }));
      const loaded = await store.load(sid);
      expect(loaded?.act).toBe('implement');
    });

    it('throws when no index exists', async () => {
      await expect(store.save(sid, mkRecord())).rejects.toThrow(/no index pointer/);
    });

    it('records shAtSave when provided', async () => {
      await store.create(sid, mkRecord());
      const sh = randomBytes(16);
      await store.save(sid, mkRecord(), sh);
      const raw = JSON.parse(await readFile(store.fallbackStatePath(sid), 'utf8'));
      expect(raw.shAtSave).toBe(sh.toString('hex'));
    });
  });

  describe('relocate', () => {
    it('moves the state file to a new path and updates the index', async () => {
      await store.create(sid, mkRecord());
      const planning = await mkdtemp(join(tmpdir(), 'planning-'));
      const newPath = join(planning, '.workflow', 'session.json');

      await store.relocate(sid, newPath);

      expect((await stat(newPath)).isFile()).toBe(true);
      await expect(stat(store.fallbackStatePath(sid))).rejects.toThrow();
      const resolved = await store.resolveIndex(sid);
      expect(resolved).toBe(newPath);

      await rm(planning, { recursive: true, force: true });
    });

    it('is idempotent when newPath equals current path', async () => {
      await store.create(sid, mkRecord());
      const path = store.fallbackStatePath(sid);
      await store.relocate(sid, path);
      expect(await store.resolveIndex(sid)).toBe(path);
    });

    it('preserves the file contents byte-for-byte', async () => {
      await store.create(sid, mkRecord({ act: 'implement' }));
      const before = await readFile(store.fallbackStatePath(sid), 'utf8');
      const planning = await mkdtemp(join(tmpdir(), 'planning-'));
      const newPath = join(planning, '.workflow', 'session.json');
      await store.relocate(sid, newPath);
      const after = await readFile(newPath, 'utf8');
      expect(after).toBe(before);
      await rm(planning, { recursive: true, force: true });
    });

    it('rejects non-absolute paths', async () => {
      await store.create(sid, mkRecord());
      await expect(store.relocate(sid, 'relative/path/session.json')).rejects.toThrow(/must be absolute/);
    });

    it("rejects paths containing '..' segments", async () => {
      await store.create(sid, mkRecord());
      await expect(store.relocate(sid, '/tmp/foo/../session.json')).rejects.toThrow(/'\.\.' segments/);
    });

    it('throws when no index exists', async () => {
      await expect(store.relocate(sid, '/tmp/session.json')).rejects.toThrow(/no index pointer/);
    });

    it('creates intermediate directories at the destination', async () => {
      await store.create(sid, mkRecord());
      const planning = await mkdtemp(join(tmpdir(), 'planning-'));
      const deep = join(planning, 'a', 'b', 'c', '.workflow', 'session.json');
      await store.relocate(sid, deep);
      expect((await stat(deep)).isFile()).toBe(true);
      await rm(planning, { recursive: true, force: true });
    });
  });

  describe('resolveIndex', () => {
    it('returns null when no index exists', async () => {
      expect(await store.resolveIndex(sid)).toBeNull();
    });

    it('returns the fallback path immediately after create', async () => {
      await store.create(sid, mkRecord());
      expect(await store.resolveIndex(sid)).toBe(store.fallbackStatePath(sid));
    });

    it('trims trailing whitespace in the index file', async () => {
      await store.create(sid, mkRecord());
      const idx = join(root, `${sid.toString('hex')}.path`);
      const current = await readFile(idx, 'utf8');
      await writeFile(idx, `${current}\n\n  `);
      expect(await store.resolveIndex(sid)).toBe(current);
    });
  });
});
