import { describe, it, expect } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { collect } from '../guards/check-pinned-corpus-paths.js';
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
