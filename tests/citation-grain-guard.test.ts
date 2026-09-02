import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collect } from '../scripts/check-citation-grain.js';
import { corpusRoot } from './corpus-root.js';

/**
 * citation-grain guard: the mechanical half of `whole-resource-for-one-section`.
 *
 * A citation is a delivery instruction, and the delivery ledger keys a resource payload by the
 * caller's exact id — anchor included. So one technique citing a resource bare and by anchor names
 * two payloads, and the sections arrive twice: once alone, once inside the file holding them.
 *
 * The fixtures pin both directions. The positive is the shape the corpus carried at two sites. The
 * negatives are the carve-outs the catalog entry states, each honoured structurally rather than by
 * verdict — so a fixture that stops passing means a carve-out silently narrowed, and a positive that
 * stops failing means the guard reports zero for a corpus it can no longer read.
 */
describe('citation-grain guard', () => {
  /** Write a one-workflow corpus and collect against it. */
  function findingsFor(files: Record<string, string>): ReturnType<typeof collect> {
    const root = mkdtempSync(join(tmpdir(), 'wf-citegrain-'));
    try {
      for (const [rel, body] of Object.entries(files)) {
        const path = join(root, 'wf', rel);
        mkdirSync(join(path, '..'), { recursive: true });
        writeFileSync(path, body);
      }
      return collect(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const header = '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n## Protocol\n\n';
  const rubric = '# Rubric\n\n## Checks\n\nCheck things.\n\n## Rules\n\nFollow them.\n';

  it('flags a bare citation the file anchors elsewhere', () => {
    const findings = findingsFor({
      'resources/rubric.md': rubric,
      'techniques/op.md':
        `${header}### 1. Validate\n\n- Validate per [rubric](../resources/rubric.md).\n\n`
        + '### 2. Record\n\n- Record per [rubric](../resources/rubric.md#rules).\n',
    });
    expect(findings.map((f) => f.check)).toEqual(['citation-grain']);
    expect(findings[0].site).toBe('wf/techniques/op.md');
    expect(findings[0].detail).toContain('rules');
  });

  it('names every anchor the pair delivers alongside the file', () => {
    const findings = findingsFor({
      'resources/rubric.md': rubric,
      'techniques/op.md':
        `${header}### 1. Validate\n\n- Per [rubric](../resources/rubric.md).\n\n`
        + '### 2. Check\n\n- Per [rubric](../resources/rubric.md#checks).\n\n'
        + '### 3. Apply\n\n- Per [rubric](../resources/rubric.md#rules).\n',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0].detail).toContain('checks, rules');
  });

  /**
   * The Detect pairs a bare citation with an anchor held ELSEWHERE in the file. Naming a criteria
   * home and, in the same breath, the entry within it being invoked is one instruction — whether it
   * over-delivers turns on whether the prose reads a single section, which is the reading half this
   * guard declines. A bullet is one line in this corpus, so the line is the unit.
   */
  it('passes a home and the entry within it named in one bullet', () => {
    expect(findingsFor({
      'resources/rubric.md': rubric,
      'techniques/op.md':
        `${header}### 1. Classify\n\n- Criteria homes: [rubric](../resources/rubric.md). `
        + 'Do not re-derive them here ([rubric](../resources/rubric.md#rules)).\n',
    })).toEqual([]);
  });

  it('passes a resource with one section, which offers no grain to choose', () => {
    expect(findingsFor({
      'resources/rubric.md': '# Rubric\n\n## Checks\n\nCheck things.\n',
      'techniques/op.md':
        `${header}### 1. Validate\n\n- Per [rubric](../resources/rubric.md).\n\n`
        + '### 2. Record\n\n- Per [rubric](../resources/rubric.md#checks).\n',
    })).toEqual([]);
  });

  it('passes a citation held one way only', () => {
    expect(findingsFor({
      'resources/rubric.md': rubric,
      'techniques/bare.md': `${header}### 1. Read\n\n- Per [rubric](../resources/rubric.md).\n`,
      'techniques/anchored.md':
        `${header}### 1. Read\n\n- Per [rubric](../resources/rubric.md#checks).\n\n`
        + '### 2. Apply\n\n- Per [rubric](../resources/rubric.md#rules).\n',
    })).toEqual([]);
  });

  /** A resource cross-referencing a sibling is the overview-prose carve-out, not a consultation. */
  it('passes a resource citing a sibling resource both ways', () => {
    expect(findingsFor({
      'resources/rubric.md': rubric,
      'resources/guide.md':
        '# Guide\n\nSee [rubric](./rubric.md).\n\n## Detail\n\nPer [rubric](./rubric.md#rules).\n',
    })).toEqual([]);
  });

  /** Composition between operations is what `technique-references-technique` owns, not delivery. */
  it('passes a technique citing a sibling operation both ways', () => {
    expect(findingsFor({
      'techniques/other.md': `${header}### 1. Act\n\n## Rules\n\n### a-rule\n\nHolds.\n`,
      'techniques/op.md':
        `${header}### 1. Read\n\n- Apply [other](./other.md).\n\n`
        + '### 2. Obey\n\n- Per [other](./other.md#rules).\n',
    })).toEqual([]);
  });

  it('holds the corpus clean', () => {
    expect(collect(corpusRoot())).toEqual([]);
  });
});
