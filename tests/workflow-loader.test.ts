import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  loadWorkflow,
  loadWorkflowWithDiagnostics,
  listWorkflows,
  listWorkflowsWithDiagnostics,
  getActivity,
  getCheckpoint,
  getExitBindings,
  exitDestinations,
  validateExitBindings,
  TERMINAL_SENTINEL,
  checkpointBaseId,
} from '../src/loaders/workflow-loader.js';
import type { Workflow } from '../src/schema/workflow.schema.js';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { corpusRoot } from './corpus-root.js';

const WORKFLOW_DIR = corpusRoot();

async function loadMetaWorkflow(): Promise<Workflow> {
  const result = await loadWorkflow(WORKFLOW_DIR, 'meta');
  if (!result.success) throw new Error(`Failed to load meta workflow: ${result.error.message}`);
  return result.value;
}

describe('workflow-loader', () => {
  describe('loadWorkflow', () => {
    it('should load the meta workflow successfully', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'meta');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('meta');
        expect(result.value.version).toBeDefined();
        expect(result.value.title).toBe('Meta Workflow');
        expect(result.value.activities.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should return WorkflowNotFoundError for non-existent workflow', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'does-not-exist');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('WorkflowNotFoundError');
      }
    });

    it('should load activities from the activities subdirectory', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'meta');

      expect(result.success).toBe(true);
      if (result.success) {
        const ids = result.value.activities.map(a => a.id);
        expect(ids).toContain('discover-session');
        expect(ids).toContain('initialize-session');
        expect(ids).toContain('resolve-target');
        expect(ids).toContain('dispatch-client-workflow');
        expect(ids).toContain('end-workflow');
      }
    });
  });

  describe('listWorkflows', () => {
    it('should list available workflows with manifest data', async () => {
      const manifests = await listWorkflows(WORKFLOW_DIR);

      expect(manifests.length).toBeGreaterThanOrEqual(2);
      const ids = manifests.map(m => m.id);
      expect(ids).toContain('work-package');
      expect(ids).not.toContain('meta');
    });

    it('should include id, title, and version in each manifest entry', async () => {
      const manifests = await listWorkflows(WORKFLOW_DIR);
      for (const m of manifests) {
        expect(m.id).toBeDefined();
        expect(m.title).toBeDefined();
        expect(m.version).toBeDefined();
      }
    });

    it('should return empty array for non-existent directory', async () => {
      const result = await listWorkflows('/tmp/no-such-workflow-dir-xyz');
      expect(result).toEqual([]);
    });
  });

  describe('load diagnostics (#166 B5)', () => {
    let fixtureDir: string;

    const VALID_ACTIVITY = [
      'id: good-activity',
      'version: 1.0.0',
      'name: Good Activity',
    ].join('\n');

    beforeAll(() => {
      fixtureDir = mkdtempSync(join(tmpdir(), 'workflow-loader-diagnostics-'));

      // Workflow whose activities dir holds one valid, one schema-invalid, and one unparsable file.
      const brokenActivitiesDir = join(fixtureDir, 'broken-activities-wf', 'activities');
      mkdirSync(brokenActivitiesDir, { recursive: true });
      writeFileSync(join(fixtureDir, 'broken-activities-wf', 'workflow.yaml'), [
        'id: broken-activities-wf',
        'version: 1.0.0',
        'title: Broken Activities Workflow',
        'initialActivity: good-activity',
      ].join('\n'));
      writeFileSync(join(brokenActivitiesDir, '01-good-activity.yaml'), VALID_ACTIVITY);
      writeFileSync(join(brokenActivitiesDir, '02-invalid-activity.yaml'), 'id: invalid-activity\n');
      writeFileSync(join(brokenActivitiesDir, '03-unparsable-activity.yaml'), 'id: [unclosed\n  nonsense: {');

      // Workflow whose definition file is unparsable YAML.
      mkdirSync(join(fixtureDir, 'unparsable-wf'));
      writeFileSync(join(fixtureDir, 'unparsable-wf', 'workflow.yaml'), 'id: [unclosed\n  nonsense: {');

      // Workflow whose manifest lacks the required title/version fields.
      mkdirSync(join(fixtureDir, 'missing-fields-wf'));
      writeFileSync(join(fixtureDir, 'missing-fields-wf', 'workflow.yaml'), 'id: missing-fields-wf\n');
    });

    afterAll(() => {
      rmSync(fixtureDir, { recursive: true, force: true });
    });

    it('loadWorkflowWithDiagnostics reports schema-invalid and unparsable activity files', async () => {
      const result = await loadWorkflowWithDiagnostics(fixtureDir, 'broken-activities-wf');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workflow.activities?.map(a => a.id)).toEqual(['good-activity']);

        const errors = result.value.activityLoadErrors;
        expect(errors).toHaveLength(2);

        const invalid = errors.find(e => e.file === '02-invalid-activity.yaml');
        expect(invalid?.activity_id).toBe('invalid-activity');
        expect(invalid?.error).toContain('version');

        const unparsable = errors.find(e => e.file === '03-unparsable-activity.yaml');
        expect(unparsable?.activity_id).toBe('unparsable-activity');
        expect(unparsable?.error).toBeTruthy();
      }
    });

    it('loadWorkflowWithDiagnostics returns no errors for a clean workflow', async () => {
      const result = await loadWorkflowWithDiagnostics(WORKFLOW_DIR, 'meta');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.activityLoadErrors).toEqual([]);
      }
    });

    it('loadWorkflow keeps its workflow-only contract', async () => {
      const result = await loadWorkflow(fixtureDir, 'broken-activities-wf');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe('broken-activities-wf');
      }
    });

    it('listWorkflowsWithDiagnostics reports unparsable and incomplete manifests', async () => {
      const { workflows, errors } = await listWorkflowsWithDiagnostics(fixtureDir);

      expect(workflows.map(w => w.id)).toEqual(['broken-activities-wf']);
      expect(errors).toHaveLength(2);

      const unparsable = errors.find(e => e.file.includes('unparsable-wf'));
      expect(unparsable?.error).toBeTruthy();

      const missingFields = errors.find(e => e.file.includes('missing-fields-wf'));
      expect(missingFields?.error).toContain('missing required fields');
    });

    it('listWorkflows still returns a plain manifest array', async () => {
      const manifests = await listWorkflows(fixtureDir);
      expect(Array.isArray(manifests)).toBe(true);
      expect(manifests.map(m => m.id)).toEqual(['broken-activities-wf']);
    });
  });

  describe('getActivity', () => {
    it('should find an activity by ID within a loaded workflow', async () => {
      const workflow = await loadMetaWorkflow();
      console.log('META ACTIVITIES:', workflow.activities.map(a => a.id));
      const activity = getActivity(workflow, 'discover-session');

      expect(activity).toBeDefined();
      expect(activity?.id).toBe('discover-session');
    });

    it('should return undefined for a non-existent activity ID', async () => {
      const workflow = await loadMetaWorkflow();
      expect(getActivity(workflow, 'no-such-activity')).toBeUndefined();
    });
  });

  describe('getCheckpoint', () => {
    it('should find a checkpoint within an activity', async () => {
      const workflow = await loadMetaWorkflow();
      const checkpoint = getCheckpoint(workflow, 'discover-session', 'resume-session');

      expect(checkpoint).toBeDefined();
      expect(checkpoint?.id).toBe('resume-session');
      expect(checkpoint?.name).toBeDefined();
      expect(checkpoint?.message).toBeDefined();
      expect(checkpoint?.options.length).toBeGreaterThanOrEqual(2);
    });

    it('should return undefined for a non-existent checkpoint', async () => {
      const workflow = await loadMetaWorkflow();
      expect(getCheckpoint(workflow, 'discover-session', 'no-such-checkpoint')).toBeUndefined();
    });
  });

  // Loop-body checkpoint instance ids (issue #160 follow-up #2): a checkpoint inside a forEach
  // loop is defined once but reached N times. Yielding it as `<baseId>#<instance>` gives each
  // iteration a distinct id (and thus a distinct `<activity>-<checkpoint>` response key, so
  // iterations 2..N no longer replay iteration 1's response) while resolving to the one definition.
  describe('getCheckpoint — loop-body instance ids', () => {
    // Minimal fixture: a requirements-refinement-shaped activity whose assumption-interview loop
    // holds one templated-id checkpoint, mirroring the workflows-side 03 edit.
    const wf = {
      id: 'wd', version: '1.0.0', title: 'WD',
      activities: [{
        id: 'requirements-refinement', version: '1.0.0', name: 'RR',
        steps: [{
          kind: 'loop', id: 'assumption-interview-loop', loopType: 'forEach',
          variable: 'current_assumption', over: 'open_assumptions',
          steps: [{
            kind: 'checkpoint', id: 'assumption-decision#{current_assumption.id}',
            message: 'Assumption {current_assumption.id}: decide.',
            options: [{ id: 'accept', label: 'Accept' }, { id: 'reject', label: 'Reject' }],
          }],
        }],
      }],
    } as unknown as Workflow;

    it('checkpointBaseId strips the per-iteration instance discriminator', () => {
      expect(checkpointBaseId('assumption-decision#RE-1')).toBe('assumption-decision');
      expect(checkpointBaseId('assumption-decision#{current_assumption.id}')).toBe('assumption-decision');
      expect(checkpointBaseId('enforcement-confirmed')).toBe('enforcement-confirmed');
    });

    it('resolves an instance-qualified id to the single base definition', () => {
      const c1 = getCheckpoint(wf, 'requirements-refinement', 'assumption-decision#RE-1');
      const c2 = getCheckpoint(wf, 'requirements-refinement', 'assumption-decision#RE-2');
      expect(c1?.id).toBe('assumption-decision#{current_assumption.id}');
      expect(c2?.id).toBe(c1?.id); // both instances share one definition
      expect(c1?.options.map(o => o.id)).toEqual(['accept', 'reject']);
    });

    it('matches the definition on its base id even when queried with the bare base', () => {
      expect(getCheckpoint(wf, 'requirements-refinement', 'assumption-decision')?.id)
        .toBe('assumption-decision#{current_assumption.id}');
    });

    it('does not resolve an instance id whose base has no definition', () => {
      expect(getCheckpoint(wf, 'requirements-refinement', 'no-such#RE-1')).toBeUndefined();
    });

    it('still resolves a plain non-loop checkpoint by exact id (no regression)', async () => {
      const workflow = await loadMetaWorkflow();
      expect(getCheckpoint(workflow, 'discover-session', 'resume-session')?.id).toBe('resume-session');
    });
  });

  describe('getExitBindings', () => {
    it('pairs each declared exit with the destination the workflow binds it to', async () => {
      const workflow = await loadMetaWorkflow();
      const bindings = getExitBindings(workflow, 'discover-session');

      expect(bindings.map(b => b.exit)).toContain('done');
      expect(bindings.find(b => b.exit === 'done')?.to).toBe('initialize-session');
    });

    it('carries the predicate and the default flag from the activity', async () => {
      const workflow = await loadMetaWorkflow();

      const conditional = getExitBindings(workflow, 'dispatch-client-workflow')
        .find(b => b.to === 'end-workflow');
      expect(conditional?.when).toBeDefined();

      expect(getExitBindings(workflow, 'discover-session').find(b => b.isDefault)).toBeDefined();
    });

    it('carries an exit a checkpoint option selects, and its immediate flag', async () => {
      const workflow = await loadMetaWorkflow();
      const abort = getExitBindings(workflow, 'discover-session').find(b => b.exit === 'abort-binding');

      expect(abort?.to).toBe('end-workflow');
      expect(abort?.immediate).toBe(true);
      expect(abort?.when).toBeUndefined();
    });

    it('returns nothing for an activity the workflow does not contain', async () => {
      const workflow = await loadMetaWorkflow();
      expect(getExitBindings(workflow, 'no-such-activity')).toEqual([]);
    });
  });

  describe('exitDestinations', () => {
    it('lists the activities an activity can reach, deduped', async () => {
      const workflow = await loadMetaWorkflow();
      const targets = exitDestinations(workflow, 'discover-session');

      expect(targets).toContain('initialize-session');
      expect(targets.length).toBe([...new Set(targets)].length);
    });

    it('reaches an activity only a checkpoint option routes to', async () => {
      const wpResult = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      expect(wpResult.success).toBe(true);
      if (!wpResult.success) return;

      expect(exitDestinations(wpResult.value, 'submit-for-review')).toContain('complete');
    });

    it('returns empty for an activity the workflow does not contain', async () => {
      const workflow = await loadMetaWorkflow();
      expect(exitDestinations(workflow, 'no-such-activity')).toEqual([]);
    });
  });

  describe('validateExitBindings', () => {
    const activity = (exits: unknown) => ({
      id: 'thing', version: '1.0.0', name: 'Thing', required: true, exits,
    });
    const wf = (graph: unknown, exits: unknown) => ({
      id: 'wf', version: '1.0.0', title: 'WF', graph, activities: [activity(exits)],
    } as unknown as Workflow);
    const known = new Set(['thing', 'next', 'other']);

    it('accepts a graph that binds every exit to an activity it contains', () => {
      expect(validateExitBindings(wf({ thing: { done: 'next' } }, [{ id: 'done' }]), known)).toEqual([]);
    });

    it('accepts the terminal sentinel as a destination', () => {
      expect(validateExitBindings(wf({ thing: { done: TERMINAL_SENTINEL } }, [{ id: 'done' }]), known)).toEqual([]);
    });

    it('reports an exit the graph leaves unbound', () => {
      const errors = validateExitBindings(wf({ thing: { done: 'next' } }, [{ id: 'done' }, { id: 'escalate', isDefault: true }]), known);
      expect(errors.join(' ')).toContain("exit 'escalate' is unbound");
    });

    it('reports a binding naming an exit the activity does not declare', () => {
      const errors = validateExitBindings(wf({ thing: { done: 'next', ghost: 'other' } }, [{ id: 'done' }]), known);
      expect(errors.join(' ')).toContain("'thing.ghost', which that activity does not declare");
    });

    it('reports a destination the workflow does not contain', () => {
      const errors = validateExitBindings(wf({ thing: { done: 'elsewhere' } }, [{ id: 'done' }]), known);
      expect(errors.join(' ')).toContain("to 'elsewhere', which this workflow does not contain");
    });

    it('reports an activity the workflow does not contain', () => {
      const errors = validateExitBindings(wf({ thing: { done: 'next' }, ghost: { done: 'next' } }, [{ id: 'done' }]), new Set(['thing', 'next']));
      expect(errors.join(' ')).toContain("binds activity 'ghost'");
    });

    it('requires exactly one default once an activity has more than one exit', () => {
      const graph = { thing: { done: 'next', escalate: 'other' } };
      expect(validateExitBindings(wf(graph, [{ id: 'done' }, { id: 'escalate' }]), known).join(' '))
        .toContain('exactly one must be isDefault');
      expect(validateExitBindings(wf(graph, [{ id: 'done', isDefault: true }, { id: 'escalate', isDefault: true }]), known).join(' '))
        .toContain('exactly one must be isDefault');
      expect(validateExitBindings(wf(graph, [{ id: 'done', isDefault: true }, { id: 'escalate' }]), known)).toEqual([]);
    });

    it('reports a checkpoint option selecting an exit the activity does not declare', () => {
      const workflow = {
        id: 'wf', version: '1.0.0', title: 'WF',
        graph: { thing: { done: 'next' } },
        activities: [{
          ...activity([{ id: 'done' }]),
          steps: [{ kind: 'checkpoint', id: 'ask', message: 'Which?', options: [{ id: 'go', label: 'Go', effect: { exit: 'ghost' } }] }],
        }],
      } as unknown as Workflow;
      expect(validateExitBindings(workflow, known).join(' ')).toContain("selects exit 'ghost'");
    });

    it('lets two workflows run one activity in different orders', () => {
      const borrowed = activity([{ id: 'reviewed', isDefault: true }, { id: 'rejected' }]);
      const first = { id: 'a', version: '1.0.0', title: 'A', graph: { thing: { reviewed: 'next', rejected: 'other' } }, activities: [borrowed] } as unknown as Workflow;
      const second = { id: 'b', version: '1.0.0', title: 'B', graph: { thing: { reviewed: 'other', rejected: 'next' } }, activities: [borrowed] } as unknown as Workflow;

      expect(validateExitBindings(first, known)).toEqual([]);
      expect(validateExitBindings(second, known)).toEqual([]);
      expect(exitDestinations(first, 'thing')).toEqual(['next', 'other']);
      expect(exitDestinations(second, 'thing')).toEqual(['other', 'next']);
    });
  });
});
