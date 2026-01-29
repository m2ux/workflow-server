import { describe, it, expect } from 'vitest';
import {
  completeStep,
  respondToCheckpoint,
  transitionToActivity,
  advanceLoop,
  tryDefaultTransition,
} from '../../src/navigation/transitions.js';
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

describe('State Transitions', () => {
  describe('completeStep', () => {
    it('completes a step and advances to next', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = completeStep(workflow, state, 'step-1');
      
      expect(result.success).toBe(true);
      expect(result.state.completedSteps['activity-1']).toContain(1);
      expect(result.state.currentStep).toBe(2);
    });

    it('fails when checkpoint is blocking', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const result = completeStep(workflow, state, 'step-1');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CHECKPOINT_BLOCKING');
    });

    it('fails when step not found', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = completeStep(workflow, state, 'nonexistent-step');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('STEP_NOT_FOUND');
    });

    it('fails when step already completed', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        completedSteps: { 'activity-1': [1] },
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = completeStep(workflow, state, 'step-1');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('STEP_ALREADY_COMPLETE');
    });

    it('sets currentStep to undefined when all steps complete', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        completedSteps: { 'activity-1': [1, 2] },
        currentStep: 3,
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = completeStep(workflow, state, 'step-3');
      
      expect(result.success).toBe(true);
      expect(result.state.currentStep).toBeUndefined();
    });
  });

  describe('respondToCheckpoint', () => {
    it('records checkpoint response', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const result = respondToCheckpoint(workflow, state, 'checkpoint-1', 'yes');
      
      expect(result.success).toBe(true);
      const response = result.state.checkpointResponses['activity-1-checkpoint-1'];
      expect(response).toBeDefined();
      expect(response?.optionId).toBe('yes');
      expect(response?.respondedAt).toBeDefined();
    });

    it('fails when checkpoint not found', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const result = respondToCheckpoint(workflow, state, 'nonexistent', 'yes');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CHECKPOINT_NOT_FOUND');
    });

    it('fails when option not found', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const result = respondToCheckpoint(workflow, state, 'checkpoint-1', 'invalid');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('OPTION_NOT_FOUND');
    });

    it('fails when already responded', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = respondToCheckpoint(workflow, state, 'checkpoint-1', 'no');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CHECKPOINT_ALREADY_RESPONDED');
    });
  });

  describe('transitionToActivity', () => {
    it('transitions to allowed activity', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        completedSteps: { 'activity-1': [1, 2] },
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = transitionToActivity(workflow, state, 'activity-2');
      
      expect(result.success).toBe(true);
      expect(result.state.currentActivity).toBe('activity-2');
      expect(result.state.currentStep).toBe(1);
    });

    it('fails when current activity not complete', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const result = transitionToActivity(workflow, state, 'activity-2');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ACTIVITY_NOT_COMPLETE');
    });

    it('fails when target activity not found', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        completedSteps: { 'activity-1': [1, 2] },
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = transitionToActivity(workflow, state, 'nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TARGET_ACTIVITY_NOT_FOUND');
    });

    it('fails when transition not allowed', () => {
      const workflow = createTestWorkflow();
      // Start from activity-2 which has no transitions
      const state = createTestState({
        currentActivity: 'activity-2',
        completedSteps: { 'activity-2': [1] },
      });
      
      const result = transitionToActivity(workflow, state, 'activity-1');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_TRANSITION');
    });
  });

  describe('advanceLoop', () => {
    it('starts a new loop with items', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const items = ['task-1', 'task-2', 'task-3'];
      const result = advanceLoop(workflow, state, 'task-loop', items);
      
      expect(result.success).toBe(true);
      expect(result.state.activeLoops).toHaveLength(1);
      expect(result.state.activeLoops[0].loopId).toBe('task-loop');
      expect(result.state.activeLoops[0].currentIteration).toBe(0);
      expect(result.state.activeLoops[0].totalItems).toBe(3);
      expect(result.state.activeLoops[0].currentItem).toBe('task-1');
    });

    it('advances to next iteration', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        activeLoops: [{
          activityId: 'activity-1',
          loopId: 'task-loop',
          currentIteration: 0,
          totalItems: 3,
          currentItem: 'task-1',
          startedAt: new Date().toISOString(),
        }],
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const items = ['task-1', 'task-2', 'task-3'];
      const result = advanceLoop(workflow, state, 'task-loop', items);
      
      expect(result.success).toBe(true);
      expect(result.state.activeLoops[0].currentIteration).toBe(1);
      expect(result.state.activeLoops[0].currentItem).toBe('task-2');
      expect(result.state.currentStep).toBe(1); // Reset for new iteration
    });

    it('removes loop when complete', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        activeLoops: [{
          activityId: 'activity-1',
          loopId: 'task-loop',
          currentIteration: 2, // Last iteration (0, 1, 2)
          totalItems: 3,
          currentItem: 'task-3',
          startedAt: new Date().toISOString(),
        }],
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const items = ['task-1', 'task-2', 'task-3'];
      const result = advanceLoop(workflow, state, 'task-loop', items);
      
      expect(result.success).toBe(true);
      expect(result.state.activeLoops).toHaveLength(0);
    });

    it('fails when starting loop without items', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = advanceLoop(workflow, state, 'task-loop');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('LOOP_ITEMS_REQUIRED');
    });
  });

  describe('tryDefaultTransition', () => {
    it('transitions when activity complete', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        completedSteps: { 'activity-1': [1, 2] },
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      
      const result = tryDefaultTransition(workflow, state);
      
      expect(result.success).toBe(true);
      expect(result.state.currentActivity).toBe('activity-2');
    });

    it('fails when activity not complete', () => {
      const workflow = createTestWorkflow();
      const state = createTestState();
      
      const result = tryDefaultTransition(workflow, state);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ACTIVITY_NOT_COMPLETE');
    });

    it('fails when no default transition', () => {
      const workflow = createTestWorkflow();
      const state = createTestState({
        currentActivity: 'activity-2',
        completedSteps: { 'activity-2': [1] },
      });
      
      const result = tryDefaultTransition(workflow, state);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NO_DEFAULT_TRANSITION');
    });
  });

  describe('immutability', () => {
    it('does not mutate original state', () => {
      const workflow = createTestWorkflow();
      const originalState = createTestState({
        checkpointResponses: {
          'activity-1-checkpoint-1': {
            optionId: 'yes',
            respondedAt: new Date().toISOString(),
          },
        },
      });
      const originalJson = JSON.stringify(originalState);
      
      completeStep(workflow, originalState, 'step-1');
      
      expect(JSON.stringify(originalState)).toBe(originalJson);
    });
  });
});
