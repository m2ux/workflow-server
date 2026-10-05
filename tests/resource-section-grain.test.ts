import { describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { liveCorpusRoot } from './corpus-root.js';
import { loadResourceDelivery } from '../src/utils/resource-delivery.js';

/**
 * Library resources hold fill and consult. A protocol cadence belongs to a technique.
 * A section fetch returns that section.
 */

/** Imperative session cadence. A numbered vocabulary or a template placeholder is not a cadence. */
export function protocolCadence(markdown: string): string[] {
  const hits: string[] = [];
  const patterns: Array<[RegExp, string]> = [
    [/\bafter each (phase|task)\b/i, 'after each phase/task'],
    [/\bask after\b/i, 'ask after'],
    [/\bvalidate before proceeding\b/i, 'validate before proceeding'],
    [/\bconfirm at checkpoint\b/i, 'confirm at checkpoint'],
    [/\bproceed to\b/i, 'proceed to'],
    [/^\d+\.\s+(Ensure|Apply|Ask|Confirm|Validate|Proceed|Surface)\b/im, 'numbered operational step'],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(markdown)) hits.push(label);
  }
  return hits;
}

function firstSectionAnchor(markdown: string): string | null {
  const match = markdown.match(/^##\s+(.+?)\s*$/m);
  if (!match) return null;
  return match[1]!.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

describe('protocol cadence', () => {
  it('fails when a resource contains a protocol cadence', () => {
    const bad = '## Research Protocol\n\n1. Ensure the worktree exists\n2. Apply the guide\n';
    expect(protocolCadence(bad)).toContain('numbered operational step');
  });

  it('passes a template and a vocabulary', () => {
    const good = '## Template\n\n```markdown\n# Plan\n```\n\n## Rules\n\n- One row per task.\n';
    expect(protocolCadence(good)).toEqual([]);
  });
});

describe('library resource grain', () => {
  const corpus = liveCorpusRoot();

  it.skipIf(!corpus)('finds no protocol cadence in a library resource', async () => {
    const dir = join(corpus!, 'corpus', 'work-package', 'resources');
    const names = (await readdir(dir)).filter((name) => name.endsWith('.md') && name !== 'README.md');
    expect(names.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const name of names) {
      const text = await readFile(join(dir, name), 'utf8');
      for (const label of protocolCadence(text)) hits.push(`${name}: ${label}`);
    }
    expect(hits).toEqual([]);
  });
});

describe('section fetch', () => {
  it('returns the cited section and not the rest of the file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'section-fetch-'));
    try {
      const dir = join(root, 'work-package', 'resources');
      await mkdir(dir, { recursive: true });
      const body = [
        '---',
        'name: plan-guide',
        'description: Fixture.',
        '---',
        '',
        '# Plan',
        '',
        'The whole file opens here.',
        '',
        '## Template',
        '',
        'The template body.',
        '',
        '## Rules',
        '',
        'One row per task.',
        '',
      ].join('\n');
      await writeFile(join(dir, 'plan-guide.md'), body, 'utf8');
      await writeFile(join(root, 'work-package', 'workflow.yaml'), 'id: work-package\nversion: 1.0.0\ntitle: Library\n', 'utf8');

      const result = await loadResourceDelivery(root, 'work-package', 'work-package/plan-guide#template', 'AAAAAA');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.value.content).toContain('The template body.');
      expect(result.value.content).not.toContain('The whole file opens here.');
      expect(result.value.content).not.toContain('One row per task.');
      expect(result.value.content.length).toBeLessThan(body.length);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it.skipIf(!liveCorpusRoot())('returns one section of each library resource', async () => {
    const corpus = liveCorpusRoot()!;
    const dir = join(corpus, 'corpus', 'work-package', 'resources');
    const names = (await readdir(dir)).filter((name) => name.endsWith('.md') && name !== 'README.md');
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const text = await readFile(join(dir, name), 'utf8');
      const anchor = firstSectionAnchor(text);
      expect(anchor, name).toBeTruthy();
      const id = name.replace(/\.md$/, '');
      const result = await loadResourceDelivery(corpus, 'work-package', `work-package/${id}#${anchor}`, 'AAAAAA');
      expect(result.success, name).toBe(true);
      if (!result.success) continue;
      expect(result.value.content.length, name).toBeLessThan(text.length);
      expect(result.value.content.startsWith('---'), name).toBe(false);
    }
  });
});
