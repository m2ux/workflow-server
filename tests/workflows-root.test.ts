import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { resolveWorkflowsRoot } from '../scripts/workflows-root.js';

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

  it('ignores an unrelated flag like --update-baseline', () => {
    expect(resolveWorkflowsRoot(DEFAULT, ['--update-baseline'])).toBe(DEFAULT);
  });
});
