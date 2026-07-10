import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { composeActivityTechnique } from '../src/loaders/technique-loader.js';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

/**
 * Borrowed cross-workflow activities resolve their technique refs against the workflow the
 * activity file was authored in — the technique-side counterpart of #166 B10 fragment scoping.
 * Before this fix, a borrowed activity's unqualified refs resolved [borrower → meta] and failed.
 */
describe('borrowed-activity technique resolution', () => {
  let fixtureDir: string;

  beforeAll(() => {
    fixtureDir = mkdtempSync(join(tmpdir(), 'borrowed-technique-resolution-'));

    // Source workflow: owns an activity file and the techniques it binds — a group named after
    // the activity (exercising activity-group shorthand) and a standalone op.
    const sourceDir = join(fixtureDir, 'source-wf');
    mkdirSync(join(sourceDir, 'activities'), { recursive: true });
    mkdirSync(join(sourceDir, 'techniques', 'shared-work'), { recursive: true });
    writeFileSync(join(sourceDir, 'workflow.yaml'), [
      'id: source-wf',
      'version: 1.0.0',
      'title: Source Workflow',
      'initialActivity: shared-work',
    ].join('\n'));
    writeFileSync(join(sourceDir, 'activities', '01-shared-work.yaml'), [
      'id: shared-work',
      'version: 1.0.0',
      'name: Shared Work',
      'steps:',
      '  - kind: technique',
      '    id: do-thing',
      '    technique: do-thing',
      '  - kind: technique',
      '    id: standalone-step',
      '    technique: standalone-op',
    ].join('\n'));
    writeFileSync(join(sourceDir, 'techniques', 'shared-work', 'TECHNIQUE.md'), [
      '---', 'metadata:', '  version: 1.0.0', '---', '',
      '## Capability', '', 'Group contract for shared-work ops.',
    ].join('\n'));
    writeFileSync(join(sourceDir, 'techniques', 'shared-work', 'do-thing.md'), [
      '---', 'metadata:', '  version: 1.0.0', '---', '',
      '## Capability', '', 'Does the thing.', '', '## Protocol', '', '1. Do it.',
    ].join('\n'));
    writeFileSync(join(sourceDir, 'techniques', 'standalone-op.md'), [
      '---', 'metadata:', '  version: 1.0.0', '---', '',
      '## Capability', '', 'Standalone operation.', '', '## Protocol', '', '1. Operate.',
    ].join('\n'));

    // Borrower: no techniques of its own; borrows the source workflow's activity by string ref.
    const borrowerDir = join(fixtureDir, 'borrower-wf');
    mkdirSync(join(borrowerDir, 'activities'), { recursive: true });
    writeFileSync(join(borrowerDir, 'workflow.yaml'), [
      'id: borrower-wf',
      'version: 1.0.0',
      'title: Borrower Workflow',
      'initialActivity: own-start',
      'activities:',
      '  - 01-own-start.yaml',
      '  - source-wf/01-shared-work.yaml',
    ].join('\n'));
    writeFileSync(join(borrowerDir, 'activities', '01-own-start.yaml'), [
      'id: own-start',
      'version: 1.0.0',
      'name: Own Start',
    ].join('\n'));
  });

  afterAll(() => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('loadWorkflowWithDiagnostics maps each activity to its source workflow', async () => {
    const result = await loadWorkflowWithDiagnostics(fixtureDir, 'borrower-wf');
    expect(result.success).toBe(true);
    if (!result.success) return;
    const sources = result.value.activitySourceWorkflow;
    expect(sources.get('own-start')).toBe('borrower-wf');
    expect(sources.get('shared-work')).toBe('source-wf');
  });

  it('resolves a borrowed activity-group shorthand ref under the source-workflow scope', async () => {
    const composed = await composeActivityTechnique('do-thing', fixtureDir, 'source-wf', 'shared-work');
    expect(composed.success).toBe(true);
    if (composed.success) expect(composed.value.techniqueId).toBe('shared-work::do-thing');

    // The pre-fix behavior: resolving under the borrower's scope fails — this is exactly the
    // gap the source-workflow threading closes.
    const underBorrower = await composeActivityTechnique('do-thing', fixtureDir, 'borrower-wf', 'shared-work');
    expect(underBorrower.success).toBe(false);
  });

  it('resolves a borrowed standalone ref under the source-workflow scope', async () => {
    const composed = await composeActivityTechnique('standalone-op', fixtureDir, 'source-wf', 'shared-work');
    expect(composed.success).toBe(true);
  });

  it('maps the real corpus: remediate-vuln borrows work-package activities', async () => {
    const result = await loadWorkflowWithDiagnostics(WORKFLOW_DIR, 'remediate-vuln');
    expect(result.success).toBe(true);
    if (!result.success) return;
    const sources = result.value.activitySourceWorkflow;
    expect(sources.get('start')).toBe('remediate-vuln');
    expect(sources.get('design-philosophy')).toBe('work-package');
    expect(sources.get('implement')).toBe('work-package');
    expect(sources.get('submit-for-review')).toBe('work-package');
  });
});
