import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, symlinkSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  assertPathInsideRoot,
  isPathInsideRoot,
  PathContainmentError,
} from '../src/worktree-validator.js';

describe('worktree-validator — path containment', () => {
  let root: string;
  let outside: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'wt-root-'));
    outside = mkdtempSync(join(tmpdir(), 'wt-outside-'));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });

  describe('isPathInsideRoot', () => {
    it('accepts the root itself and descendants', () => {
      expect(isPathInsideRoot('/tmp/uploads', '/tmp/uploads')).toBe(true);
      expect(isPathInsideRoot('/tmp/uploads', '/tmp/uploads/nested')).toBe(true);
    });

    it('rejects sibling-prefix paths (/uploads vs /uploads-evil)', () => {
      expect(isPathInsideRoot('/tmp/uploads', '/tmp/uploads-evil/x')).toBe(false);
    });
  });

  describe('assertPathInsideRoot', () => {
    it('accepts absolute paths under the root', () => {
      const nested = join(root, 'a', 'b');
      mkdirSync(nested, { recursive: true });
      expect(assertPathInsideRoot(root, nested)).toBe(resolve(nested));
    });

    it('accepts relative candidates resolved against the root', () => {
      mkdirSync(join(root, 'planning'), { recursive: true });
      const result = assertPathInsideRoot(root, 'planning');
      expect(result).toBe(resolve(root, 'planning'));
    });

    it('rejects .. traversal that escapes the root (PR267-TC-07)', () => {
      const escape = join(root, '..', 'escape-target');
      expect(() => assertPathInsideRoot(root, escape)).toThrow(PathContainmentError);
      expect(() => assertPathInsideRoot(root, escape)).toThrow(/outside the configured worktree root/);
      expect(() => assertPathInsideRoot(root, escape)).toThrow(/initialise \.engineering/);
    });

    it('rejects sibling-prefix paths (PR267-TC-08)', () => {
      // Build a root whose name is a prefix of a sibling directory name.
      const base = mkdtempSync(join(tmpdir(), 'prefix-base-'));
      const uploads = join(base, 'uploads');
      const uploadsEvil = join(base, 'uploads-evil');
      mkdirSync(uploads, { recursive: true });
      mkdirSync(join(uploadsEvil, 'x'), { recursive: true });
      try {
        expect(() => assertPathInsideRoot(uploads, join(uploadsEvil, 'x'))).toThrow(
          PathContainmentError,
        );
      } finally {
        rmSync(base, { recursive: true, force: true });
      }
    });

    it('rejects symlink escape after realpath (PR267-TC-09)', () => {
      const outsideFile = join(outside, 'secret.txt');
      writeFileSync(outsideFile, 'secret');
      const linkInside = join(root, 'escape-link');
      symlinkSync(outside, linkInside);

      expect(() => assertPathInsideRoot(root, join(linkInside, 'secret.txt'))).toThrow(
        PathContainmentError,
      );
    });

    it('accepts an in-root real path when realpath is enabled', () => {
      const nested = join(root, 'ok');
      mkdirSync(nested, { recursive: true });
      const link = join(root, 'alias');
      symlinkSync(nested, link);
      expect(assertPathInsideRoot(root, link)).toBe(resolve(nested));
    });
  });
});
