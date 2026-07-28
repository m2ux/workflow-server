import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  assertScanned,
  requireWorkflowsRoot,
  resolveWorkflowsRoot,
  resolveWorkflowsRootWithOrigin,
  UnreachableCorpusError,
} from '../scripts/workflows-root.js';

/**
 * The guard scripts default to the repo's own ../workflows but must be redirectable to a
 * dedicated worktree so they validate the change under review, not the stale main copy
 * (issue #160 follow-up #1). Precedence: --root flag > WORKFLOWS_DIR env > default.
 */
describe('resolveWorkflowsRoot', () => {
  const DEFAULT = '/repo/workflows';
  const savedEnv = process.env.WORKFLOWS_DIR;

  // Isolate from any ambient WORKFLOWS_DIR (e.g. when the guard test suites are run with it set to
  // point at a real corpus) so the default/precedence assertions are hermetic.
  beforeEach(() => {
    delete process.env.WORKFLOWS_DIR;
  });

  afterEach(() => {
    if (savedEnv === undefined) delete process.env.WORKFLOWS_DIR;
    else process.env.WORKFLOWS_DIR = savedEnv;
  });

  it('returns the default when no override is given', () => {
    expect(resolveWorkflowsRoot(DEFAULT, [])).toBe(DEFAULT);
  });

  it('honors --root <path> (space form), resolved to absolute', () => {
    expect(resolveWorkflowsRoot(DEFAULT, ['--root', '/wt/workflows'])).toBe('/wt/workflows');
  });

  it('honors --root=<path> (equals form)', () => {
    expect(resolveWorkflowsRoot(DEFAULT, ['--root=/wt/workflows'])).toBe('/wt/workflows');
  });

  it('resolves a relative --root against cwd', () => {
    expect(resolveWorkflowsRoot(DEFAULT, ['--root', 'rel/workflows'])).toBe(resolve('rel/workflows'));
  });

  it('falls back to WORKFLOWS_DIR when no flag is present', () => {
    process.env.WORKFLOWS_DIR = '/env/workflows';
    expect(resolveWorkflowsRoot(DEFAULT, [])).toBe('/env/workflows');
  });

  it('prefers --root over WORKFLOWS_DIR', () => {
    process.env.WORKFLOWS_DIR = '/env/workflows';
    expect(resolveWorkflowsRoot(DEFAULT, ['--root', '/wt/workflows'])).toBe('/wt/workflows');
  });

  it('ignores an unrelated flag like --json', () => {
    expect(resolveWorkflowsRoot(DEFAULT, ['--json'])).toBe(DEFAULT);
  });

  it('reports which knob selected the root, so a failure can name it', () => {
    expect(resolveWorkflowsRootWithOrigin(DEFAULT, []).origin).toBe('default');
    expect(resolveWorkflowsRootWithOrigin(DEFAULT, ['--root', '/wt/workflows']).origin).toBe('--root');
    process.env.WORKFLOWS_DIR = '/env/workflows';
    expect(resolveWorkflowsRootWithOrigin(DEFAULT, []).origin).toBe('WORKFLOWS_DIR');
  });
});

/**
 * A guard aimed at a corpus it cannot reach must fail loudly rather than report a clean walk of
 * nothing — green-because-empty reads as coverage the run never had (issue #327 S2).
 */
describe('requireWorkflowsRoot', () => {
  const savedEnv = process.env.WORKFLOWS_DIR;
  beforeEach(() => { delete process.env.WORKFLOWS_DIR; });
  afterEach(() => {
    if (savedEnv === undefined) delete process.env.WORKFLOWS_DIR;
    else process.env.WORKFLOWS_DIR = savedEnv;
  });

  it('rejects a root that does not exist, naming the knob that selected it', () => {
    expect(() => requireWorkflowsRoot('/nope/workflows', [])).toThrow(UnreachableCorpusError);
    expect(() => requireWorkflowsRoot('/d', ['--root', '/nope/workflows'])).toThrow(/--root/);
    process.env.WORKFLOWS_DIR = '/nope/workflows';
    expect(() => requireWorkflowsRoot('/d', [])).toThrow(/WORKFLOWS_DIR/);
  });

  it('rejects an empty directory — the unprovisioned-submodule state', () => {
    const empty = mkdtempSync(join(tmpdir(), 'corpus-empty-'));
    expect(() => requireWorkflowsRoot(empty, [])).toThrow(/contains no workflow/);
  });

  it('accepts a directory holding at least one workflow', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-ok-'));
    mkdirSync(join(root, 'some-workflow'));
    writeFileSync(join(root, 'some-workflow', 'workflow.yaml'), 'id: some-workflow\n');
    expect(requireWorkflowsRoot(root, [])).toBe(root);
  });

  it('accepts a workflow declared by an activities/ or techniques/ folder alone', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-techniques-'));
    mkdirSync(join(root, 'lib', 'techniques'), { recursive: true });
    expect(requireWorkflowsRoot(root, [])).toBe(root);
  });
});

describe('assertScanned', () => {
  it('fails when a guard inspected nothing', () => {
    expect(() => assertScanned(0, 'technique files', '/x')).toThrow(UnreachableCorpusError);
    expect(() => assertScanned(0, 'technique files', '/x')).toThrow(/not a pass/);
  });

  it('passes once the guard has inspected something', () => {
    expect(() => assertScanned(1, 'technique files', '/x')).not.toThrow();
  });
});
