import { describe, it, expect } from 'vitest';
import {
  validateActivityTransition,
  validateWorkflowConsistency,
  validateWorkflowVersion,
  validateSkillAssociation,
  buildValidation,
  buildErrorValidation,
} from '../src/utils/validation.js';
import { evaluateCondition } from '../src/schema/condition.schema.js';
import type { Condition } from '../src/schema/condition.schema.js';
import type { SessionPayload } from '../src/utils/session.js';
import type { Workflow } from '../src/schema/workflow.schema.js';

function makeToken(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    wf: 'test-wf',
    act: '',
    skill: '',
    cond: '',
    v: '1.0.0',
    seq: 1,
    ts: Date.now(),
    sid: 'sess-1',
    aid: 'agent-1',
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

  describe('validateWorkflowConsistency', () => {
    it('returns null when workflow matches session', () => {
      const token = makeToken({ wf: 'my-wf' });
      expect(validateWorkflowConsistency(token, 'my-wf')).toBeNull();
    });

    it('returns warning on workflow mismatch', () => {
      const token = makeToken({ wf: 'wf-a' });
      const result = validateWorkflowConsistency(token, 'wf-b');
      expect(result).not.toBeNull();
      expect(result).toContain('wf-a');
      expect(result).toContain('wf-b');
    });
  });

  describe('buildValidation / buildErrorValidation', () => {
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

    it('builds error result with errors array', () => {
      const result = buildErrorValidation('fatal', 'also a warning');
      expect(result.status).toBe('error');
      expect(result.errors).toEqual(['fatal']);
      expect(result.warnings).toContain('also a warning');
    });
  });
});
