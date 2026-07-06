import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseDefinition } from '../src/utils/serialization.js';
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
import { loadWorkflow, getActivity } from '../src/loaders/workflow-loader.js';

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

    it('should reject a step with a description (AP-64: guidance lives in the bound technique)', () => {
      const step = {
        kind: 'technique',
        id: 'step-1',
        description: 'Detailed guidance for this step',
        technique: 'some-technique',
      };
      const result = StepSchema.safeParse(step);
      expect(result.success).toBe(false);
    });

    it('should reject a technique step carrying another kind\'s field', () => {
      const step = { kind: 'technique', id: 'step-1', technique: 'some-technique', loopType: 'forEach' };
      expect(StepSchema.safeParse(step).success).toBe(false);
    });

    it('should reject an action step carrying checkpoint fields', () => {
      const step = { kind: 'action', id: 'step-1', message: 'not a checkpoint' };
      expect(StepSchema.safeParse(step).success).toBe(false);
    });

    it('should reject a checkpoint step carrying a technique binding', () => {
      const step = {
        kind: 'checkpoint', id: 'cp-1', message: 'OK?',
        options: [{ id: 'yes', label: 'Yes' }], technique: 'some-technique',
      };
      expect(StepSchema.safeParse(step).success).toBe(false);
    });

    it('should reject a checkpoint step without options', () => {
      const step = { kind: 'checkpoint', id: 'cp-1', message: 'OK?', options: [] };
      expect(StepSchema.safeParse(step).success).toBe(false);
    });

    it('should reject `required: true` (redundant — required is the default) and accept `required: false`', () => {
      const base = { kind: 'technique', id: 'step-1', technique: 'some-technique' };
      expect(StepSchema.safeParse({ ...base, required: true }).success).toBe(false);
      expect(StepSchema.safeParse({ ...base, required: false }).success).toBe(true);
    });

    it('should accept a loop step name and reject name on every other kind', () => {
      const loop = {
        kind: 'loop', id: 'loop-1', name: 'per item', loopType: 'forEach', over: 'items',
        steps: [{ kind: 'action', id: 'inner' }],
      };
      expect(StepSchema.safeParse(loop).success).toBe(true);
      expect(StepSchema.safeParse({ kind: 'action', id: 'step-1', name: 'labelled' }).success).toBe(false);
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

    it('should reject an authored artifacts[] block (AP-65: the contract is synthesized from technique outputs)', () => {
      const activity = {
        id: 'activity-1',
        version: '1.0.0',
        name: 'Activity One',
        techniques: ['some-technique'],
        artifacts: [{ id: 'report', name: '01-report.md' }],
      };
      expect(ActivitySchema.safeParse(activity).success).toBe(false);
    });

    it('should reject a field outside the declared activity set', () => {
      const activity = {
        id: 'activity-1',
        version: '1.0.0',
        name: 'Activity One',
        techniques: ['some-technique'],
        checkpoints: [],
      };
      expect(ActivitySchema.safeParse(activity).success).toBe(false);
    });
  });

  describe('VariableDefinitionSchema names (AP-60)', () => {
    const workflow = (name: string) => ({
      id: 'test-workflow',
      version: '1.0.0',
      title: 'Test Workflow',
      variables: [{ name, type: 'string' }],
      activities: [{ id: 'activity-1', version: '1.0.0', name: 'Activity One', techniques: ['some-technique'] }],
    });

    it('accepts a qualified snake_case noun phrase', () => {
      expect(safeValidateWorkflow(workflow('analysis_target')).success).toBe(true);
    });

    it('accepts an enumerated bare-word exemption', () => {
      expect(safeValidateWorkflow(workflow('target')).success).toBe(true);
    });

    it('rejects a bare non-exempt single word', () => {
      expect(safeValidateWorkflow(workflow('counter')).success).toBe(false);
    });
  });

  describe('corpus strict-parse', () => {
    // Every definition file of every workflow must parse under the closed schemas. This is the
    // guardrail for the loader's skip-on-validation-failure behavior: a schema tightening that
    // breaks a corpus file must fail HERE, not silently drop an activity from the loader.
    const workflowDirs = readdirSync(WORKFLOW_DIR).filter((d) =>
      statSync(join(WORKFLOW_DIR, d)).isDirectory(),
    );

    it('every workflow.yaml passes WorkflowSchema', () => {
      for (const wf of workflowDirs) {
        const file = join(WORKFLOW_DIR, wf, 'workflow.yaml');
        if (!existsSync(file)) continue;
        const raw = parseDefinition(readFileSync(file, 'utf-8')) as Record<string, unknown>;
        // A raw definition file may reference its activities as strings; the loader resolves them
        // into Activity objects. Validate everything but that loader-resolved field.
        delete raw.activities;
        const result = safeValidateWorkflow(raw);
        const issues = result.success ? '' : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ');
        expect(result.success, `${wf}/workflow.yaml: ${issues}`).toBe(true);
      }
    });

    it('every activity file passes ActivitySchema', () => {
      let files = 0;
      for (const wf of workflowDirs) {
        const dir = join(WORKFLOW_DIR, wf, 'activities');
        if (!existsSync(dir)) continue;
        for (const entry of readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
          files++;
          const result = safeValidateActivity(parseDefinition(readFileSync(join(dir, entry), 'utf-8')));
          const issues = result.success ? '' : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ');
          expect(result.success, `${wf}/activities/${entry}: ${issues}`).toBe(true);
        }
      }
      expect(files).toBeGreaterThan(0);
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
      const result = await loadWorkflow(WORKFLOW_DIR, 'meta');
      expect(result.success).toBe(true);
      if (result.success) {
        const activity = getActivity(result.value, 'discover-session');
        const validation = safeValidateActivity(activity);
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
          { name: 'iteration_counter', type: 'number', defaultValue: 0 },
          { name: 'elicitation_flag', type: 'boolean', required: true },
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
