import { describe, it, expect } from 'vitest';
import {
  WorkflowSchema,
  PhaseSchema,
  CheckpointSchema,
  StepSchema,
  DecisionSchema,
  LoopSchema,
  safeValidateWorkflow,
} from '../src/schema/workflow.schema.js';
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

    it('should validate step with guide reference', () => {
      const step = {
        id: 'step-1',
        name: 'Step One',
        guide: { path: 'guides/my-guide.md', section: 'Section 1' },
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
            effect: { setVariable: { selected: 'a' }, transitionTo: 'phase-2' },
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
          { id: 'pass', label: 'Pass', transitionTo: 'next-phase' },
          { id: 'fail', label: 'Fail', transitionTo: 'retry-phase', isDefault: true },
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
            transitionTo: 'phase-a',
            condition: { type: 'simple', variable: 'flag', operator: '==', value: true },
          },
          { id: 'branch-b', label: 'Branch B', transitionTo: 'phase-b', isDefault: true },
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

  describe('PhaseSchema', () => {
    it('should validate minimal phase', () => {
      const phase = {
        id: 'phase-1',
        name: 'Phase One',
      };
      const result = PhaseSchema.safeParse(phase);
      expect(result.success).toBe(true);
    });

    it('should validate phase with all features', () => {
      const phase = {
        id: 'phase-1',
        name: 'Full Phase',
        description: 'A phase with everything',
        estimatedTime: '1-2h',
        guide: { path: 'guides/phase-guide.md' },
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
        transitions: [{ to: 'phase-2', isDefault: true }],
      };
      const result = PhaseSchema.safeParse(phase);
      expect(result.success).toBe(true);
    });
  });

  describe('WorkflowSchema', () => {
    it('should validate minimal workflow', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialPhase: 'phase-1',
        phases: [{ id: 'phase-1', name: 'Phase One' }],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(true);
    });

    it('should validate workflow with variables', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialPhase: 'phase-1',
        variables: [
          { name: 'counter', type: 'number', defaultValue: 0 },
          { name: 'flag', type: 'boolean', required: true },
        ],
        phases: [{ id: 'phase-1', name: 'Phase One' }],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(true);
    });

    it('should reject workflow without phases', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialPhase: 'phase-1',
        phases: [],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });

    it('should reject workflow with invalid version format', () => {
      const workflow = {
        id: 'test-workflow',
        version: 'v1',
        title: 'Test Workflow',
        initialPhase: 'phase-1',
        phases: [{ id: 'phase-1', name: 'Phase One' }],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });
  });
});
