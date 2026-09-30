import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../guards/check-inherited-inputs.js';
import { writeLoadableWorkflowFixture } from './corpus-fixture.js';

/**
 * inherited-inputs guard: a leaf redeclaring an input its container contract already merges in.
 *
 * The catalog entry exempts a leaf entry that changes the bind contract. An optionality the technique
 * needs runs in both directions, so a leaf requiring an input its ancestor marks optional is an
 * override, and a leaf restating the ancestor's contract is the defect.
 */
describe('inherited-inputs guard', () => {
  function findingsFor(rootEntry: string, leafEntry: string): ReturnType<typeof collectFindings> {
    const root = mkdtempSync(join(tmpdir(), 'wf-inherited-'));
    try {
      writeLoadableWorkflowFixture(root, 'wf', ['act']);
      const techniques = join(root, 'wf', 'techniques');
      mkdirSync(techniques, { recursive: true });
      writeFileSync(
        join(techniques, 'TECHNIQUE.md'),
        `## Capability\n\nThe library.\n\n## Inputs\n\n### target_path\n\n${rootEntry}\n`,
        'utf-8',
      );
      writeFileSync(
        join(techniques, 'op.md'),
        '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n'
        + `## Inputs\n\n### target_path\n\n${leafEntry}\n\n## Protocol\n\n1. Do the thing.\n`,
        'utf-8',
      );
      return collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  it('flags a leaf that restates the required input its ancestor declares', () => {
    const findings = findingsFor('The path under work.', 'The path this op reads.');
    expect(findings.map((f) => f.check)).toEqual(['inherited-input-re-declared']);
  });

  it('passes a leaf that requires an input its ancestor marks optional', () => {
    expect(findingsFor('*(optional)* The path under work, where one is set.', 'The path this op reads.')).toEqual([]);
  });

  it('passes a leaf that marks optional an input its ancestor requires', () => {
    expect(findingsFor('The path under work.', '*(optional)* The path this op reads, where one is set.')).toEqual([]);
  });

  it('passes a leaf that declares a default of its own', () => {
    expect(findingsFor('The path under work.', 'The path this op reads.\n\n#### default\n\n`.`')).toEqual([]);
  });

  it('reads the optionality a leaf overrides from its nearest ancestor, the group', () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-inherited-group-'));
    try {
      writeLoadableWorkflowFixture(root, 'wf', ['act']);
      const techniques = join(root, 'wf', 'techniques');
      const group = join(techniques, 'grp');
      mkdirSync(group, { recursive: true });
      writeFileSync(join(techniques, 'TECHNIQUE.md'), '## Capability\n\nThe library.\n\n## Inputs\n\n### target_path\n\nThe path under work.\n', 'utf-8');
      writeFileSync(join(group, 'TECHNIQUE.md'), '## Capability\n\nThe group.\n\n## Inputs\n\n### target_path\n\n*(optional)* The path, where one is set.\n', 'utf-8');
      writeFileSync(
        join(group, 'op.md'),
        '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n'
        + '## Inputs\n\n### target_path\n\nThe path this op reads.\n\n## Protocol\n\n1. Do the thing.\n',
        'utf-8',
      );
      expect(collectFindings(root)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
