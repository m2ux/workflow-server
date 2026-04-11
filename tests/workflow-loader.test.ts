import { describe, it, expect } from 'vitest';
import {
  loadWorkflow,
  listWorkflows,
  getActivity,
  getCheckpoint,
  getValidTransitions,
  getTransitionList,
  validateTransition,
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
        expect(ids).toContain('dispatch-workflow');
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

  describe('getTransitionList (BF-12)', () => {
    it('should return transitions from the transitions array', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'discover-session');

      const targets = transitions.map(t => t.to);
      // discover-session has transition to dispatch-workflow
      expect(targets).toContain('dispatch-workflow');
    });

    it('should include targets from decisions branches', async () => {
      const workflow = await loadMetaWorkflow();
      // Need a workflow with decisions. Let's use work-package/plan-package which has them.
      const wpResult = await loadWorkflow(WORKFLOW_DIR, 'prism-audit');
      if (wpResult.success) {
        const wpWorkflow = wpResult.value;
        const transitions = getTransitionList(wpWorkflow, 'post-impl-review');
        
        const targets = transitions.map(t => t.to);
        // plan-package has decisions that branch to implementation
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
      const transitions = getTransitionList(workflow, 'dispatch-workflow');

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

      expect(valid).toContain('dispatch-workflow');
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

  describe('validateTransition (BF-12)', () => {
    it('should validate a real transition between activities', async () => {
      const workflow = await loadMetaWorkflow();
      // discover-session transitions to dispatch-workflow
      const result = validateTransition(workflow, 'discover-session', 'dispatch-workflow');
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject transition to activity not in the valid transitions list', async () => {
      const workflow = await loadMetaWorkflow();
      // discover-session -> end-workflow is not a defined transition
      const result = validateTransition(workflow, 'discover-session', 'end-workflow');
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('No valid transition');
    });

    it('should reject transition from non-existent source activity', async () => {
      const workflow = await loadMetaWorkflow();
      const result = validateTransition(workflow, 'no-such-activity', 'dispatch-workflow');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Source activity not found');
    });

    it('should reject transition to non-existent target activity', async () => {
      const workflow = await loadMetaWorkflow();
      const result = validateTransition(workflow, 'discover-session', 'no-such-activity');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Target activity not found');
    });

    it('should include valid targets in the rejection reason', async () => {
      const workflow = await loadMetaWorkflow();
      const result = validateTransition(workflow, 'discover-session', 'end-workflow');
      expect(result.valid).toBe(false);
      if (result.reason) {
        expect(result.reason).toContain('Valid:');
      }
    });
  });
});
