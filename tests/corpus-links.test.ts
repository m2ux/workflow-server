import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveLink } from '../scripts/corpus-links.js';
import { collectFindings } from '../scripts/check-corpus-links.js';

/**
 * A reference out of a workflow names the workflow; a reference within one is an ordinary relative
 * path. The fixture nests `beta` under a grouping folder, because a rule about layout independence
 * that is only ever exercised on a flat corpus proves nothing.
 */
describe('corpus links', () => {
  let root: string;

  const write = (rel: string, body: string): string => {
    const path = join(root, ...rel.split('/'));
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, body);
    return path;
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'corpus-links-'));
    write('group/beta/workflow.yaml', 'id: beta\nversion: 1.0.0\ntitle: Beta\n');
    write('group/beta/techniques/conduct.md', '# Conduct\n');
    write('group/beta/resources/register.md', '# Register\n');
    write('alpha/workflow.yaml', 'id: alpha\nversion: 1.0.0\ntitle: Alpha\n');
    write('alpha/README.md', '# Alpha\n');
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const BETA_DIR = (): string => join(root, 'group', 'beta');

  describe('resolveLink', () => {
    it('resolves an absolute link to wherever the workflow was discovered', () => {
      const link = resolveLink(root, join(root, 'alpha', 'README.md'), '/beta/techniques/conduct.md');
      expect(link.form).toBe('workflow');
      expect(link.path).toBe(join(BETA_DIR(), 'techniques', 'conduct.md'));
    });

    it('reports an absolute link naming no workflow the corpus holds', () => {
      const link = resolveLink(root, join(root, 'alpha', 'README.md'), '/no-such-workflow/x.md');
      expect(link.form).toBe('workflow');
      expect(link.workflow).toBe('no-such-workflow');
      expect(link.path).toBeNull();
    });

    it('resolves a relative link against the file holding it', () => {
      const link = resolveLink(root, join(BETA_DIR(), 'techniques', 'a.md'), '../resources/register.md');
      expect(link.path).toBe(join(BETA_DIR(), 'resources', 'register.md'));
    });

    it('names no corpus file for a URL or an in-page anchor', () => {
      const file = join(root, 'alpha', 'README.md');
      expect(resolveLink(root, file, 'https://example.com/x.md').form).toBe('external');
      expect(resolveLink(root, file, '#a-heading').form).toBe('external');
    });
  });

  describe('the guard', () => {
    /** Write one file, collect against the corpus, and report the checks raised for that file. */
    const checksFor = (rel: string, body: string): string[] => {
      const path = write(rel, body);
      try {
        return collectFindings(root).filter((f) => f.site.startsWith(rel)).map((f) => f.check);
      } finally {
        rmSync(path, { force: true });
      }
    };

    it('accepts a relative link that stays inside its own workflow', () => {
      expect(checksFor('alpha/techniques/a.md', '[r](../README.md)\n')).toEqual([]);
    });

    it('accepts an absolute link to another workflow', () => {
      expect(checksFor('alpha/techniques/a.md', '[c](/beta/techniques/conduct.md)\n')).toEqual([]);
    });

    it('refuses a link that counts directories into another workflow', () => {
      expect(checksFor('alpha/techniques/a.md', '[c](../../group/beta/techniques/conduct.md)\n'))
        .toEqual(['traversal-out-of-workflow']);
    });

    it('refuses a link that climbs to the corpus root and comes back into its own workflow', () => {
      expect(checksFor('group/beta/techniques/a.md', '[r](../../beta/resources/register.md)\n'))
        .toEqual(['traversal-out-of-workflow']);
    });

    it('refuses an absolute link naming no workflow', () => {
      expect(checksFor('alpha/techniques/a.md', '[x](/no-such-workflow/x.md)\n')).toEqual(['unknown-workflow']);
    });

    it('leaves a link inside a fenced block alone, since a template shows forms it does not follow', () => {
      expect(checksFor('alpha/techniques/a.md', '```\n[c](../../group/beta/techniques/conduct.md)\n```\n'))
        .toEqual([]);
    });

    it('leaves a link out of the corpus alone, which is a separate problem', () => {
      expect(checksFor('alpha/techniques/a.md', '[d](../../../docs/architecture.md)\n')).toEqual([]);
    });
  });
});
