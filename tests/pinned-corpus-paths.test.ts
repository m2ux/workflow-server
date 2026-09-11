import { describe, it, expect } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collect } from '../guards/check-pinned-corpus-paths.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Pins name a workflow by id (`prism/techniques/…`), and existence goes through discovery. A
 * grouping folder around that workflow must not drop the pin or throw.
 */
describe('pinned corpus paths', () => {
  it('resolves the repo\'s pins against the live corpus', () => {
    const tally = collect(corpusRoot());
    expect(tally.checked).toBeGreaterThan(0);
    expect(tally.findings).toEqual([]);
  });

  it('still resolves a prism pin after prism moves under a grouping folder', () => {
    const root = mkdtempSync(join(tmpdir(), 'pinned-nested-'));
    try {
      cpSync(corpusRoot(), root, { recursive: true });
      mkdirSync(join(root, 'security', 'audits'), { recursive: true });
      renameSync(join(root, 'prism'), join(root, 'security', 'audits', 'prism'));
      const tally = collect(root);
      expect(tally.findings.filter((f) => f.detail.includes('`prism/'))).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
