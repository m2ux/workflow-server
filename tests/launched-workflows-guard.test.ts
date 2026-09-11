import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectLaunchedWorkflowViolations } from '../guards/check-launched-workflows.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * Launched-workflows guard (#656): an activity says it hands work to another workflow twice —
 * in its `triggers[]` declaration and in the step that dispatches — and the server acts on
 * neither, so only this guard holds the two together.
 *
 * The failure it prevents is a capability that is not there: a declaration whose launch never
 * happens, or a launch the definition never admits to. Both read as working composition.
 */
describe('launched workflows guard', () => {
  /**
   * Write a corpus holding a launcher activity plus a `prism` workflow to launch, and collect.
   * `operationBody` seeds `launcher/techniques/compose-launch.md`, the operation a step can bind
   * instead of the launch itself.
   */
  function violationsFor(activityYaml: string, operationBody = 'Nothing to see.'): ReturnType<typeof collectLaunchedWorkflowViolations> {
    const root = mkdtempSync(join(tmpdir(), 'wf-launched-'));
    try {
      mkdirSync(join(root, 'launcher', 'activities'), { recursive: true });
      mkdirSync(join(root, 'launcher', 'techniques'), { recursive: true });
      writeFileSync(join(root, 'launcher', 'workflow.yaml'), 'id: launcher\nversion: 1.0.0\n');
      writeFileSync(join(root, 'launcher', 'activities', '01-hand-off.yaml'), activityYaml);
      writeFileSync(join(root, 'launcher', 'techniques', 'compose-launch.md'), operationBody);
      mkdirSync(join(root, 'prism'), { recursive: true });
      writeFileSync(join(root, 'prism', 'workflow.yaml'), 'id: prism\nversion: 1.0.0\n');
      return collectLaunchedWorkflowViolations(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const DECLARATION = `triggers:
  - workflow: prism
    description: The analytical pipeline.
`;

  const LAUNCH_STEP = `  - kind: technique
    id: trigger-prism
    technique:
      name: workflow-engine::handle-sub-workflow
      inputs:
        workflow_id: prism
`;

  /** An activity with the given declaration block and step list. */
  function activity(declaration: string, steps: string): string {
    return `id: hand-off
version: 1.0.0
name: Hand Off
description: Hands analysis to another workflow.
${declaration}steps:
${steps}`;
  }

  it('accepts a declaration matched by a step that performs it', () => {
    expect(violationsFor(activity(DECLARATION, LAUNCH_STEP))).toHaveLength(0);
  });

  it('flags a declaration no step performs', () => {
    const v = violationsFor(activity(DECLARATION, `  - kind: technique
    id: analyse-inline
    technique: structural-analysis
`));
    expect(v).toHaveLength(1);
    expect(v[0]!.detail).toContain("declares a launch of 'prism' that nothing performs");
  });

  it('accepts a declaration performed by an operation a step binds', () => {
    // Composition, not a missing launch: the step's operation applies the launch itself.
    const v = violationsFor(activity(DECLARATION, `  - kind: technique
    id: launch-and-record
    technique: compose-launch
`), 'Apply [handle-sub-workflow](../../meta/techniques/workflow-engine/handle-sub-workflow.md) with `workflow_id: prism`.');
    expect(v).toHaveLength(0);
  });

  it('flags a launch the activity does not declare', () => {
    const v = violationsFor(activity('', LAUNCH_STEP));
    expect(v).toHaveLength(1);
    expect(v[0]!.site).toContain('01-hand-off.yaml[trigger-prism]');
    expect(v[0]!.detail).toContain('does not declare under triggers');
  });

  it('flags a launch that names no workflow', () => {
    const v = violationsFor(activity(DECLARATION, `  - kind: technique
    id: trigger-prism
    technique: workflow-engine::handle-sub-workflow
`));
    expect(v.map((x) => x.detail).join(' ')).toContain('without a workflow_id input');
  });

  it('flags a launch target the corpus holds no workflow for', () => {
    const v = violationsFor(activity(`triggers:
  - workflow: ghost
    description: A workflow nobody wrote.
`, `  - kind: technique
    id: trigger-ghost
    technique:
      name: workflow-engine::handle-sub-workflow
      inputs:
        workflow_id: ghost
`));
    expect(v.map((x) => x.detail).join(' ')).toContain('the corpus holds no workflow for');
  });

  it('finds a launch nested inside a loop', () => {
    const v = violationsFor(activity('', `  - kind: loop
    id: per-scope
    name: Per Scope
    loopType: forEach
    variable: current_scope
    over: scopes
    maxIterations: 10
    steps:
${LAUNCH_STEP.split('\n').map((l) => (l ? `  ${l}` : l)).join('\n')}`));
    expect(v).toHaveLength(1);
    expect(v[0]!.detail).toContain('does not declare under triggers');
  });

  it.skipIf(!liveCorpusRoot())('the corpus is clean', () => {
    expect(collectLaunchedWorkflowViolations(liveCorpusRoot()!)).toHaveLength(0);
  });
});
