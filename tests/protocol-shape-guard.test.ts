import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { declareFixtureWorkflows, writeWorkflowFixture } from './corpus-fixture.js';
import { collectFindings } from '../guards/check-protocol-shape.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * protocol-shape guard: a phase of a protocol is named in a heading, so it can be cited and linked
 * to. The corpus carries both shapes and this guard is what makes the unnamed ones a number rather
 * than an impression, which is why the count is asserted here rather than left to a reader.
 */
describe('protocol-shape guard', () => {
  function findingsFor(technique: string): ReturnType<typeof collectFindings> {
    const root = mkdtempSync(join(tmpdir(), 'wf-protoshape-'));
    try {
      mkdirSync(join(root, 'wf', 'techniques'), { recursive: true });
      writeFileSync(join(root, 'wf', 'techniques', 'op.md'), technique);
      return collectFindings(declareFixtureWorkflows(root));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const header = '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n## Protocol\n\n';

  it('passes a protocol whose every phase is named in a heading', () => {
    expect(findingsFor(
      `${header}### 1. Read the Input\n\n1. Read it.\n\n### 2. Write the Output\n\n1. Write it.\n`,
    )).toEqual([]);
  });

  it('reports a protocol written as a flat numbered list', () => {
    const findings = findingsFor(`${header}1. Read it.\n2. Write it.\n`);
    expect(findings.map((f) => f.check)).toEqual(['protocol-phase-unnamed']);
    expect(findings[0]!.site).toMatch(/op\.md:\d+$/);
    expect(findings[0]!.detail).toContain('2 numbered items');
  });

  /**
   * The shape that reads as though only some phases were worth naming: numbered items outside any
   * heading, beside headings that name their own.
   */
  it('reports a file carrying both shapes, and says so distinctly', () => {
    const findings = findingsFor(
      `${header}1. Read it first.\n\n### 1. Write the Output\n\n1. Write it.\n`,
    );
    expect(findings.map((f) => f.check)).toEqual(['protocol-shape-mixed']);
    expect(findings[0]!.detail).toContain('1 phase in a heading');
  });

  it('ignores a numbered list outside the Protocol section', () => {
    expect(findingsFor(
      `${header}### 1. Read the Input\n\n1. Read it.\n\n## Rules\n\n1. Always read first.\n`,
    )).toEqual([]);
  });

  /** A template showing a numbered protocol is illustration rather than one. */
  it('ignores a numbered list inside a fenced block', () => {
    expect(findingsFor(
      `${header}### 1. Read the Input\n\n1. Read it in this shape:\n\n\`\`\`markdown\n## Protocol\n\n`
      + '1. A step of the template.\n```\n',
    )).toEqual([]);
  });

  /**
   * A technique with no `## Protocol` has no phases to name, so it is out of scope rather than
   * compliant. It is written beside one that does carry a protocol, because the guard refuses a
   * corpus it found nothing to measure in — a clean result over nothing read is not a pass.
   */
  it('ignores a technique carrying no Protocol at all', () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-protoshape-none-'));
    try {
      mkdirSync(join(root, 'wf', 'techniques'), { recursive: true });
      writeFileSync(
        join(root, 'wf', 'techniques', 'no-protocol.md'),
        '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n## Outputs\n\n### a_value\n\nIt.\n',
      );
      writeFileSync(
        join(root, 'wf', 'techniques', 'op.md'),
        `${header}### 1. Read the Input\n\n1. Read it.\n`,
      );
      expect(collectFindings(declareFixtureWorkflows(root))).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  /**
   * A protocol is a protocol wherever it is written. A library declares no workflow, so a sweep
   * enumerating workflows would reach none of one's techniques and report the clean it would report
   * having read them.
   */
  it('reaches a technique in a library, which declares no workflow', () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-protoshape-lib-'));
    try {
      writeWorkflowFixture(root, 'wf');
      mkdirSync(join(root, 'support', 'lib', 'techniques'), { recursive: true });
      writeFileSync(join(root, 'support', 'lib', 'techniques', 'op.md'), `${header}1. Read it.\n`);
      expect(collectFindings(root).some((f) => f.site.includes('lib'))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  /**
   * The population this guard exists to make visible. It is asserted rather than described, so the
   * number moves in a commit that says it moved — the whole argument for measuring before deciding
   * whether the remainder is converted or recorded as accepted debt.
   */
  it.skipIf(!liveCorpusRoot())('holds the corpus at its measured population', () => {
    const findings = collectFindings(liveCorpusRoot()!);
    expect(findings).toHaveLength(95);
    expect(findings.filter((f) => f.check === 'protocol-shape-mixed')).toEqual([]);
  });
});
