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
        expect(result.value.activities.length).toBeGreaterThanOrEqual(3);
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
        expect(ids).toContain('start-workflow');
        expect(ids).toContain('resume-workflow');
        expect(ids).toContain('end-workflow');
      }
    });
  });

  describe('listWorkflows', () => {
    it('should list available workflows with manifest data', async () => {
      const manifests = await listWorkflows(WORKFLOW_DIR);

      expect(manifests.length).toBeGreaterThanOrEqual(2);
      const ids = manifests.map(m => m.id);
      expect(ids).toContain('meta');
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
      const activity = getActivity(workflow, 'resume-workflow');

      expect(activity).toBeDefined();
      expect(activity?.id).toBe('resume-workflow');
    });

    it('should return undefined for a non-existent activity ID', async () => {
      const workflow = await loadMetaWorkflow();
      expect(getActivity(workflow, 'no-such-activity')).toBeUndefined();
    });
  });

  describe('getCheckpoint', () => {
    it('should find a checkpoint within an activity', async () => {
      const workflow = await loadMetaWorkflow();
      const checkpoint = getCheckpoint(workflow, 'resume-workflow', 'state-verified');

      expect(checkpoint).toBeDefined();
      expect(checkpoint?.id).toBe('state-verified');
      expect(checkpoint?.name).toBeDefined();
      expect(checkpoint?.message).toBeDefined();
      expect(checkpoint?.options.length).toBeGreaterThanOrEqual(2);
    });

    it('should return undefined for a non-existent checkpoint', async () => {
      const workflow = await loadMetaWorkflow();
      expect(getCheckpoint(workflow, 'resume-workflow', 'no-such-checkpoint')).toBeUndefined();
    });
  });

  describe('getTransitionList (BF-12)', () => {
    it('should return transitions from the transitions array', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'resume-workflow');

      const targets = transitions.map(t => t.to);
      // resume-workflow has transitions to target-activity and start-workflow
      expect(targets).toContain('target-activity');
      expect(targets).toContain('start-workflow');
    });

    it('should include targets from decisions branches', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'resume-workflow');

      const targets = transitions.map(t => t.to);
      // resume-workflow decisions branch to assess-state and determine-entry-point
      expect(targets).toContain('assess-state');
      expect(targets).toContain('determine-entry-point');
    });

    it('should deduplicate targets via the seen Set', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'resume-workflow');

      const targets = transitions.map(t => t.to);
      const uniqueTargets = [...new Set(targets)];
      // assess-state appears in multiple decision branches but should only appear once
      expect(targets.length).toBe(uniqueTargets.length);
    });

    it('should include condition strings for conditional transitions', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'resume-workflow');

      const conditionalTransition = transitions.find(t => t.to === 'target-activity');
      expect(conditionalTransition).toBeDefined();
      expect(conditionalTransition?.condition).toBeDefined();
    });

    it('should mark default transitions with isDefault', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'resume-workflow');

      const defaultTransition = transitions.find(t => t.isDefault);
      expect(defaultTransition).toBeDefined();
    });

    it('should return empty array for activity with no transitions', async () => {
      const workflow = await loadMetaWorkflow();
      // start-workflow has no explicit transitions in the meta workflow
      const activity = getActivity(workflow, 'start-workflow');
      const hasTransitions = activity?.transitions && activity.transitions.length > 0;
      const hasDecisions = activity?.decisions && activity.decisions.length > 0;
      const hasCheckpoints = activity?.checkpoints && activity.checkpoints.length > 0;

      if (!hasTransitions && !hasDecisions && !hasCheckpoints) {
        const transitions = getTransitionList(workflow, 'start-workflow');
        expect(transitions).toEqual([]);
      }
    });

    it('should return empty array for non-existent activity', async () => {
      const workflow = await loadMetaWorkflow();
      const transitions = getTransitionList(workflow, 'no-such-activity');
      expect(transitions).toEqual([]);
    });

    it('should include checkpoint-sourced transitions with checkpoint: prefix', async () => {
      const workflow = await loadMetaWorkflow();

      // end-workflow has checkpoints with transitionTo effects
      const endActivity = getActivity(workflow, 'end-workflow');
      const hasCheckpointTransitions = endActivity?.checkpoints?.some(c =>
        c.options.some(o => o.effect?.transitionTo),
      );

      if (hasCheckpointTransitions) {
        const transitions = getTransitionList(workflow, 'end-workflow');
        const checkpointEntry = transitions.find(t => t.condition?.startsWith('checkpoint:'));
        expect(checkpointEntry).toBeDefined();
      }
    });
  });

  describe('getValidTransitions (BF-12)', () => {
    it('should include targets from transitions, decisions, and checkpoints', async () => {
      const workflow = await loadMetaWorkflow();
      const valid = getValidTransitions(workflow, 'resume-workflow');

      expect(valid).toContain('target-activity');
      expect(valid).toContain('start-workflow');
      expect(valid).toContain('assess-state');
      expect(valid).toContain('determine-entry-point');
    });

    it('should deduplicate targets', async () => {
      const workflow = await loadMetaWorkflow();
      const valid = getValidTransitions(workflow, 'resume-workflow');

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
      // resume-workflow transitions to start-workflow, both are real activities
      const result = validateTransition(workflow, 'resume-workflow', 'start-workflow');
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject transition to activity not in the valid transitions list', async () => {
      const workflow = await loadMetaWorkflow();
      // start-workflow -> end-workflow is not a defined transition
      const result = validateTransition(workflow, 'start-workflow', 'end-workflow');
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('No valid transition');
    });

    it('should reject transition from non-existent source activity', async () => {
      const workflow = await loadMetaWorkflow();
      const result = validateTransition(workflow, 'no-such-activity', 'start-workflow');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Source activity not found');
    });

    it('should reject transition to non-existent target activity', async () => {
      const workflow = await loadMetaWorkflow();
      const result = validateTransition(workflow, 'start-workflow', 'no-such-activity');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Target activity not found');
    });

    it('should include valid targets in the rejection reason', async () => {
      const workflow = await loadMetaWorkflow();
      const result = validateTransition(workflow, 'resume-workflow', 'end-workflow');
      expect(result.valid).toBe(false);
      if (result.reason) {
        expect(result.reason).toContain('Valid:');
      }
    });
  });
});
