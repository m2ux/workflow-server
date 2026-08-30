import { describe, it, expect } from 'vitest';
import {
  WorkflowSchema,
  safeValidateWorkflow,
} from '../src/schema/workflow.schema.js';
import {
  ActivitySchema,
  StepSchema,
  ExitSchema,
} from '../src/schema/activity.schema.js';
import { ConditionSchema } from '../src/schema/condition.schema.js';
import {
  OutputItemDefinitionSchema,
  safeValidateTechnique,
} from '../src/schema/technique.schema.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { corpusRoot } from './corpus-root.js';

const WORKFLOW_DIR = corpusRoot();

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

  describe('ExitSchema', () => {
    it('should validate an outcome with a predicate', () => {
      const result = ExitSchema.safeParse({ id: 'revision-needed', label: 'Revision needed', when: 'review_passed == false' });
      expect(result.success).toBe(true);
    });

    it('should validate a default outcome and an immediate one', () => {
      expect(ExitSchema.safeParse({ id: 'converged', isDefault: true }).success).toBe(true);
      expect(ExitSchema.safeParse({ id: 'aborted', immediate: true }).success).toBe(true);
    });

    it('should reject a redundant negative on isDefault or immediate', () => {
      expect(ExitSchema.safeParse({ id: 'converged', isDefault: false }).success).toBe(false);
      expect(ExitSchema.safeParse({ id: 'aborted', immediate: false }).success).toBe(false);
    });

    it('should reject an exit naming a destination, which is the workflow graph\'s to name', () => {
      expect(ExitSchema.safeParse({ id: 'converged', to: 'next-activity' }).success).toBe(false);
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
        exits: [{ id: 'done', isDefault: true }],
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

  describe('VariableDefinitionSchema value sets (#518 W5.4)', () => {
    const declaration = (extra: Record<string, unknown>) => ({
      id: 'test-workflow',
      version: '1.0.0',
      title: 'Test Workflow',
      variables: [{ name: 'operation_type', type: 'string', ...extra }],
      activities: [{ id: 'activity-1', version: '1.0.0', name: 'Activity One', techniques: ['some-technique'] }],
    });

    it('accepts an enumerated set on a string variable', () => {
      expect(safeValidateWorkflow(declaration({ values: ['create', 'update', 'review'] })).success).toBe(true);
    });

    it('accepts a default drawn from the set', () => {
      expect(safeValidateWorkflow(declaration({ values: ['create', 'review'], defaultValue: 'review' })).success).toBe(true);
    });

    it('rejects a default outside the set', () => {
      expect(safeValidateWorkflow(declaration({ values: ['create', 'review'], defaultValue: 'audit' })).success).toBe(false);
    });

    it('rejects a repeated member', () => {
      expect(safeValidateWorkflow(declaration({ values: ['create', 'create'] })).success).toBe(false);
    });

    it('rejects an empty set', () => {
      expect(safeValidateWorkflow(declaration({ values: [] })).success).toBe(false);
    });

    it('rejects a set on a non-string variable', () => {
      const workflowDoc = declaration({});
      workflowDoc.variables = [{ name: 'retry_count', type: 'number', values: ['1', '2'] }];
      expect(safeValidateWorkflow(workflowDoc).success).toBe(false);
    });
  });

  describe('OutputItemDefinitionSchema audience (#224 V4)', () => {
    // PR227-TC-04 — the enum accepts both in-set values.
    it('accepts audience: human and audience: agent', () => {
      expect(OutputItemDefinitionSchema.safeParse({ id: 'out', audience: 'human' }).success).toBe(true);
      expect(OutputItemDefinitionSchema.safeParse({ id: 'out', audience: 'agent' }).success).toBe(true);
    });

    // PR227-TC-03 (schema view) — audience is optional; omitting it is valid (backward compatible).
    it('accepts an output with no audience', () => {
      expect(OutputItemDefinitionSchema.safeParse({ id: 'out' }).success).toBe(true);
    });

    // PR227-TC-05 — an out-of-set value is rejected.
    it('rejects an out-of-set audience value', () => {
      const result = OutputItemDefinitionSchema.safeParse({ id: 'out', audience: 'robot' });
      expect(result.success).toBe(false);
    });

    // PR227-TC-05 (composed) — TechniqueSchema is `.strict()`, so an invalid audience on a nested
    // output fails the whole technique, which is exactly what drops it at load.
    it('rejects an invalid audience through the strict TechniqueSchema', () => {
      const bad = {
        id: 't', version: '1.0.0', capability: 'Cap.',
        outputs: [{ id: 'out', audience: 'nobody' }],
      };
      expect(safeValidateTechnique(bad).success).toBe(false);
      const good = { ...bad, outputs: [{ id: 'out', audience: 'agent' }] };
      expect(safeValidateTechnique(good).success).toBe(true);
    });
  });

  describe('OutputArtifactSchema name (#330)', () => {
    const parse = (name: string) => OutputItemDefinitionSchema.safeParse({ id: 'out', artifact: { name } }).success;

    it('accepts a literal filename and a {token}-templated one', () => {
      expect(parse('01-audit-report.md')).toBe(true);
      expect(parse('START-HERE.md')).toBe(true);
      expect(parse('{package_name}-plan.md')).toBe(true);
      expect(parse('{YYYY-MM-DD}-pr{pr_number}-review-analysis.md')).toBe(true);
      // A `{$local}` sigil and a dotted sub-field both bind inside a placeholder.
      expect(parse('{$page_slug}.md')).toBe(true);
      expect(parse('subsystem-{code_subsystem.subsystem_name}.md')).toBe(true);
    });

    it('rejects prose, several names, and a YAML key written as the name', () => {
      // The two declarations that reached a worker as filenames before this refinement.
      expect(parse('COMPLETE.md` (implementation) or planning-folder session `README.md` section (review mode)')).toBe(false);
      expect(parse('name: README.md')).toBe(false);
      // Several files in one slot, with or without mode selectors.
      expect(parse('index.md` and `log.md')).toBe(false);
      expect(parse('reflect-l12.md` (L12 structural) / `reflect-meta.md` (claim meta-analysis)')).toBe(false);
    });

    it('rejects a name that is not one path segment with an extension', () => {
      expect(parse('planning/notes.md')).toBe(false);
      expect(parse('audit-report')).toBe(false);
      expect(parse('.md')).toBe(false);
      expect(parse('')).toBe(false);
    });

    // The refinement lives under `.strict()`, so a bad name fails the whole technique — which is
    // what drops it at load with a logged warning, as an invalid audience does.
    it('rejects an unfilenameable name through the strict TechniqueSchema', () => {
      const bad = {
        id: 't', version: '1.0.0', capability: 'Cap.',
        outputs: [{ id: 'out', artifact: { name: 'a.md` (one mode) / `b.md` (the other)' } }],
      };
      expect(safeValidateTechnique(bad).success).toBe(false);
      const good = { ...bad, outputs: [{ id: 'out', artifact: { name: 'a.md' } }] };
      expect(safeValidateTechnique(good).success).toBe(true);
    });
  });

  describe('loader schema integration', () => {
    // `WorkflowSchema.activities` is an array of ActivitySchema, so validating the composed object
    // validates every activity the loader resolved into it.
    // ponytail: rests on that nesting, assert the activities separately if the field loosens
    it('the composed workflow the loader emits passes WorkflowSchema', async () => {
      const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
      expect(result.success).toBe(true);
      if (result.success) {
        const validation = safeValidateWorkflow(result.value);
        const issues = validation.success ? '' : validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ');
        expect(validation.success, issues).toBe(true);
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
