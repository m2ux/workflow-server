import { describe, it, expect } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { authorsIntoFixture, collect } from '../guards/check-pinned-corpus-paths.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * Pins name a workflow by id (`prism/techniques/…`), and existence goes through discovery. A
 * grouping folder around that workflow must not drop the pin or throw.
 */
describe.skipIf(!liveCorpusRoot())('pinned corpus paths', () => {
  it('resolves the repo\'s pins against the live corpus', () => {
    const tally = collect(liveCorpusRoot()!);
    expect(tally.checked).toBeGreaterThan(0);
    expect(tally.findings).toEqual([]);
  });

  it('still resolves a prism pin after prism moves under a grouping folder', () => {
    const root = mkdtempSync(join(tmpdir(), 'pinned-nested-'));
    try {
      cpSync(liveCorpusRoot()!, root, { recursive: true });
      // Discovery finds the workflow wherever it sits, so the grouping folder is built around the
      // directory the index reports rather than a path spelled here — a layout change moves the
      // subject of this test, not the test.
      const prism = indexCorpus(root).workflows.get('prism');
      expect(prism, 'the corpus declares no prism workflow to nest').toBeDefined();
      const nested = join(dirname(prism!.dir), 'security', 'audits', 'prism');
      mkdirSync(dirname(nested), { recursive: true });
      renameSync(prism!.dir, nested);
      const tally = collect(root);
      expect(tally.findings.filter((f) => f.detail.includes('`prism/'))).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  /**
   * A suite reading through `liveCorpusRoot()` spells a pin from the corpus checkout's own layout,
   * `corpus/<workflow>/…`, and a retired workflow leaves such a pin naming no workflow at all. The
   * path is assembled from its segments so this check does not become a dangling pin of its own.
   */
  it('reports a pin naming a workflow the corpus retired', () => {
    const retired = ['corpus', 'midnight-system-review', 'activities', '01-scope-intake.yaml'].join('/');
    const repo = mkdtempSync(join(tmpdir(), 'pinned-retired-'));
    try {
      mkdirSync(join(repo, 'tests', 'e2e'), { recursive: true });
      writeFileSync(
        join(repo, 'tests', 'e2e', 'walk-protocol.test.ts'),
        `const files = [\n  '${retired}',\n];\n`,
      );
      const { findings } = collect(liveCorpusRoot()!, repo);
      expect(findings.map((f) => f.site)).toEqual(['tests/e2e/walk-protocol.test.ts:2']);
      expect(findings[0]!.detail).toContain(retired);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

/**
 * A private corpus mounts the public one as a submodule, so the public canon sits a root down from
 * the one the guard is handed. A pin spelled from the public root names a file that corpus serves,
 * and the guard answers for the corpus served rather than for the single tree it was pointed at.
 */
describe.skipIf(!liveCorpusRoot())('a corpus joining a second root', () => {
  /** The public corpus mounted under `corpus/upstream/`, the shape an overlay checkout holds. */
  function overlay(): string {
    const root = mkdtempSync(join(tmpdir(), 'pinned-overlay-'));
    const mount = join(root, 'corpus', 'upstream');
    mkdirSync(mount, { recursive: true });
    cpSync(liveCorpusRoot()!, join(mount, 'public'), { recursive: true });
    return root;
  }

  /**
   * A repo naming one file the public canon holds and one a retired workflow left behind. The
   * retired path is assembled from its segments so this fixture does not become a pin of its own.
   */
  function repoWithBothPins(): { repo: string; retired: string } {
    const retired = ['corpus', 'midnight-system-review', 'activities', '01-scope-intake.yaml'].join('/');
    const repo = mkdtempSync(join(tmpdir(), 'pinned-overlay-repo-'));
    mkdirSync(join(repo, 'tests', 'e2e'), { recursive: true });
    writeFileSync(
      join(repo, 'tests', 'e2e', 'pins.test.ts'),
      `const held = 'corpus/canon/resources/anti-patterns.md';\nconst gone = '${retired}';\n`,
    );
    return { repo, retired };
  }

  it('resolves the repo\'s pins through the root it joins', () => {
    const root = overlay();
    try {
      const tally = collect(root);
      expect(tally.checked).toBeGreaterThan(0);
      expect(tally.findings).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports a pin naming a file no joined root holds', () => {
    const root = overlay();
    const { repo, retired } = repoWithBothPins();
    try {
      const { findings } = collect(root, repo);
      expect(findings.map((f) => f.site)).toEqual(['tests/e2e/pins.test.ts:2']);
      expect(findings[0]!.detail).toContain(retired);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it('returns the verdict it returns at the root it joins', () => {
    const root = overlay();
    const { repo } = repoWithBothPins();
    try {
      expect(collect(root, repo).findings).toEqual(collect(liveCorpusRoot()!, repo).findings);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

/**
 * A fixture write is a fixture write whichever line its path lands on. The exemption reads the call
 * rather than the line, so a wrapped write is exempt and a literal deeper in an unrelated call is not.
 */
describe('a path authored into a fixture tree', () => {
  // These lines are data the function reads, so their paths name a fixture id rather than a
  // workflow — a real corpus path spelled here would be a pin of this file's own.
  it('is recognised beside its call', () => {
    expect(authorsIntoFixture(["  write('wf/techniques/plan.md', body);"], 0)).toBe(true);
  });

  it('is recognised below a call that wraps, across blank and comment lines', () => {
    const lines = [
      '  write(',
      '    // A technique inside a group, keyed on its own filename.',
      '',
      "    'wf/techniques/group/op.md',",
      "    '## Rules',",
      '  );',
    ];
    expect(authorsIntoFixture(lines, 3)).toBe(true);
  });

  it('is not claimed by a literal several arguments into an unrelated call', () => {
    const lines = [
      '  consumerReaches(',
      "    'wf/techniques/present-result.md',",
      '  );',
    ];
    expect(authorsIntoFixture(lines, 1)).toBe(false);
  });

  it('is recognised on every key of a fixture map, not only its first', () => {
    const lines = [
      '    withCorpus({',
      "      'wf/resources/one.md': resource('Severities', BODY),",
      "      'wf/resources/two.md': resource('Severities', BODY),",
      '    }, (root) => {',
    ];
    expect(authorsIntoFixture(lines, 1)).toBe(true);
    expect(authorsIntoFixture(lines, 2)).toBe(true);
  });

  it('is not claimed by an argument of a call the authoring call already closed', () => {
    const lines = [
      "  write('wf/techniques/one.md', body);",
      "  consumerReaches('wf/techniques/present-result.md');",
    ];
    expect(authorsIntoFixture(lines, 1)).toBe(false);
  });
});
