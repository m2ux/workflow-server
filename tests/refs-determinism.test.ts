import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { collectFindings } from '../guards/check-all-refs.js';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';

/**
 * The `refs` guard reports the same findings for the same corpus, on every run and on every tree.
 *
 * A workflow load reads its borrowed activities together, so the order those reads finish in is
 * the filesystem's to choose. Here every read finishes after a random delay, and the directories are
 * listed in reverse on a second tree: a finding that names whichever file was met or finished first
 * changes between runs, or between trees, and these cases see it change.
 */
const io = vi.hoisted(() => ({ jitter: false, reversed: false }));

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  const readFile = (async (...args: Parameters<typeof actual.readFile>) => {
    if (io.jitter) await new Promise((settle) => setTimeout(settle, Math.random() * 4));
    return actual.readFile(...args);
  }) as typeof actual.readFile;
  const readdir = (async (...args: Parameters<typeof actual.readdir>) => {
    const entries = await actual.readdir(...args) as unknown[];
    return io.reversed ? [...entries].reverse() : entries;
  }) as typeof actual.readdir;
  return { ...actual, readFile, readdir, default: { ...actual, readFile, readdir } };
});

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  const readdirSync = ((...args: Parameters<typeof actual.readdirSync>) => {
    const entries = actual.readdirSync(...args) as unknown[];
    return io.reversed ? [...entries].reverse() : entries;
  }) as typeof actual.readdirSync;
  return { ...actual, readdirSync, default: { ...actual, readdirSync } };
});

const RUNS = 12;

/**
 * A lender holding one activity that loads and two whose schema has moved on, and borrowers that
 * reach them: one borrowing only the stale pair, and one naming two files that are gone as well.
 * Each borrower's own activity binds techniques no namespace holds. `reverse` writes every directory's
 * entries in the opposite order, so a tree whose listing follows creation lists them the other way.
 */
function writeCorpus(root: string, reverse: boolean): void {
  const files: Array<[string, string]> = [
    ['lender/workflow.yaml', 'id: lender\nversion: 1.0.0\ntitle: Lender\ninitialActivity: ok\n'],
    ['lender/activities/01-ok.yaml', 'id: ok\nversion: 1.0.0\nname: Ok\n'],
    ['lender/activities/03-stale.yaml', 'id: stale\nversion: 1.0.0\n'],
    ['lender/activities/04-older.yaml', 'id: older\nversion: 1.0.0\n'],
    ['stale-borrower/workflow.yaml', [
      'id: stale-borrower', 'version: 1.0.0', 'title: Stale borrower', 'initialActivity: own',
      'activities:', '  - lender/03-stale.yaml', '  - lender/04-older.yaml',
    ].join('\n')],
    ['stale-borrower/activities/01-own.yaml', 'id: own\nversion: 1.0.0\nname: Own\ntechniques:\n  - absent-second\n  - absent-first\n'],
    ['gone-borrower/workflow.yaml', [
      'id: gone-borrower', 'version: 1.0.0', 'title: Gone borrower', 'initialActivity: own',
      'activities:', '  - lender/03-stale.yaml', '  - lender/08-gone.yaml', '  - lender/04-older.yaml', '  - lender/07-gone.yaml',
    ].join('\n')],
    ['gone-borrower/activities/01-own.yaml', 'id: own\nversion: 1.0.0\nname: Own\n'],
  ];
  for (const [rel, text] of reverse ? [...files].reverse() : files) {
    const path = join(root, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text, 'utf-8');
  }
}

describe('refs findings are fixed by the corpus content', () => {
  let first: string;
  let second: string;

  beforeAll(() => {
    first = mkdtempSync(join(tmpdir(), 'refs-determinism-a-'));
    second = mkdtempSync(join(tmpdir(), 'refs-determinism-b-'));
    writeCorpus(first, false);
    writeCorpus(second, true);
  });

  afterAll(() => {
    io.jitter = false;
    io.reversed = false;
    rmSync(first, { recursive: true, force: true });
    rmSync(second, { recursive: true, force: true });
  });

  it('names every file a load cannot reach, in the order the workflow names them', async () => {
    const findings = await collectFindings(first);
    const load = findings.find((f) => f.check === 'workflow-load' && f.site === 'gone-borrower');
    expect(load?.detail).toMatch(/'lender\/08-gone\.yaml' names no activity file.*'lender\/07-gone\.yaml' names no activity file/);
    expect(findings.filter((f) => f.check === 'unresolved-technique-ref').map((f) => f.site))
      .toEqual(['stale-borrower :: absent-second', 'stale-borrower :: absent-first']);
  });

  it('reports the same findings on every run while reads finish in a random order', async () => {
    io.jitter = true;
    try {
      const runs = [];
      for (let i = 0; i < RUNS; i++) runs.push(await collectFindings(first));
      for (const run of runs) expect(run).toEqual(runs[0]);
    } finally {
      io.jitter = false;
    }
  });

  it('keeps borrowed files that fail to load in the order the workflow names them, on every run', async () => {
    io.jitter = true;
    try {
      for (let i = 0; i < RUNS; i++) {
        const result = await loadWorkflowWithDiagnostics(first, 'stale-borrower');
        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.value.activityLoadErrors.map((e) => e.file)).toEqual(['lender/03-stale.yaml', 'lender/04-older.yaml']);
      }
    } finally {
      io.jitter = false;
    }
  });

  it('reports the same findings on a tree holding the same files, whatever order it lists them in', async () => {
    const forward = await collectFindings(first);
    io.reversed = true;
    io.jitter = true;
    try {
      const otherTree = await collectFindings(second);
      expect(JSON.stringify(otherTree).replaceAll(second, '<root>')).toBe(JSON.stringify(forward).replaceAll(first, '<root>'));
    } finally {
      io.reversed = false;
      io.jitter = false;
    }
  });
});
