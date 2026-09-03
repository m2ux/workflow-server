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
   * A Protocol takes either shape, and the flat numbered sequence is the majority of the corpus —
   * every `atlassian-operations`, `cargo-operations`, `gitnexus-operations` and
   * `knowledge-base-search` op is written that way. A caveat is reached under both.
   */
  it('flags a caveat under a flat numbered protocol', () => {
    const findings = findingsFor(
      `${header}1. Run the check, capturing its output as \`{diagnostics}\`.\n`
      + '   - If the run exceeds available memory, halve the job budget and retry.\n',
    );
    expect(findings.map(f => f.check)).toEqual(['qualifier-as-sub-bullet']);
    expect(findings[0].site).toMatch(/op\.md:\d+$/);
  });

  it('passes a flat numbered protocol whose caveat is a note', () => {
    expect(findingsFor(
      `${header}1. Run the check, capturing its output as \`{diagnostics}\`.\n`
      + '   > If the run exceeds available memory, halve the job budget and retry.\n',
    )).toEqual([]);
  });

  it('passes a selection ladder, which AP-59 keeps as a branch table', () => {
    expect(findingsFor(
      `${header}1. Select the template:\n`
      + '   - If `{is_review_mode}` is true → the review template\n'
      + '   - Else if `{variant}` is `initial` → the initial template\n'
      + '   - Else if `{variant}` is `final` → the final template\n',
    )).toEqual([]);
  });

  it('flags independent caveats that are not ladder arms', () => {
    expect(findingsFor(
      `${header}1. Append the section.\n`
      + '   - If the selection is absent, wait for it rather than appending.\n'
      + '   - If the log is missing, surface that before retrying.\n',
    )).toHaveLength(2);
  });

  /**
   * The corpus carries no caveat as a sub-bullet. Definitions and code sit on different branches, so
   * this reads whichever submodule pointer is checked out and turns over on the corpus merge that
   * converts the last of them; `WORKFLOWS_DIR` points it at a corpus worktree to verify ahead of
   * that. A ceiling would let the count sit wherever it landed, which is the state this guard exists
   * to end.
   */
  it('holds the corpus clean of caveats written as sub-bullets', () => {
    expect(collectFindings(corpusRoot())).toEqual([]);
  });
});
