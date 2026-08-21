import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-branch-as-step.js';
import { corpusRoot } from './corpus-root.js';

/**
 * branch-as-step guard: a conditional caveat in a technique Protocol is a `>` note, not an indented
 * sub-bullet the step regex reads as a peer step (AP-59 constraint-as-blockquote).
 *
 * The fixtures pin both directions, because this guard exists to answer the failure it was written
 * from: the class was fixed in one workflow and reintroduced into another a commit later, and a
 * checker that reported zero could not distinguish a clean corpus from a pattern that matched
 * nothing. A guard whose negative fixture stops failing is broken and has to say so.
 *
 * The positive fixture is the shape that regressed — mode branches of one instruction, indented
 * beneath it. The negative fixtures are the two carve-outs AP-59 keeps: the same branches written as
 * `>` notes, and a genuine enumeration, which is what most indentation in the corpus is for.
 */
describe('branch-as-step guard', () => {
  /** Write a one-workflow corpus holding a single technique and collect against it. */
  function findingsFor(technique: string): ReturnType<typeof collectFindings> {
    const root = mkdtempSync(join(tmpdir(), 'wf-branchstep-'));
    try {
      mkdirSync(join(root, 'wf', 'techniques'), { recursive: true });
      writeFileSync(join(root, 'wf', 'techniques', 'op.md'), technique);
      return collectFindings(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const header = '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nDoes a thing.\n\n## Protocol\n\n';

  it('flags mode branches indented under the instruction they qualify', () => {
    const findings = findingsFor(
      `${header}### 1. Choose the Rung\n\n- Let \`{intensity}\` govern how the code is built.\n`
      + '  - When `{intensity}` is lite, build what was asked.\n'
      + '  - When `{intensity}` is ultra, trim the requirement too.\n',
    );
    expect(findings.map(f => f.check)).toEqual(['qualifier-as-sub-bullet', 'qualifier-as-sub-bullet']);
    expect(findings[0].site).toMatch(/op\.md:\d+$/);
  });

  it('flags an indented fallback and an indented prohibition', () => {
    const findings = findingsFor(
      `${header}### 1. Write It\n\n- Write the file.\n`
      + '  - If the path is absent, report it instead.\n'
      + '  - Never overwrite an existing file.\n',
    );
    expect(findings).toHaveLength(2);
  });

  it('passes the same branches written as notes', () => {
    expect(findingsFor(
      `${header}### 1. Choose the Rung\n\n- Let \`{intensity}\` govern how the code is built.  \n`
      + '  > When `{intensity}` is lite, build what was asked.  \n'
      + '  > When `{intensity}` is ultra, trim the requirement too.\n',
    )).toEqual([]);
  });

  it('passes a genuine enumeration, which is the AP-59 carve-out', () => {
    expect(findingsFor(
      `${header}### 1. Run the Guards\n\n- Run each guard and record what it proves.\n`
      + '  - `check-refs.ts` — every reference resolves\n'
      + '  - `check-audience.ts` — every artifact declares an audience\n'
      + '  - `check-fragments.ts` — every fragment is used\n',
    )).toEqual([]);
  });

  it('ignores indentation outside a Protocol section', () => {
    expect(findingsFor(
      `${header}### 1. Write It\n\n- Write the file.\n\n## Rules\n\n### a-rule\n\n`
      + 'Applies always.\n  - If something, then otherwise.\n',
    )).toEqual([]);
  });

  it('ignores indentation inside a fenced block', () => {
    expect(findingsFor(
      `${header}### 1. Write It\n\n- Write the file in this shape:\n\n\`\`\`yaml\nsteps:\n`
      + '  - If: this is YAML, not a sub-bullet\n```\n',
    )).toEqual([]);
  });

  /**
   * The real corpus is not clean: eleven sites across eight workflows carry a conditional caveat as
   * a sub-bullet, all of them predating the guard. Landing it green needs those eleven converted to
   * notes — a corpus change, in the submodule, separate from this script. Pinned as a ceiling so the
   * count cannot grow unnoticed in the meantime.
   */
  it('holds the corpus at its known eleven sites', () => {
    const findings = collectFindings(corpusRoot());
    expect(findings.length).toBeLessThanOrEqual(11);
    expect(findings.every(f => f.check === 'qualifier-as-sub-bullet')).toBe(true);
  });
});
