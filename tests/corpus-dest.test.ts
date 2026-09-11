import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  defaultCorpusDest,
  isPrimaryCheckout,
  primaryCheckoutRoot,
  REFERENCE_CORPUS_REL,
} from '../src/corpus-dest.js';

function git(cwd: string, args: string[]): void {
  const r = spawnSync('git', args, { cwd, encoding: 'utf-8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || args.join(' '));
}

describe('defaultCorpusDest', () => {
  it('names .worktrees/workflows of the primary checkout from that checkout', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-dest-primary-'));
    try {
      git(root, ['init']);
      git(root, ['config', 'user.email', 't@example.com']);
      git(root, ['config', 'user.name', 't']);
      git(root, ['commit', '--allow-empty', '-m', 'init']);
      expect(primaryCheckoutRoot(root)).toBe(resolve(root));
      expect(defaultCorpusDest(root)).toBe(join(root, REFERENCE_CORPUS_REL));
      expect(isPrimaryCheckout(root)).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('names the primary dest from a nested engine worktree, not a dest under that worktree', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-dest-nested-'));
    try {
      git(root, ['init']);
      git(root, ['config', 'user.email', 't@example.com']);
      git(root, ['config', 'user.name', 't']);
      git(root, ['commit', '--allow-empty', '-m', 'init']);
      const wt = join(root, '.worktrees', 'feat', 'example');
      mkdirSync(join(root, '.worktrees', 'feat'), { recursive: true });
      git(root, ['branch', 'feat/example']);
      git(root, ['worktree', 'add', wt, 'feat/example']);
      expect(defaultCorpusDest(wt)).toBe(join(root, REFERENCE_CORPUS_REL));
      expect(isPrimaryCheckout(wt)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('falls back to fromDir/.worktrees/workflows when the path is not a git checkout', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-dest-nogit-'));
    try {
      expect(primaryCheckoutRoot(root)).toBeNull();
      expect(defaultCorpusDest(root)).toBe(join(resolve(root), REFERENCE_CORPUS_REL));
      expect(isPrimaryCheckout(root)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
