import { describe, it, expect } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
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

  it('is not claimed by an argument of a call the authoring call already closed', () => {
    const lines = [
      "  write('wf/techniques/one.md', body);",
      "  consumerReaches('wf/techniques/present-result.md');",
    ];
    expect(authorsIntoFixture(lines, 1)).toBe(false);
  });
});
