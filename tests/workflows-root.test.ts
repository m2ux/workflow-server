import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  assertScanned,
  citePath,
  definitionsUnder,
  ledgerPath,
  ownDefinitionsIn,
  requireWorkflowsRoot,
  resolveWorkflowsRoot,
  resolveWorkflowsRootWithOrigin,
  UnreachableCorpusError,
  walkArtifactPath,
} from '../guards/workflows-root.js';

/**
 * The guard scripts default to `.worktrees/workflows` of the primary checkout and must
 * be redirectable to another dest (`--root`, `WORKFLOWS_DIR`). Precedence: --root flag >
 * WORKFLOWS_DIR env > default.
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

  it('rejects an empty directory — the unprovisioned-worktree state', () => {
    const empty = mkdtempSync(join(tmpdir(), 'corpus-empty-'));
    expect(() => requireWorkflowsRoot(empty, [])).toThrow(/contains no workflow/);
  });

  it('accepts a directory holding at least one workflow', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-ok-'));
    mkdirSync(join(root, 'some-workflow'));
    writeFileSync(join(root, 'some-workflow', 'workflow.yaml'), 'id: some-workflow\n');
    expect(requireWorkflowsRoot(root, [])).toBe(root);
  });

  it('accepts a workflow nested under grouping folders', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-nested-'));
    mkdirSync(join(root, 'security', 'audits', 'some-workflow'), { recursive: true });
    writeFileSync(join(root, 'security', 'audits', 'some-workflow', 'workflow.yaml'), 'id: some-workflow\n');
    expect(requireWorkflowsRoot(root, [])).toBe(root);
  });

  it('accepts a directory whose only definition declares a different id', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-mismatch-'));
    mkdirSync(join(root, 'folder-name'));
    writeFileSync(join(root, 'folder-name', 'workflow.yaml'), 'id: declared-name\nversion: 1.0.0\ntitle: t\n');
    expect(requireWorkflowsRoot(root, [])).toBe(root);
  });

  it('rejects a root whose only content is a folder of techniques — no workflow declares them', () => {
    const root = mkdtempSync(join(tmpdir(), 'corpus-techniques-'));
    mkdirSync(join(root, 'lib', 'techniques'), { recursive: true });
    expect(() => requireWorkflowsRoot(root, [])).toThrow(/contains no workflow/);
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

describe('kind roots on a pointed corpus tree', () => {
  it('places triage files under ledgers/ of the root the guard was pointed at', () => {
    expect(ledgerPath('/tmp/wf', 'binding-fidelity-triage.json'))
      .toBe(join('/tmp/wf', 'ledgers', 'binding-fidelity-triage.json'));
  });

  it('places walk artifacts under walks/ of the same root', () => {
    expect(walkArtifactPath('/tmp/wf', 'option-coverage.json'))
      .toBe(join('/tmp/wf', 'walks', 'option-coverage.json'));
    expect(walkArtifactPath('/tmp/wf', 'roster.json'))
      .toBe(join('/tmp/wf', 'walks', 'roster.json'));
    expect(walkArtifactPath('/tmp/wf', 'snapshot.test.ts.snap'))
      .toBe(join('/tmp/wf', 'walks', 'snapshot.test.ts.snap'));
  });

  it('reads a ledger written under ledgers/ of a temp tree, not beside the check program', () => {
    const root = mkdtempSync(join(tmpdir(), 'kind-roots-'));
    mkdirSync(join(root, 'ledgers'));
    writeFileSync(join(root, 'ledgers', 'section-framing-triage.json'), '{"entries":[]}\n');
    expect(ledgerPath(root, 'section-framing-triage.json')).toBe(join(root, 'ledgers', 'section-framing-triage.json'));
  });
});

describe('citePath', () => {
  it('names a nested product file by workflow id, not the grouping folder', () => {
    const root = mkdtempSync(join(tmpdir(), 'cite-nested-'));
    const dir = join(root, 'corpus', 'alpha', 'resources');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(root, 'corpus', 'alpha', 'workflow.yaml'), 'id: alpha\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(dir, 'guide.md'), '# g\n');
    expect(citePath(root, join(dir, 'guide.md'))).toBe('alpha/resources/guide.md');
  });

  it('names a still-flat product file the same way', () => {
    const root = mkdtempSync(join(tmpdir(), 'cite-flat-'));
    const dir = join(root, 'alpha', 'resources');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(root, 'alpha', 'workflow.yaml'), 'id: alpha\nversion: 1.0.0\ntitle: t\n');
    writeFileSync(join(dir, 'guide.md'), '# g\n');
    expect(citePath(root, join(dir, 'guide.md'))).toBe('alpha/resources/guide.md');
  });
});

/**
 * The two definition walks. They differ in depth and in nothing else, which is what lets a guard
 * pick between them on the grain of its rule: a rule about the file in front of it takes the deep
 * walk, and one grading a definition against the workflow around it takes the shallow one.
 *
 * `meta/activities/patterns/` is the tree these exist for — a library a client workflow borrows by
 * path, which the borrowing workflow's graph never registers and the loader never enumerates.
 */
describe('the definition walks', () => {
  let root = '';

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'walks-'));
    mkdirSync(join(root, 'patterns'), { recursive: true });
    writeFileSync(join(root, '02-second.yaml'), 'id: second\n');
    writeFileSync(join(root, '01-first.yaml'), 'id: first\n');
    writeFileSync(join(root, 'notes.md'), '# not a definition\n');
    writeFileSync(join(root, 'patterns', '02-borrowed.yaml'), 'id: borrowed\n');
  });

  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it('reaches a definition a level down, named by its path from the walk root', () => {
    expect(definitionsUnder(root).map((d) => d.rel))
      .toEqual(['01-first.yaml', '02-second.yaml', 'patterns/02-borrowed.yaml']);
  });

  it('stops at the top level, where a workflow keeps its own definitions', () => {
    expect(ownDefinitionsIn(root).map((d) => d.rel)).toEqual(['01-first.yaml', '02-second.yaml']);
  });

  it('takes both definition spellings and nothing else', () => {
    writeFileSync(join(root, '03-third.yml'), 'id: third\n');
    expect(definitionsUnder(root).map((d) => d.rel)).toContain('03-third.yml');
    expect(ownDefinitionsIn(root).map((d) => d.rel)).toContain('03-third.yml');
    expect(definitionsUnder(root).map((d) => d.rel)).not.toContain('notes.md');
  });

  /**
   * Two walks that exist to be one answer to "which files" cannot disagree about what a file is.
   * A test for a REGULAR file rather than for "not a directory" drops a symlinked definition from
   * one of them and keeps it in the other.
   */
  it('agrees on a symlinked definition', () => {
    symlinkSync(join(root, '01-first.yaml'), join(root, '04-linked.yaml'));
    expect(definitionsUnder(root).map((d) => d.rel)).toContain('04-linked.yaml');
    expect(ownDefinitionsIn(root).map((d) => d.rel)).toContain('04-linked.yaml');
  });

  it('pairs each name with the path that file sits at', () => {
    const nested = definitionsUnder(root).find((d) => d.rel === 'patterns/02-borrowed.yaml');
    expect(nested?.path).toBe(join(root, 'patterns', '02-borrowed.yaml'));
  });
});
