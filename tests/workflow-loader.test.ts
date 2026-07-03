import { describe, it, expect } from 'vitest';
import {
  loadWorkflow,
  listWorkflows,
  getActivity,
  getCheckpoint,
  getValidTransitions,
  getTransitionList,
  checkpointBaseId,
} from '../src/loaders/workflow-loader.js';
import type { Workflow } from '../src/schema/workflow.schema.js';
import { resolve } from 'node:path';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

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

  describe('getTransitionList (BF-12)', () => {
    it('should return transitions from the transitions array', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'discover-session');

      const targets = transitions.map(t => t.to);
      // discover-session has transition to initialize-session
      expect(targets).toContain('initialize-session');
    });

    it('should include targets from decisions branches', async () => {
      // work-package/post-impl-review has a decision (blocker-gate) that branches to 'implement'
      const wpResult = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      if (wpResult.success) {
        const wpWorkflow = wpResult.value;
        const transitions = getTransitionList(wpWorkflow, 'post-impl-review');
        
        const targets = transitions.map(t => t.to);
        // post-impl-review has a decision that branches to implement
        expect(targets).toContain('implement');
      }
    });

    it('should deduplicate targets via the seen Set', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'discover-session');

      const targets = transitions.map(t => t.to);
      const uniqueTargets = [...new Set(targets)];
      expect(targets.length).toBe(uniqueTargets.length);
    });

    it('should include condition strings for conditional transitions', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'dispatch-client-workflow');

      const conditionalTransition = transitions.find(t => t.to === 'end-workflow');
      expect(conditionalTransition).toBeDefined();
      expect(conditionalTransition?.condition).toBeDefined();
    });

    it('should mark default transitions with isDefault', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'discover-session');

      const defaultTransition = transitions.find(t => t.isDefault);
      expect(defaultTransition).toBeDefined();
    });

    it('should return empty array for non-existent activity', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'no-such-activity');
      expect(transitions).toEqual([]);
    });

    it('should include checkpoint-sourced transitions with checkpoint: prefix', async () => {
      // Need a workflow with checkpoint transitions.
      const wpResult = await loadWorkflow(WORKFLOW_DIR, 'prism-audit');
      if (wpResult.success) {
        const wpWorkflow = wpResult.value;
        const transitions = getTransitionList(wpWorkflow, 'scope-definition');
        const checkpointEntry = transitions.find(t => t.condition?.startsWith('checkpoint:'));
        expect(checkpointEntry).toBeDefined();
      }
    });
  });

  describe('getValidTransitions (BF-12)', () => {
    it('should include targets from transitions, decisions, and checkpoints', async () => {
      const workflow = await loadMetaWorkflow();
      const valid = getValidTransitions(workflow, 'discover-session');

      expect(valid).toContain('initialize-session');
    });

    it('should deduplicate targets', async () => {
      const workflow = await loadMetaWorkflow();
      const valid = getValidTransitions(workflow, 'discover-session');

      const unique = [...new Set(valid)];
      expect(valid.length).toBe(unique.length);
    });

    it('should return empty array for non-existent activity', async () => {
      const workflow = await loadMetaWorkflow();
      expect(getValidTransitions(workflow, 'no-such-activity')).toEqual([]);
    });
  });
});
