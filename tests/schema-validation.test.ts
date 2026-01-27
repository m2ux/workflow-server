import { describe, it, expect } from 'vitest';
import {
  WorkflowSchema,
  safeValidateWorkflow,
} from '../src/schema/workflow.schema.js';
import {
  ActivitySchema,
  CheckpointSchema,
  StepSchema,
  DecisionSchema,
  LoopSchema,
} from '../src/schema/activity.schema.js';
import { ConditionSchema } from '../src/schema/condition.schema.js';

describe('schema-validation', () => {
  describe('ConditionSchema', () => {
    it('should validate simple condition', () => {
      const condition = {
        type: 'simple',
        variable: 'needs_elicitation',
        operator: '==',
        value: true,
      };
      const result = ConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should validate AND condition', () => {
      const condition = {
        type: 'and',
        conditions: [
          { type: 'simple', variable: 'a', operator: '==', value: 1 },
          { type: 'simple', variable: 'b', operator: '>', value: 2 },
        ],
      };
      const result = ConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should validate OR condition', () => {
      const condition = {
        type: 'or',
        conditions: [
          { type: 'simple', variable: 'x', operator: '==', value: 'yes' },
          { type: 'simple', variable: 'y', operator: '==', value: 'yes' },
        ],
      };
      const result = ConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should validate NOT condition', () => {
      const condition = {
        type: 'not',
        condition: { type: 'simple', variable: 'flag', operator: '==', value: false },
      };
      const result = ConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should validate exists operator without value', () => {
      const condition = {
        type: 'simple',
        variable: 'issue_number',
        operator: 'exists',
      };
      const result = ConditionSchema.safeParse(condition);
      expect(result.success).toBe(true);
    });

    it('should reject invalid operator', () => {
      const condition = {
        type: 'simple',
        variable: 'x',
        operator: 'invalid',
        value: 1,
      };
      const result = ConditionSchema.safeParse(condition);
      expect(result.success).toBe(false);
    });
  });

  describe('StepSchema', () => {
    it('should validate minimal step', () => {
      const step = { id: 'step-1', name: 'Step One' };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(true);
    });

    it('should validate step with description', () => {
      const step = {
        id: 'step-1',
        name: 'Step One',
        description: 'Detailed guidance for this step',
        skill: 'some-skill',
      };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(true);
    });

    it('should reject step without id', () => {
      const step = { name: 'Step One' };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(false);
    });
  });

  describe('CheckpointSchema', () => {
    it('should validate checkpoint with options', () => {
      const checkpoint = {
        id: 'checkpoint-1',
        name: 'Confirm',
        message: 'Do you want to proceed?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
      };
      const result = CheckpointSchema.safeParse(checkpoint);
      expect(result.success).toBe(true);
    });

    it('should validate checkpoint with effects', () => {
      const checkpoint = {
        id: 'checkpoint-1',
        name: 'Choose',
        message: 'Select option',
        options: [
          {
            id: 'option-a',
            label: 'Option A',
            effect: { setVariable: { selected: 'a' }, transitionTo: 'activity-2' },
          },
          { id: 'option-b', label: 'Option B' },
        ],
      };
      const result = CheckpointSchema.safeParse(checkpoint);
      expect(result.success).toBe(true);
    });

    it('should reject checkpoint with no options', () => {
      const checkpoint = {
        id: 'checkpoint-1',
        name: 'Empty',
        message: 'No options',
        options: [],
      };
      const result = CheckpointSchema.safeParse(checkpoint);
      expect(result.success).toBe(false);
    });
  });

  describe('DecisionSchema', () => {
    it('should validate decision with branches', () => {
      const decision = {
        id: 'decision-1',
        name: 'Validation Check',
        branches: [
          { id: 'pass', label: 'Pass', transitionTo: 'next-activity' },
          { id: 'fail', label: 'Fail', transitionTo: 'retry-activity', isDefault: true },
        ],
      };
      const result = DecisionSchema.safeParse(decision);
      expect(result.success).toBe(true);
    });

    it('should validate decision with conditions', () => {
      const decision = {
        id: 'decision-1',
        name: 'Conditional',
        branches: [
          {
            id: 'branch-a',
            label: 'Branch A',
            transitionTo: 'activity-a',
            condition: { type: 'simple', variable: 'flag', operator: '==', value: true },
          },
          { id: 'branch-b', label: 'Branch B', transitionTo: 'activity-b', isDefault: true },
        ],
      };
      const result = DecisionSchema.safeParse(decision);
      expect(result.success).toBe(true);
    });

    it('should reject decision with fewer than 2 branches', () => {
      const decision = {
        id: 'decision-1',
        name: 'Single Branch',
        branches: [{ id: 'only', label: 'Only', transitionTo: 'next' }],
      };
      const result = DecisionSchema.safeParse(decision);
      expect(result.success).toBe(false);
    });
  });

  describe('LoopSchema', () => {
    it('should validate forEach loop', () => {
      const loop = {
        id: 'loop-1',
        name: 'Task Loop',
        type: 'forEach',
        variable: 'task',
        over: 'tasks',
      };
      const result = LoopSchema.safeParse(loop);
      expect(result.success).toBe(true);
    });

    it('should validate while loop with condition', () => {
      const loop = {
        id: 'loop-1',
        name: 'Retry Loop',
        type: 'while',
        condition: { type: 'simple', variable: 'retries', operator: '<', value: 3 },
        maxIterations: 5,
      };
      const result = LoopSchema.safeParse(loop);
      expect(result.success).toBe(true);
    });
  });

  describe('ActivitySchema', () => {
    it('should validate minimal activity', () => {
      const activity = {
        id: 'activity-1',
        version: '1.0.0',
        name: 'Activity One',
        skills: { primary: 'some-skill' },
      };
      const result = ActivitySchema.safeParse(activity);
      expect(result.success).toBe(true);
    });

    it('should validate activity with all features', () => {
      const activity = {
        id: 'activity-1',
        version: '1.0.0',
        name: 'Full Activity',
        description: 'An activity with everything',
        problem: 'User needs to do something',
        recognition: ['do something', 'perform action'],
        skills: { primary: 'main-skill', supporting: ['helper-skill'] },
        estimatedTime: '1-2h',
        entryActions: [{ action: 'log', message: 'Entering' }],
        exitActions: [{ action: 'log', message: 'Exiting' }],
        steps: [{ id: 'step-1', name: 'Step 1' }],
        checkpoints: [
          {
            id: 'cp-1',
            name: 'Check',
            message: 'OK?',
            options: [{ id: 'yes', label: 'Yes' }],
          },
        ],
        transitions: [{ to: 'activity-2', isDefault: true }],
        outcome: ['Something is done'],
      };
      const result = ActivitySchema.safeParse(activity);
      expect(result.success).toBe(true);
    });
  });

  describe('WorkflowSchema', () => {
    it('should validate minimal workflow', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialActivity: 'activity-1',
        activities: [{ 
          id: 'activity-1', 
          version: '1.0.0',
          name: 'Activity One',
          skills: { primary: 'some-skill' },
        }],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(true);
    });

    it('should validate workflow with variables', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialActivity: 'activity-1',
        variables: [
          { name: 'counter', type: 'number', defaultValue: 0 },
          { name: 'flag', type: 'boolean', required: true },
        ],
        activities: [{ 
          id: 'activity-1', 
          version: '1.0.0',
          name: 'Activity One',
          skills: { primary: 'some-skill' },
        }],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(true);
    });

    it('should reject workflow without activities', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialActivity: 'activity-1',
        activities: [],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });

    it('should reject workflow with invalid version format', () => {
      const workflow = {
        id: 'test-workflow',
        version: 'v1',
        title: 'Test Workflow',
        initialActivity: 'activity-1',
        activities: [{ 
          id: 'activity-1', 
          version: '1.0.0',
          name: 'Activity One',
          skills: { primary: 'some-skill' },
        }],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });
  });
});
