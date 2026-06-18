import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import {
  WorkflowSchema,
  safeValidateWorkflow,
} from '../src/schema/workflow.schema.js';
import {
  ActivitySchema,
  StepSchema,
  DecisionSchema,
  safeValidateActivity,
} from '../src/schema/activity.schema.js';
import { ConditionSchema } from '../src/schema/condition.schema.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { readActivity } from '../src/loaders/activity-loader.js';

const WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows');

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
      const step = { kind: 'action', id: 'step-1' };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(true);
    });

    it('should validate step with description', () => {
      const step = {
        kind: 'technique',
        id: 'step-1',
        description: 'Detailed guidance for this step',
        technique: 'some-technique',
      };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(true);
    });

    it('should validate a technique-bound step without an explicit id', () => {
      const step = { kind: 'technique', technique: 'cargo-operations::run-suite' };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(true);
    });

    it('should reject a kind:action step with no explicit id', () => {
      const step = { kind: 'action', description: 'a control step missing its id' };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(false);
    });

    it('should reject a step with no kind', () => {
      const step = { id: 'step-1', technique: 'some-technique' };
      const result = StepSchema.safeParse(step);
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

  describe('ActivitySchema', () => {
    it('should validate minimal activity', () => {
      const activity = {
        id: 'activity-1',
        version: '1.0.0',
        name: 'Activity One',
        techniques: ['some-technique'],
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
        techniques: ['main-technique', 'helper-technique'],
        // Unified model: one ordered, kind-tagged steps[] — technique, an inline checkpoint, and a compound loop.
        steps: [
          { kind: 'technique', id: 'step-1', technique: 'main-technique::do-it' },
          { kind: 'checkpoint', id: 'cp-1', message: 'OK?', options: [{ id: 'yes', label: 'Yes' }] },
          {
            kind: 'loop',
            id: 'loop-1',
            loopType: 'forEach',
            over: 'items',
            steps: [{ kind: 'technique', id: 'inner', technique: 'helper-technique::each' }],
          },
        ],
        transitions: [{ to: 'activity-2', isDefault: true }],
        outcome: ['Something is done'],
      };
      const result = ActivitySchema.safeParse(activity);
      expect(result.success).toBe(true);
    });
  });

  describe('loader schema integration', () => {
    it('loaded workflow should pass WorkflowSchema validation', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const validation = safeValidateWorkflow(result.value);
        expect(validation.success).toBe(true);
      }
    });

    it('loaded activity should pass ActivitySchema validation', async () => {
      const result = await readActivity(WORKFLOW_DIR, 'discover-session', 'meta');
      expect(result.success).toBe(true);
      if (result.success) {
        const validation = safeValidateActivity(result.value);
        expect(validation.success).toBe(true);
      }
    });

    it('loaded workflow activities should all pass ActivitySchema', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        for (const activity of result.value.activities) {
          const validation = ActivitySchema.safeParse(activity);
          expect(validation.success, `Activity ${activity.id} failed schema validation`).toBe(true);
        }
      }
    });
  });

  describe('WorkflowSchema', () => {
    const minimalActivity = { 
      id: 'activity-1', 
      version: '1.0.0',
      name: 'Activity One',
      techniques: ['some-technique'],
    };

    it('should validate minimal workflow', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialActivity: 'activity-1',
        activities: [minimalActivity],
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
        activities: [minimalActivity],
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
        activities: [minimalActivity],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });
  });
});
