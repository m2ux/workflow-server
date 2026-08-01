import { describe, expect, it } from 'vitest';
import {
  assertWhenAuthoring,
  evaluateWhenExpression,
  parseWhen,
} from '../src/schema/when-expression.js';
import { evaluateCondition, type Condition } from '../src/schema/condition.schema.js';

describe('when-expression', () => {
  describe('PR383-TC-01 flat OR', () => {
    const expr = 'a == true || b == true';
    it.each([
      [{ a: true, b: true }, true],
      [{ a: true, b: false }, true],
      [{ a: false, b: true }, true],
      [{ a: false, b: false }, false],
    ] as const)('%j → %s', (bag, expected) => {
      expect(evaluateWhenExpression(expr, bag as Record<string, unknown>)).toBe(expected);
    });
  });

  describe('PR383-TC-02 precedence via parentheses', () => {
    it('(a && b) || c vs a && (b || c)', () => {
      const bag = { a: false, b: true, c: true };
      expect(evaluateWhenExpression('(a == true && b == true) || c == true', bag)).toBe(true);
      expect(evaluateWhenExpression('a == true && (b == true || c == true)', bag)).toBe(false);
    });
  });

  describe('PR383-TC-03 bare mixed rejected', () => {
    it('rejects a && b || c', () => {
      const r = assertWhenAuthoring('a == true && b == true || c == true');
      expect(r.ok).toBe(false);
    });
    it('accepts parenthesized mixed', () => {
      expect(assertWhenAuthoring('(a == true && b == true) || c == true').ok).toBe(true);
      expect(assertWhenAuthoring('a == true && (b == true || c == true)').ok).toBe(true);
    });
  });

  describe('PR383-TC-04 unary ! and nesting', () => {
    it('negates comparisons and bare truthiness', () => {
      expect(evaluateWhenExpression('!flag', { flag: false })).toBe(true);
      expect(evaluateWhenExpression('!flag', { flag: true })).toBe(false);
      expect(evaluateWhenExpression('!(a == true)', { a: true })).toBe(false);
      expect(evaluateWhenExpression('!(a == true)', { a: false })).toBe(true);
    });
  });

  describe('PR383-TC-05 comparisons and literals', () => {
    it('handles ==/!= with strings, bools, null, numbers, dotted paths', () => {
      expect(evaluateWhenExpression('x == "hi"', { x: 'hi' })).toBe(true);
      expect(evaluateWhenExpression("x == 'hi'", { x: 'hi' })).toBe(true);
      expect(evaluateWhenExpression('x != "hi"', { x: 'bye' })).toBe(true);
      expect(evaluateWhenExpression('b == true', { b: true })).toBe(true);
      expect(evaluateWhenExpression('b == false', { b: false })).toBe(true);
      expect(evaluateWhenExpression('n == null', { n: null })).toBe(true);
      expect(evaluateWhenExpression('n == 42', { n: 42 })).toBe(true);
      expect(evaluateWhenExpression('obj.nested == "v"', { obj: { nested: 'v' } })).toBe(true);
    });
  });

  describe('PR383-TC-06 bare truthiness', () => {
    it('matches walker bare-identifier semantics', () => {
      expect(evaluateWhenExpression('flag', { flag: true })).toBe(true);
      expect(evaluateWhenExpression('flag', { flag: false })).toBe(false);
      expect(evaluateWhenExpression('flag', {})).toBe(false);
      expect(evaluateWhenExpression('a.b', { a: { b: 1 } })).toBe(true);
    });
  });

  describe('PR383-TC-07 fail-closed invalid', () => {
    it('returns false for junk', () => {
      expect(evaluateWhenExpression('not valid (((', {})).toBe(false);
      expect(evaluateWhenExpression('', {})).toBe(false);
      expect(evaluateWhenExpression('a ==', {})).toBe(false);
      expect(parseWhen('a &&& b').ok).toBe(false);
    });
  });

  describe('PR383-TC-08 14-complete nested shape', () => {
    const expr =
      'is_review_mode != true && (problem_complexity == "moderate" || problem_complexity == "complex")';
    it.each([
      [{ is_review_mode: false, problem_complexity: 'moderate' }, true],
      [{ is_review_mode: false, problem_complexity: 'complex' }, true],
      [{ is_review_mode: false, problem_complexity: 'simple' }, false],
      [{ is_review_mode: true, problem_complexity: 'complex' }, false],
      [{ is_review_mode: true, problem_complexity: 'moderate' }, false],
    ] as const)('%j → %s', (bag, expected) => {
      expect(evaluateWhenExpression(expr, bag as Record<string, unknown>)).toBe(expected);
    });
  });

  describe('PR383-TC-09 prism run-structural nested shape', () => {
    const expr =
      '(current_unit.pipeline_mode == "single" && current_unit.lens_name == "l12") || current_unit.pipeline_mode == "full-prism"';
    it.each([
      [{ current_unit: { pipeline_mode: 'single', lens_name: 'l12' } }, true],
      [{ current_unit: { pipeline_mode: 'single', lens_name: 'l1' } }, false],
      [{ current_unit: { pipeline_mode: 'full-prism', lens_name: 'l1' } }, true],
      [{ current_unit: { pipeline_mode: 'other', lens_name: 'l12' } }, false],
    ] as const)('%j → %s', (bag, expected) => {
      expect(evaluateWhenExpression(expr, bag as Record<string, unknown>)).toBe(expected);
    });
  });

  describe('PR383-TC-10 side-by-side structured parity', () => {
    const sites: Array<{ name: string; when: string; condition: Condition; bags: Record<string, unknown>[] }> = [
      {
        name: '14-complete',
        when: 'is_review_mode != true && (problem_complexity == "moderate" || problem_complexity == "complex")',
        condition: {
          type: 'and',
          conditions: [
            { type: 'simple', variable: 'is_review_mode', operator: '!=', value: true },
            {
              type: 'or',
              conditions: [
                { type: 'simple', variable: 'problem_complexity', operator: '==', value: 'moderate' },
                { type: 'simple', variable: 'problem_complexity', operator: '==', value: 'complex' },
              ],
            },
          ],
        },
        bags: [
          { is_review_mode: false, problem_complexity: 'moderate' },
          { is_review_mode: false, problem_complexity: 'complex' },
          { is_review_mode: false, problem_complexity: 'simple' },
          { is_review_mode: true, problem_complexity: 'complex' },
        ],
      },
      {
        name: 'workflow-design persist-structural-inventory',
        when: 'operation_type == "update" || operation_type == "review"',
        condition: {
          type: 'or',
          conditions: [
            { type: 'simple', variable: 'operation_type', operator: '==', value: 'update' },
            { type: 'simple', variable: 'operation_type', operator: '==', value: 'review' },
          ],
        },
        bags: [
          { operation_type: 'update' },
          { operation_type: 'review' },
          { operation_type: 'create' },
        ],
      },
      {
        name: 'prism run-structural',
        when: '(current_unit.pipeline_mode == "single" && current_unit.lens_name == "l12") || current_unit.pipeline_mode == "full-prism"',
        condition: {
          type: 'or',
          conditions: [
            {
              type: 'and',
              conditions: [
                { type: 'simple', variable: 'current_unit.pipeline_mode', operator: '==', value: 'single' },
                { type: 'simple', variable: 'current_unit.lens_name', operator: '==', value: 'l12' },
              ],
            },
            { type: 'simple', variable: 'current_unit.pipeline_mode', operator: '==', value: 'full-prism' },
          ],
        },
        bags: [
          { current_unit: { pipeline_mode: 'single', lens_name: 'l12' } },
          { current_unit: { pipeline_mode: 'single', lens_name: 'l1' } },
          { current_unit: { pipeline_mode: 'full-prism', lens_name: 'l1' } },
        ],
      },
    ];

    for (const site of sites) {
      it(site.name, () => {
        for (const bag of site.bags) {
          expect(evaluateWhenExpression(site.when, bag)).toBe(evaluateCondition(site.condition, bag));
        }
      });
    }
  });

  describe('PR383-TC-11 flat && regression', () => {
    const expr = 'a == true && b != false && c == "x"';
    it('all clauses must pass', () => {
      expect(evaluateWhenExpression(expr, { a: true, b: true, c: 'x' })).toBe(true);
      expect(evaluateWhenExpression(expr, { a: true, b: false, c: 'x' })).toBe(false);
      expect(evaluateWhenExpression(expr, { a: false, b: true, c: 'x' })).toBe(false);
      expect(evaluateWhenExpression(expr, { a: true, b: true, c: 'y' })).toBe(false);
    });
  });
});
