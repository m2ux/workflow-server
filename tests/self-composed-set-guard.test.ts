import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectSelfComposedSetViolations } from '../scripts/check-self-composed-set.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Self-composed set guard (#477): a `set` action whose value is built out of the variable
 * it writes.
 *
 * `set { target: output_path, value: "{output_path}/{group.subdir}" }` descends one level
 * the first time and descends from where it already is the second, so the value compounds
 * and the directory the run started from is unreachable. In a loop that is every
 * iteration. The measured evaluation run declined to land the value, which is the only
 * reason its artifacts exist.
 *
 * Accumulator appends are the legitimate self-reference and the fixtures pin each shape,
 * because a guard that flagged them would not be run.
 */
describe('self-composed set guard', () => {
  /** Write a one-workflow corpus holding a single activity file and collect against it. */
  function violationsFor(activityYaml: string): ReturnType<typeof collectSelfComposedSetViolations> {
    const root = mkdtempSync(join(tmpdir(), 'wf-selfcompose-'));
    try {
      mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
      writeFileSync(join(root, 'wf', 'activities', '01-thing.yaml'), activityYaml);
      return collectSelfComposedSetViolations(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  /** An activity whose one action step sets `target` to `value`. */
  function activity(target: string, value: string): string {
    return `id: thing
version: 1.0.0
name: Thing
description: A thing.
steps:
  - kind: action
    id: stage
    actions:
      - action: set
        target: ${target}
        value: "${value}"
`;
  }

  it('flags a path composed from the variable it writes', () => {
    const v = violationsFor(activity('output_path', '{output_path}/{current_group.output_subdir}'));
    expect(v).toHaveLength(1);
    expect(v[0]!.site).toContain('01-thing.yaml[stage]');
    expect(v[0]!.detail).toContain("set 'output_path' composes its value from {output_path}");
  });

  it('flags a dotted read of its own target', () => {
    expect(violationsFor(activity('scope', '{scope.base}/nested'))).toHaveLength(1);
  });

  it('flags two interpolations concatenated with no separator', () => {
    expect(violationsFor(activity('prefix', '{prefix}{suffix}'))).toHaveLength(1);
  });

  it('passes a value that names a different variable', () => {
    expect(violationsFor(activity('output_path', '{evaluation_output_path}/{current_group.output_subdir}'))).toHaveLength(0);
  });

  it('passes the target restated on its own', () => {
    expect(violationsFor(activity('acc', '{acc}'))).toHaveLength(0);
  });

  it('passes an array literal appending to the target', () => {
    expect(violationsFor(activity('completed_analyses', '[{completed_analyses}, {current_result}]'))).toHaveLength(0);
  });

  it('passes an object literal holding the target', () => {
    expect(violationsFor(activity('ledger', '{ "prior": {ledger}, "next": {row} }'))).toHaveLength(0);
  });

  it('passes a set that reads nothing', () => {
    expect(violationsFor(activity('all_artifact_paths', '[]'))).toHaveLength(0);
  });

  it('reaches a set inside a loop body', () => {
    const v = violationsFor(`id: thing
version: 1.0.0
name: Thing
description: A thing.
steps:
  - kind: loop
    id: each
    name: Each
    loopType: forEach
    variable: current
    over: groups
    maxIterations: 10
    steps:
      - kind: action
        id: stage
        actions:
          - action: set
            target: output_path
            value: "{output_path}/{current.subdir}"
`);
    expect(v).toHaveLength(1);
  });

  it('the corpus is clean', () => {
    expect(collectSelfComposedSetViolations(corpusRoot())).toHaveLength(0);
  });
});
