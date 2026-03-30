import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import {
  WorkflowSchema,
  safeValidateWorkflow,
  AgentRoleSchema,
  ExecutionModelSchema,
} from '../src/schema/workflow.schema.js';
import {
  ActivitySchema,
  CheckpointSchema,
  StepSchema,
  DecisionSchema,
  LoopSchema,
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
      const result = await readActivity(WORKFLOW_DIR, 'start-workflow');
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
      skills: { primary: 'some-skill' },
    };

    const minimalExecutionModel = {
      roles: [{ id: 'agent', description: 'Single agent' }],
    };

    it('should validate minimal workflow', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        executionModel: minimalExecutionModel,
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
        executionModel: minimalExecutionModel,
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
        executionModel: minimalExecutionModel,
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
        executionModel: minimalExecutionModel,
        initialActivity: 'activity-1',
        activities: [minimalActivity],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });

    it('should reject workflow without executionModel', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test Workflow',
        initialActivity: 'activity-1',
        activities: [minimalActivity],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });
  });

  describe('ExecutionModelSchema', () => {
    it('should validate minimal execution model with one role', () => {
      const model = { roles: [{ id: 'agent', description: 'Single agent' }] };
      const result = ExecutionModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('should validate two-role execution model', () => {
      const model = {
        roles: [
          { id: 'orchestrator', description: 'Coordinates workflow execution' },
          { id: 'worker', description: 'Executes activity steps' },
        ],
      };
      const result = ExecutionModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('should validate many-role execution model', () => {
      const model = {
        roles: [
          { id: 'orchestrator', description: 'Coordinates' },
          { id: 'reconnaissance', description: 'Scouts' },
          { id: 'auditor', description: 'Audits' },
          { id: 'verifier', description: 'Verifies' },
          { id: 'merger', description: 'Merges' },
          { id: 'adversarial', description: 'Challenges' },
          { id: 'dependency-reviewer', description: 'Reviews dependencies' },
        ],
      };
      const result = ExecutionModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });

    it('should reject missing roles', () => {
      const model = {};
      const result = ExecutionModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('should reject empty roles array', () => {
      const model = { roles: [] };
      const result = ExecutionModelSchema.safeParse(model);
      expect(result.success).toBe(false);
    });

    it('should reject role missing id', () => {
      const result = AgentRoleSchema.safeParse({ description: 'No id' });
      expect(result.success).toBe(false);
    });

    it('should reject role missing description', () => {
      const result = AgentRoleSchema.safeParse({ id: 'agent' });
      expect(result.success).toBe(false);
    });

    it('should reject extra properties on role (strict)', () => {
      const result = AgentRoleSchema.safeParse({
        id: 'agent',
        description: 'An agent',
        goal: 'Do things',
      });
      expect(result.success).toBe(false);
    });

    it('should reject extra properties on execution model (strict)', () => {
      const result = ExecutionModelSchema.safeParse({
        roles: [{ id: 'agent', description: 'Single agent' }],
        type: 'orchestrator-worker',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ExecutionModel unique role IDs', () => {
    const minimalActivity = { 
      id: 'activity-1', 
      version: '1.0.0',
      name: 'Activity One',
      skills: { primary: 'some-skill' },
    };

    it('should accept unique role IDs', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test',
        executionModel: {
          roles: [
            { id: 'orchestrator', description: 'Coordinates' },
            { id: 'worker', description: 'Executes' },
          ],
        },
        activities: [minimalActivity],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(true);
    });

    it('should reject duplicate role IDs', () => {
      const workflow = {
        id: 'test-workflow',
        version: '1.0.0',
        title: 'Test',
        executionModel: {
          roles: [
            { id: 'worker', description: 'Worker one' },
            { id: 'worker', description: 'Worker two' },
          ],
        },
        activities: [minimalActivity],
      };
      const result = safeValidateWorkflow(workflow);
      expect(result.success).toBe(false);
    });
  });
});
