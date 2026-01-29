import { describe, it, expect } from 'vitest';
import {
  computePosition,
  computeAvailableActions,
  getCurrentActivity,
  getActiveCheckpoint,
  isCheckpointBlocking,
  isActivityComplete,
  generateSituationMessage,
} from '../../src/navigation/compute.js';
import { createInitialState } from '../../src/schema/state.schema.js';
import type { Workflow } from '../../src/schema/workflow.schema.js';
import type { WorkflowState } from '../../src/schema/state.schema.js';

// Test workflow with activities, steps, and checkpoints
const createTestWorkflow = (): Workflow => ({
  id: 'test-workflow',
  version: '1.0.0',
  title: 'Test Workflow',
  initialActivity: 'activity-1',
  activities: [
    {
      id: 'activity-1',
      name: 'First Activity',
      version: '1.0.0',
      steps: [
        { id: 'step-1', name: 'Step One', required: true },
        { id: 'step-2', name: 'Step Two', required: true },
        { id: 'step-3', name: 'Step Three', required: false },
      ],
      checkpoints: [
        {
          id: 'checkpoint-1',
          name: 'Review Checkpoint',
          message: 'Ready to proceed?',
          required: true,
          blocking: true,
          options: [
            { id: 'yes', label: 'Yes, proceed' },
            { id: 'no', label: 'No, go back' },
          ],
        },
      ],
      transitions: [
        { to: 'activity-2', isDefault: true },
      ],
    },
    {
      id: 'activity-2',
      name: 'Second Activity',
      version: '1.0.0',
      steps: [
        { id: 'final-step', name: 'Final Step', required: true },
      ],
      transitions: [],
    },
  ],
});

const createTestState = (overrides?: Partial<WorkflowState>): WorkflowState => {
  const base = createInitialState('test-workflow', '1.0.0', 'activity-1');
  return { ...base, currentStep: 1, ...overrides };
};

describe('Navigation Compute', () => {
  describe('computePosition', () => {
    it('computes position for initial activity', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const position = computePosition(workflow, state);
      
      expect(position.workflow).toBe('test-workflow');
      expect(position.activity.id).toBe('activity-1');
      expect(position.activity.name).toBe('First Activity');
    });

    it('includes step information when present', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({ currentStep: 2 });
      
      const position = computePosition(workflow, state);
      
      expect(position.step).toBeDefined();
      expect(position.step?.id).toBe('step-2');
      expect(position.step?.index).toBe(2);
      expect(position.step?.name).toBe('Step Two');
    });

    it('includes loop information when in loop', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        activeLoops: [{
          activityId: 'activity-1',
          loopId: 'test-loop',
          currentIteration: 1,
          totalItems: 5,
          startedAt: new Date().toISOString(),
        }],
      });
      
      const position = computePosition(workflow, state);
      
      expect(position.loop).toBeDefined();
      expect(position.loop?.id).toBe('test-loop');
      expect(position.loop?.iteration).toBe(2); // 1-indexed for display
      expect(position.loop?.total).toBe(5);
    });
  });

  describe('getCurrentActivity', () => {
    it('returns current activity', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const activity = getCurrentActivity(workflow, state);
      
      expect(activity?.id).toBe('activity-1');
      expect(activity?.name).toBe('First Activity');
    });

    it('returns undefined for unknown activity', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({ currentActivity: 'unknown' });
      
      const activity = getCurrentActivity(workflow, state);
      
      expect(activity).toBeUndefined();
    });
  });

  describe('getActiveCheckpoint', () => {
    it('returns null when no checkpoint is active', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const checkpoint = getActiveCheckpoint(workflow, state);
      
      expect(checkpoint).toBeNull();
    });

    it('returns checkpoint when blocking and not responded', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const checkpoint = getActiveCheckpoint(workflow, state);
      
      expect(checkpoint).not.toBeNull();
      expect(checkpoint?.id).toBe('checkpoint-1');
      expect(checkpoint?.message).toBe('Ready to proceed?');
      expect(checkpoint?.options).toHaveLength(2);
    });
  });

  describe('isCheckpointBlocking', () => {
    it('returns true when checkpoint is blocking', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      expect(isCheckpointBlocking(workflow, state)).toBe(true);
    });

    it('returns false when checkpoint is responded', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      expect(isCheckpointBlocking(workflow, state)).toBe(false);
    });
  });

  describe('computeAvailableActions', () => {
    it('returns checkpoint response as required when checkpoint active', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const actions = computeAvailableActions(workflow, state);
      
      expect(actions.required).toHaveLength(1);
      expect(actions.required[0].action).toBe('respond_to_checkpoint');
      expect(actions.required[0].checkpoint).toBe('checkpoint-1');
    });

    it('blocks step completion when checkpoint active', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const actions = computeAvailableActions(workflow, state);
      
      expect(actions.blocked).toHaveLength(1);
      expect(actions.blocked[0].action).toBe('complete_step');
      expect(actions.blocked[0].reason).toContain('checkpoint');
    });

    it('returns step completion as required when no checkpoint', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const actions = computeAvailableActions(workflow, state);
      
      expect(actions.required.some(a => a.action === 'complete_step')).toBe(true);
      expect(actions.blocked).toHaveLength(0);
    });

    it('includes optional get_resource action', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const actions = computeAvailableActions(workflow, state);
      
      expect(actions.optional.some(a => a.action === 'get_resource')).toBe(true);
    });
  });

  describe('generateSituationMessage', () => {
    it('generates readable message with activity', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const message = generateSituationMessage(workflow, state);
      
      expect(message).toContain('First Activity');
    });

    it('includes step in message', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({ currentStep: 2 });
      
      const message = generateSituationMessage(workflow, state);
      
      expect(message).toContain('Step 2');
      expect(message).toContain('Step Two');
    });

    it('includes checkpoint in message', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const message = generateSituationMessage(workflow, state);
      
      expect(message).toContain('Checkpoint');
      expect(message).toContain('Ready to proceed?');
    });
  });

  describe('isActivityComplete', () => {
    it('returns false when steps remain', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      expect(isActivityComplete(workflow, state)).toBe(false);
    });

    it('returns false when checkpoint blocking', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        completedSteps: { 'activity-1': [1, 2] }, // Required steps done
      });
      
      expect(isActivityComplete(workflow, state)).toBe(false);
    });

    it('returns true when all required steps and checkpoints done', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        completedSteps: { 'activity-1': [1, 2] }, // Required steps (step-3 is optional)
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      expect(isActivityComplete(workflow, state)).toBe(true);
    });
  });
});
