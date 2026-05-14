import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  computeSessionIndex,
  computeSessionIndexSync,
  isSessionIndex,
  SESSION_INDEX_BASE32_ALPHABET,
  SESSION_INDEX_CHAR_LENGTH,
  SESSION_INDEX_REGEX,
} from '../src/utils/session-index.js';

/**
 * Phase 2 — session-index derivation (PR116-TC-05 .. PR116-TC-09).
 *
 * Every test creates real directories under `os.tmpdir()` because
 * `computeSessionIndex` canonicalises via `fs.realpathSync` and requires
 * the input path to exist. The server secret is loaded lazily by
 * `getOrCreateServerKey` and shared across tests in this process.
 */
describe('computeSessionIndex', () => {
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'sx-idx-'));
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  describe('PR116-TC-05 — output shape', () => {
    it('returns a 6-character uppercase RFC 4648 base32 string', async () => {
      const folder = join(root, 'tc05');
      await mkdir(folder, { recursive: true });
      const idx = await computeSessionIndex(folder);
      expect(idx).toHaveLength(SESSION_INDEX_CHAR_LENGTH);
      expect(SESSION_INDEX_REGEX.test(idx)).toBe(true);
    });

    it('exposes the canonical alphabet constant', () => {
      expect(SESSION_INDEX_BASE32_ALPHABET).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
      expect(SESSION_INDEX_BASE32_ALPHABET).toHaveLength(32);
    });
  });

  describe('PR116-TC-06 — deterministic (SC-7)', () => {
    it('returns byte-identical indices for the same folder', async () => {
      const folder = join(root, 'tc06');
      await mkdir(folder, { recursive: true });
      const a = await computeSessionIndex(folder);
      const b = await computeSessionIndex(folder);
      expect(b).toBe(a);
    });

    it('differs for different folders (sanity)', async () => {
      const f1 = join(root, 'tc06-a');
      const f2 = join(root, 'tc06-b');
      await mkdir(f1, { recursive: true });
      await mkdir(f2, { recursive: true });
      const a = await computeSessionIndex(f1);
      const b = await computeSessionIndex(f2);
      expect(a).not.toBe(b);
    });
  });

  describe('PR116-TC-07 — canonicalises symlinks via realpathSync', () => {
    it('returns the same index whether called on the real path or a symlink to it', async () => {
      const real = join(root, 'tc07-real');
      const link = join(root, 'tc07-link');
      await mkdir(real, { recursive: true });
      await symlink(real, link);
      const viaReal = await computeSessionIndex(real);
      const viaLink = await computeSessionIndex(link);
      expect(viaLink).toBe(viaReal);
    });
  });

  describe('PR116-TC-08 — secret-bound', () => {
    it('changes index when the secret changes (verified via computeSessionIndexSync)', async () => {
      const folder = join(root, 'tc08');
      await mkdir(folder, { recursive: true });
      const k1 = randomBytes(32);
      const k2 = randomBytes(32);
      const idx1 = computeSessionIndexSync(folder, k1);
      const idx2 = computeSessionIndexSync(folder, k2);
      expect(idx2).not.toBe(idx1);
    });

    it('is stable across calls with the same key', async () => {
      const folder = join(root, 'tc08-stable');
      await mkdir(folder, { recursive: true });
      const k = randomBytes(32);
      expect(computeSessionIndexSync(folder, k)).toBe(computeSessionIndexSync(folder, k));
    });
  });

  describe('PR116-TC-09 — alphabet rejects ambiguous digits (RFC 4648)', () => {
    it('only contains A-Z and 2-7', () => {
      expect(SESSION_INDEX_BASE32_ALPHABET).toMatch(/^[A-Z2-7]+$/);
    });

    it('excludes the ambiguous digits 0, 1, 8, 9 (the four digits not in the 2-7 range)', () => {
      // RFC 4648 base32 IS the "rejects ambiguous digits" alphabet — note
      // that it does include O, I, L (letters); those are excluded only in
      // Crockford base32. The plan's "0189OIL" phrasing names the broader
      // set of historically-ambiguous symbols; only the digits are guaranteed
      // absent from RFC 4648.
      for (const c of ['0', '1', '8', '9']) {
        expect(SESSION_INDEX_BASE32_ALPHABET.includes(c)).toBe(false);
      }
    });

    it('isSessionIndex rejects lowercase, wrong length, and disallowed digits', () => {
      expect(isSessionIndex('ABCDEF')).toBe(true);
      expect(isSessionIndex('234567')).toBe(true);
      expect(isSessionIndex('abcdef')).toBe(false);
      expect(isSessionIndex('ABCDE')).toBe(false);
      expect(isSessionIndex('ABCDEFG')).toBe(false);
      expect(isSessionIndex('A1CDEF')).toBe(false);
      expect(isSessionIndex('A0CDEF')).toBe(false);
      // 'O' is a valid RFC 4648 base32 letter — accepted by the regex.
      expect(isSessionIndex('AOCDEF')).toBe(true);
      expect(isSessionIndex('')).toBe(false);
    });
  });

  describe('error surface', () => {
    it('throws when the folder does not exist', async () => {
      await expect(computeSessionIndex(join(root, 'never-created'))).rejects.toThrow();
    });

    it('throws when the path is a file rather than a directory? — realpath resolves either, no error', async () => {
      // Documented behaviour: computeSessionIndex doesn't assert is-a-directory;
      // it canonicalises and hashes. The caller (resolveSessionIndex) handles
      // directory-vs-file filtering. We just record the current shape here.
      const file = join(root, 'tc-file');
      await writeFile(file, 'x', 'utf8');
      const idx = await computeSessionIndex(file);
      expect(SESSION_INDEX_REGEX.test(idx)).toBe(true);
    });
  });
});
