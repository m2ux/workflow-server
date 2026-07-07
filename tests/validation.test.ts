import { describe, it, expect } from 'vitest';
import {
  validateActivityTransition,
  validateWorkflowVersion,
  validateStepManifest,
  buildValidation,
  type SessionView,
} from '../src/utils/validation.js';
import { evaluateCondition } from '../src/schema/condition.schema.js';
import type { Condition } from '../src/schema/condition.schema.js';
import type { Workflow } from '../src/schema/workflow.schema.js';

function makeToken(overrides: Partial<SessionView> = {}): SessionView {
  return {
    wf: 'test-wf',
    act: '',
    v: '1.0.0',
    ...overrides,
  };
}

function makeWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: 'test-wf',
    version: '1.0.0',
    title: 'Test Workflow',
    activities: [
      {
        id: 'planning',
        title: 'Planning',
        steps: [{ id: 'plan-step', title: 'Plan', instructions: 'Plan it' }],
        transitions: [{ to: 'implementation' }],
      },
      {
        id: 'implementation',
        title: 'Implementation',
        steps: [{ id: 'impl-step', title: 'Implement', instructions: 'Do it' }],
        transitions: [{ to: 'review' }],
      },
      {
        id: 'review',
        title: 'Review',
        steps: [{ id: 'review-step', title: 'Review', instructions: 'Review it' }],
      },
    ],
    ...overrides,
  };
}

describe('validation', () => {
  describe('BF-04: validateActivityTransition warning strings', () => {
    it('returns null when transition is valid', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'implementation');
      expect(result).toBeNull();
    });

    it('returns null when staying on the same activity', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('returns descriptive warning when transition is invalid', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'review');
      expect(result).not.toBeNull();
      expect(result).toBeTypeOf('string');
      expect(result).toContain('review');
      expect(result).toContain('planning');
      expect(result).toContain('Valid transitions');
    });

    it('returns null when current activity has no transitions (terminal activity)', () => {
      const token = makeToken({ act: 'review' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('returns null on first call (no current activity)', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('lists valid transitions in the warning message', () => {
      const workflow = makeWorkflow({
        activities: [
          {
            id: 'hub',
            title: 'Hub',
            steps: [{ id: 's1', title: 'Step', instructions: 'Do' }],
            transitions: [{ to: 'branch-a' }, { to: 'branch-b' }],
          },
          { id: 'branch-a', title: 'A', steps: [{ id: 'a1', title: 'A', instructions: 'A' }] },
          { id: 'branch-b', title: 'B', steps: [{ id: 'b1', title: 'B', instructions: 'B' }] },
          { id: 'branch-c', title: 'C', steps: [{ id: 'c1', title: 'C', instructions: 'C' }] },
        ],
      });
      const token = makeToken({ act: 'hub' });
      const result = validateActivityTransition(token, workflow, 'branch-c');
      expect(result).not.toBeNull();
      expect(result).toContain('branch-a');
      expect(result).toContain('branch-b');
    });
  });

  describe('BF-09: initialActivity enforcement', () => {
    it('returns null on first call when no initialActivity is set', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow();
      const result = validateActivityTransition(token, workflow, 'review');
      expect(result).toBeNull();
    });

    it('returns null when first call targets the initialActivity', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow({ initialActivity: 'planning' });
      const result = validateActivityTransition(token, workflow, 'planning');
      expect(result).toBeNull();
    });

    it('returns warning when first call skips the initialActivity', () => {
      const token = makeToken({ act: '' });
      const workflow = makeWorkflow({ initialActivity: 'planning' });
      const result = validateActivityTransition(token, workflow, 'implementation');
      expect(result).not.toBeNull();
      expect(result).toBeTypeOf('string');
      expect(result).toContain('planning');
      expect(result).toContain('implementation');
      expect(result).toContain('initialActivity');
    });

    it('does not enforce initialActivity after the first call', () => {
      const token = makeToken({ act: 'planning' });
      const workflow = makeWorkflow({ initialActivity: 'planning' });
      const result = validateActivityTransition(token, workflow, 'implementation');
      expect(result).toBeNull();
    });
  });

  describe('BF-13: toNumber coercion in condition evaluation', () => {
    it('coerces string variable to number for > comparison', () => {
      const condition: Condition = { type: 'simple', variable: 'count', operator: '>', value: 5 };
      expect(evaluateCondition(condition, { count: '10' })).toBe(true);
      expect(evaluateCondition(condition, { count: '3' })).toBe(false);
    });

    it('coerces string condition value to number for < comparison', () => {
      const condition: Condition = { type: 'simple', variable: 'score', operator: '<', value: '100' };
      expect(evaluateCondition(condition, { score: 50 })).toBe(true);
      expect(evaluateCondition(condition, { score: 150 })).toBe(false);
    });

    it('handles >= and <= with string-to-number coercion', () => {
      const gte: Condition = { type: 'simple', variable: 'x', operator: '>=', value: 10 };
      expect(evaluateCondition(gte, { x: '10' })).toBe(true);
      expect(evaluateCondition(gte, { x: '9' })).toBe(false);

      const lte: Condition = { type: 'simple', variable: 'x', operator: '<=', value: '5' };
      expect(evaluateCondition(lte, { x: 5 })).toBe(true);
      expect(evaluateCondition(lte, { x: 6 })).toBe(false);
    });

    it('returns false for non-numeric strings in numeric comparisons', () => {
      const condition: Condition = { type: 'simple', variable: 'val', operator: '>', value: 5 };
      expect(evaluateCondition(condition, { val: 'not-a-number' })).toBe(false);
    });

    it('returns false when variable is undefined in numeric comparisons', () => {
      const condition: Condition = { type: 'simple', variable: 'missing', operator: '>=', value: 0 };
      expect(evaluateCondition(condition, {})).toBe(false);
    });

    it('handles both sides as strings that are numeric', () => {
      const condition: Condition = { type: 'simple', variable: 'a', operator: '>', value: '5' };
      expect(evaluateCondition(condition, { a: '10' })).toBe(true);
      expect(evaluateCondition(condition, { a: '3' })).toBe(false);
    });

    it('uses strict equality for == (no coercion)', () => {
      const condition: Condition = { type: 'simple', variable: 'x', operator: '==', value: 5 };
      expect(evaluateCondition(condition, { x: 5 })).toBe(true);
      expect(evaluateCondition(condition, { x: '5' })).toBe(false);
    });

    it('handles exists/notExists without coercion', () => {
      const exists: Condition = { type: 'simple', variable: 'x', operator: 'exists' };
      expect(evaluateCondition(exists, { x: '0' })).toBe(true);
      expect(evaluateCondition(exists, {})).toBe(false);

      const notExists: Condition = { type: 'simple', variable: 'x', operator: 'notExists' };
      expect(evaluateCondition(notExists, {})).toBe(true);
      expect(evaluateCondition(notExists, { x: 0 })).toBe(false);
    });

    it('resolves dot-delimited variable paths for numeric comparison', () => {
      const condition: Condition = { type: 'simple', variable: 'metrics.score', operator: '>', value: 80 };
      expect(evaluateCondition(condition, { metrics: { score: '95' } })).toBe(true);
      expect(evaluateCondition(condition, { metrics: { score: '50' } })).toBe(false);
    });

    it('evaluates compound conditions with coerced numbers', () => {
      const condition: Condition = {
        type: 'and',
        conditions: [
          { type: 'simple', variable: 'min', operator: '>=', value: 1 },
          { type: 'simple', variable: 'max', operator: '<=', value: 100 },
        ],
      };
      expect(evaluateCondition(condition, { min: '5', max: '50' })).toBe(true);
      expect(evaluateCondition(condition, { min: '0', max: '50' })).toBe(false);
    });
  });

  describe('validateStepManifest: gated and loop-body steps', () => {
    function makeManifestWorkflow(): Workflow {
      return {
        id: 'test-wf',
        version: '1.0.0',
        title: 'Test Workflow',
        activities: [
          {
            id: 'work',
            version: '1.0.0',
            name: 'Work',
            steps: [
              { kind: 'technique', id: 'first-step', technique: 'grp::first-step' },
              { kind: 'technique', id: 'gated-step', technique: 'grp::gated-step', when: 'needs_gate == true' },
              {
                kind: 'checkpoint',
                id: 'conditional-gate',
                message: 'Proceed?',
                options: [{ id: 'proceed', label: 'Proceed' }],
                condition: { type: 'simple', variable: 'confirmation_needed', operator: '==', value: true },
              },
              {
                kind: 'loop',
                id: 'item-loop',
                loopType: 'forEach',
                variable: 'current_item',
                over: 'pending_items',
                steps: [
                  { kind: 'technique', id: 'process-item', technique: 'grp::process-item' },
                ],
              },
              { kind: 'technique', id: 'last-step', technique: 'grp::last-step' },
            ],
          },
        ],
      } as unknown as Workflow;
    }

    it('accepts a manifest that omits when-gated and condition-gated steps', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'item-loop', output: 'processed 3 items' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings).toEqual([]);
    });

    it('still reports ungated steps as missing', () => {
      const warnings = validateStepManifest(
        [{ step_id: 'first-step', output: 'done' }],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('Missing steps') && w.includes('last-step'))).toBe(true);
      expect(warnings.some(w => w.includes('gated-step') || w.includes('conditional-gate'))).toBe(false);
    });

    it('accepts executed gated steps and loop-body step ids without warnings', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'gated-step', output: 'gate held, executed' },
          { step_id: 'conditional-gate', output: 'user chose proceed' },
          { step_id: 'item-loop', output: 'iterated' },
          { step_id: 'process-item', output: 'item 1' },
          { step_id: 'process-item', output: 'item 2' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings).toEqual([]);
    });

    it('reports unknown step ids as unexpected', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'invented-step', output: 'done' },
          { step_id: 'item-loop', output: 'done' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('Unexpected steps') && w.includes('invented-step'))).toBe(true);
    });

    it('does not report order mismatches when gated steps are skipped', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: 'done' },
          { step_id: 'item-loop', output: 'done' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('order mismatch'))).toBe(false);
    });

    it('reports out-of-declaration-order top-level steps', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'last-step', output: 'done' },
          { step_id: 'first-step', output: 'done' },
          { step_id: 'item-loop', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes('order mismatch'))).toBe(true);
    });

    it('warns on empty step output', () => {
      const warnings = validateStepManifest(
        [
          { step_id: 'first-step', output: '  ' },
          { step_id: 'item-loop', output: 'done' },
          { step_id: 'last-step', output: 'done' },
        ],
        makeManifestWorkflow(),
        'work',
      );
      expect(warnings.some(w => w.includes("'first-step' has empty output"))).toBe(true);
    });
  });

  describe('buildValidation', () => {
    it('builds valid result with no warnings', () => {
      const result = buildValidation(null, null);
      expect(result.status).toBe('valid');
      expect(result.warnings).toHaveLength(0);
    });

    it('builds warning result from non-null strings', () => {
      const result = buildValidation('problem 1', null, 'problem 2');
      expect(result.status).toBe('warning');
      expect(result.warnings).toEqual(['problem 1', 'problem 2']);
    });

  });
});
