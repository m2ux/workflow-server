import { describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings, findingsForMode } from '../guards/check-mode-variables.js';

/**
 * Mode-variable guard. Implement, review, and remediate declare only names their activities
 * read or write. The combined workflow's flags stay on legacy.
 */

describe('mode-variable findings', () => {
  const used = new Set(['target_path']);

  it('fails when implement, review, or remediate declares a mode flag', () => {
    expect(findingsForMode('implement', ['is_review_mode'], used).map((f) => f.check)).toEqual(['mode-flag']);
    expect(findingsForMode('review', ['stealth_mode'], used).map((f) => f.check)).toEqual(['mode-flag']);
    expect(findingsForMode('remediate', ['is_review_mode', 'stealth_mode'], used)).toHaveLength(2);
  });

  it('fails when a mode declares a variable no activity reads or writes', () => {
    const findings = findingsForMode('implement', ['orphan_note'], used);
    expect(findings).toEqual([
      { check: 'unused-variable', site: 'implement', detail: "'orphan_note' is declared and no activity reads or writes it" },
    ]);
  });

  it('passes a name an activity reads, and passes legacy with both flags', () => {
    expect(findingsForMode('implement', ['target_path'], used)).toEqual([]);
    expect(findingsForMode('legacy', ['is_review_mode', 'stealth_mode', 'orphan_note'], new Set())).toEqual([]);
  });
});

describe('mode-variable guard (fixture corpus)', () => {
  let root: string;

  async function writeMode(id: string, variable: string, used: boolean): Promise<void> {
    const dir = join(root, id);
    await mkdir(join(dir, 'activities'), { recursive: true });
    const reads = used ? '\n  reads:\n    - target_path' : '';
    await writeFile(join(dir, 'workflow.yaml'), [
      `id: ${id}`,
      'version: 1.0.0',
      `title: ${id}`,
      'description: Fixture.',
      'initialActivity: start',
      'variables:',
      `  - name: ${variable}`,
      '    type: string',
      '    description: Fixture variable.',
      '',
    ].join('\n'), 'utf8');
    await writeFile(join(dir, 'activities', '01-start.yaml'), `id: start\nvariables:${reads}\n`, 'utf8');
  }

  it('fails a loaded workflow that declares a mode flag', async () => {
    root = await mkdtemp(join(tmpdir(), 'mode-variables-'));
    try {
      await writeMode('implement', 'is_review_mode', true);
      const findings = collectFindings(root);
      expect(findings.map((f) => f.check)).toEqual(['mode-flag']);
      expect(findings[0]?.site).toBe('implement');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
