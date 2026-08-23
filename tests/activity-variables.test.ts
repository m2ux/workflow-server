import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  activityGraph,
  mergeActivityVariables,
  unreachableReads,
  type ActivityGraph,
} from '../src/utils/activity-variables.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { collectFindings } from '../scripts/check-activity-variables.js';
import type { Workflow } from '../src/schema/workflow.schema.js';

/**
 * Activity variable contracts (#493): an activity declares what it reads and what it writes, and
 * including it contributes those declarations to the workflow running it.
 */
describe('variable contribution', () => {
  const declaration = (name: string, extra: Record<string, unknown> = {}) => ({
    name, type: 'boolean' as const, required: false, ...extra,
  });

  it('contributes an activity write to the workflow variable set', () => {
    const merged = mergeActivityVariables(
      [declaration('session_started')],
      [{ id: 'act', variables: { writes: [declaration('plan_approved')] } }],
    );
    expect(merged.variables.map((v) => v.name)).toEqual(['session_started', 'plan_approved']);
    expect(merged.contradictions).toEqual([]);
  });

  it('treats one name declared by two activities as one variable', () => {
    const merged = mergeActivityVariables(undefined, [
      { id: 'first', variables: { writes: [declaration('plan_approved', { defaultValue: false })] } },
      { id: 'second', variables: { writes: [declaration('plan_approved', { defaultValue: false })] } },
    ]);
    expect(merged.variables).toHaveLength(1);
    expect(merged.sources.get('plan_approved')).toEqual(['first', 'second']);
    expect(merged.contradictions).toEqual([]);
  });

  it('names the disagreement when two declarations of one name differ on type', () => {
    const merged = mergeActivityVariables(undefined, [
      { id: 'first', variables: { writes: [declaration('plan_approved')] } },
      { id: 'second', variables: { writes: [{ name: 'plan_approved', type: 'string' as const, required: false }] } },
    ]);
    expect(merged.contradictions).toHaveLength(1);
    expect(merged.contradictions[0]!.detail).toBe("'plan_approved': first and second declared 'boolean' and 'string'");
  });

  it('names the disagreement when two declarations of one name differ on default', () => {
    const merged = mergeActivityVariables(
      [declaration('plan_approved', { defaultValue: false })],
      [{ id: 'act', variables: { writes: [declaration('plan_approved', { defaultValue: true })] } }],
    );
    expect(merged.contradictions).toHaveLength(1);
    expect(merged.contradictions[0]!.detail).toBe("'plan_approved': workflow.yaml and act defaults false and true");
  });

  /** A two-file corpus: the workflow, and one activity declaring `writes`. */
  function corpusWith(activityVariables: string, workflowVariables = ''): string {
    const root = mkdtempSync(join(tmpdir(), 'wf-avars-'));
    mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
    writeFileSync(
      join(root, 'wf', 'workflow.yaml'),
      `id: wf\nversion: 1.0.0\ntitle: WF\ninitialActivity: thing\n${workflowVariables}`,
    );
    writeFileSync(
      join(root, 'wf', 'activities', '01-thing.yaml'),
      `id: thing\nversion: 1.0.0\nname: Thing\nvariables:\n${activityVariables}`,
    );
    return root;
  }

  it('folds the contribution into the loaded workflow, without a registration step', async () => {
    const root = corpusWith('  writes:\n    - name: plan_approved\n      type: boolean\n');
    try {
      const loaded = await loadWorkflow(root, 'wf');
      expect(loaded.success).toBe(true);
      expect(loaded.success && loaded.value.variables?.map((v) => v.name)).toEqual(['plan_approved']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('refuses to load a workflow whose declarations contradict', async () => {
    const root = corpusWith(
      '  writes:\n    - name: plan_approved\n      type: string\n',
      'variables:\n  - name: plan_approved\n    type: boolean\n',
    );
    try {
      const loaded = await loadWorkflow(root, 'wf');
      expect(loaded.success).toBe(false);
      expect(loaded.success ? '' : loaded.error.message).toContain("workflow.yaml and thing declared 'boolean' and 'string'");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('read reachability', () => {
  const graphOf = (edges: Record<string, string[]>): ActivityGraph => new Map(Object.entries(edges));
  const setsOf = (entries: Record<string, string[]>): Map<string, Set<string>> =>
    new Map(Object.entries(entries).map(([id, names]) => [id, new Set(names)]));

  const args = (over: Partial<Parameters<typeof unreachableReads>[0]>) => ({
    graph: graphOf({ start: ['middle'], middle: ['end'], end: [] }),
    initialActivity: 'start',
    availableAtEntry: new Set<string>(),
    reads: setsOf({}),
    routingReads: setsOf({}),
    writes: setsOf({}),
    policy: new Set<string>(),
    ...over,
  });

  it('reports a read whose write is on no path before it', () => {
    const found = unreachableReads(args({
      reads: setsOf({ middle: ['plan_path'] }),
      writes: setsOf({ end: ['plan_path'] }),
    }));
    expect(found).toEqual([{ activityId: 'middle', name: 'plan_path', kind: 'entry' }]);
  });

  it('accepts a read every path writes first', () => {
    expect(unreachableReads(args({
      reads: setsOf({ end: ['plan_path'] }),
      writes: setsOf({ start: ['plan_path'] }),
    }))).toEqual([]);
  });

  it('accepts a read the session already holds at entry', () => {
    expect(unreachableReads(args({
      availableAtEntry: new Set(['target_path']),
      reads: setsOf({ start: ['target_path'] }),
    }))).toEqual([]);
  });

  it('reports a branch chosen on a value no activity in its cycle writes', () => {
    // classify writes the flag once; the cycle back through `stage` can never clear it, so the
    // route that tests the other value is unreachable on a second visit (#491 finding 2).
    const found = unreachableReads({
      graph: graphOf({ start: ['classify'], classify: ['gate'], gate: ['stage'], stage: ['gate'] }),
      initialActivity: 'start',
      availableAtEntry: new Set<string>(),
      reads: setsOf({ gate: ['needs_stage'] }),
      routingReads: setsOf({ gate: ['needs_stage'] }),
      writes: setsOf({ classify: ['needs_stage'] }),
      policy: new Set<string>(),
    });
    expect(found).toEqual([{ activityId: 'gate', name: 'needs_stage', kind: 're-entry' }]);
  });

  it('accepts a branch on run policy, which a return visit does not change', () => {
    expect(unreachableReads({
      graph: graphOf({ start: ['classify'], classify: ['gate'], gate: ['stage'], stage: ['gate'] }),
      initialActivity: 'start',
      availableAtEntry: new Set(['is_review_mode']),
      reads: setsOf({ gate: ['is_review_mode'] }),
      routingReads: setsOf({ gate: ['is_review_mode'] }),
      writes: setsOf({ classify: ['is_review_mode'] }),
      policy: new Set(['is_review_mode']),
    })).toEqual([]);
  });

  it('reads every route out of an activity into the graph', () => {
    const workflow = {
      id: 'wf', version: '1.0.0', title: 'WF',
      activities: [{
        id: 'thing', version: '1.0.0', name: 'Thing', required: true,
        transitions: [{ to: 'next', isDefault: true }],
        decisions: [{ id: 'd', name: 'D', branches: [
          { id: 'a', label: 'A', transitionTo: 'branch-target', isDefault: false },
          { id: 'b', label: 'B', isDefault: true },
        ] }],
        steps: [{
          kind: 'checkpoint' as const, id: 'ask', message: 'Which?',
          options: [{ id: 'go', label: 'Go', effect: { transitionTo: 'checkpoint-target' } }],
        }],
      }],
    } as unknown as Workflow;
    expect(activityGraph(workflow).get('thing')).toEqual(['next', 'branch-target', 'checkpoint-target']);
  });
});

describe('activity-variables guard', () => {

  it('counts an optional operation input as a consumer of the value that reaches it', async () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-avars-optional-'));
    try {
      mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
      mkdirSync(join(root, 'wf', 'techniques'), { recursive: true });
      writeFileSync(join(root, 'wf', 'workflow.yaml'),
        'id: wf\nversion: 1.0.0\ntitle: WF\ninitialActivity: thing\n');
      // The operation derives the value when it is unset, so the workflow need not supply it — but
      // the checkpoint's write does reach it.
      writeFileSync(join(root, 'wf', 'techniques', 'post.md'),
        '---\nmetadata:\n  version: 1.0.0\n---\n\n## Capability\n\nPost it.\n\n'
        + '## Inputs\n\n### review_type\n\n*(optional, default: derived)* Which event to post.\n');
      writeFileSync(join(root, 'wf', 'activities', '01-thing.yaml'),
        'id: thing\nversion: 1.0.0\nname: Thing\nvariables:\n'
        + '  writes:\n    - name: review_type\n      type: string\n      defaultValue: ""\n'
        + 'steps:\n  - kind: checkpoint\n    id: pick\n    message: Which event?\n'
        + '    options:\n      - id: approve\n        label: Approve\n'
        + '        effect:\n          setVariable:\n            review_type: approve\n'
        + '  - kind: technique\n    id: post\n    technique: post\n');
      expect(await collectFindings(root)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports a read the including workflow supplies nowhere', async () => {
    const root = mkdtempSync(join(tmpdir(), 'wf-avars-borrow-'));
    try {
      // `borrower` runs an activity `library` authored, which needs a value only `library` declares.
      mkdirSync(join(root, 'library', 'activities'), { recursive: true });
      mkdirSync(join(root, 'borrower', 'activities'), { recursive: true });
      writeFileSync(join(root, 'library', 'workflow.yaml'),
        'id: library\nversion: 1.0.0\ntitle: Library\ninitialActivity: shared\n'
        + 'variables:\n  - name: target_path\n    type: string\nactivities:\n  - 01-shared.yaml\n');
      writeFileSync(join(root, 'library', 'activities', '01-shared.yaml'),
        'id: shared\nversion: 1.0.0\nname: Shared\nvariables:\n  reads:\n    - target_path\n'
        + 'steps:\n  - kind: action\n    id: work\n    when: target_path != ""\n');
      writeFileSync(join(root, 'borrower', 'workflow.yaml'),
        'id: borrower\nversion: 1.0.0\ntitle: Borrower\ninitialActivity: shared\n'
        + 'activities:\n  - library/01-shared.yaml\n');
      const findings = await collectFindings(root);
      // The borrower supplies it nowhere, and the walk confirms no path reaches the read with a
      // value; the workflow that authored the activity declares it and is clean.
      expect(findings.filter((f) => f.site.startsWith('borrower'))).toEqual([
        {
          check: 'unwritten-read',
          site: 'borrower :: library/shared',
          detail: "reads 'target_path', which no activity in this workflow writes and the workflow file does not own",
        },
        {
          check: 'unreachable-read',
          site: 'borrower :: library/shared',
          detail: "reads 'target_path' on a path that reaches it before anything writes it",
        },
      ]);
      expect(findings.filter((f) => f.site.startsWith('library'))).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
