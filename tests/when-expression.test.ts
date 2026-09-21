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

  /**
   * The dialect has two homes: this evaluator, and the `gate-evaluation` rule of the
   * `workflow-engine::step-control` technique, which is what an agent is actually delivered — the
   * evaluator never rides the wire. A rule that has drifted from the evaluator misinstructs every
   * worker and orchestrator while every other test here still passes, so each case below states a
   * sentence of the rule and asserts the evaluator agrees with it.
   *
   * Editing the evaluator's behaviour means editing that rule in the same change. The corpus is a
   * separate branch, so these skip where it is not checked out.
   */
  describe('the delivered rule and this evaluator agree', () => {
    const RULE_HOME = 'meta/techniques/workflow-engine/step-control.md';

    /**
     * The rule text, or null where no corpus is checked out.
     *
     * A corpus that IS checked out and does not carry the rule throws rather than returning null:
     * a renamed heading or a moved file would otherwise take every case below into the skip branch,
     * and a drift check that answers "nothing to compare" to the edit most likely to cause drift is
     * worth less than no check at all.
     */
    async function gateEvaluationRule(): Promise<string | null> {
      const { liveCorpusRoot } = await import('./corpus-root.js');
      const { readFileSync, existsSync } = await import('node:fs');
      const { join } = await import('node:path');
      const root = liveCorpusRoot();
      if (root === null) return null;
      const path = join(root, RULE_HOME);
      if (!existsSync(path)) {
        throw new Error(`${RULE_HOME} is absent from the corpus at ${root} — the delivered home of the when dialect`);
      }
      const body = readFileSync(path, 'utf8');
      const start = body.indexOf('### gate-evaluation');
      if (start === -1) {
        throw new Error(`${RULE_HOME} carries no 'gate-evaluation' rule — rename it here too, or this check stops comparing`);
      }
      const next = body.indexOf('\n### ', start + 1);
      return next === -1 ? body.slice(start) : body.slice(start, next);
    }

    it('states every operator the parser accepts, in its roster sentence', async () => {
      const rule = await gateEvaluationRule();
      if (rule === null) return;
      // Read the roster sentence alone. Searching the whole rule would pass on an operator that
      // survives only in a later bullet, which is the drop most likely to happen in an edit.
      const from = rule.indexOf('Operators are');
      expect(from, `${RULE_HOME} states no operator roster`).toBeGreaterThan(-1);
      const rest = rule.slice(from);
      const end = rest.indexOf('. ');
      const roster = end === -1 ? rest : rest.slice(0, end);
      // Naming an operator the evaluator rejects is the same defect as omitting one it accepts:
      // both send an author to a form that does not behave as the rule says it does.
      for (const op of ['==', '!=', '>=', '<=', '>', '<', '!', '&&', '||']) {
        expect(roster, `the operator roster in ${RULE_HOME} omits ${op}`).toContain(op);
      }
      expect(parseWhen('a == 1 && !b || c >= 2').ok).toBe(true);
    });

    it('is right that an unquoted word right of a comparison is a string literal', async () => {
      const rule = await gateEvaluationRule();
      if (rule === null) return;
      expect(rule).toContain('string literal');
      // The corpus reads `a == b` as a test against the text `b`, never against the variable.
      expect(evaluateWhenExpression('a == b', { a: 'b', b: 'something-else' })).toBe(true);
      expect(evaluateWhenExpression('a == b', { a: 'something-else', b: 'something-else' })).toBe(false);
    });

    it('is right that a comparison binds tighter than the negation in front of it', async () => {
      const rule = await gateEvaluationRule();
      if (rule === null) return;
      expect(rule, 'the rule states no binding order for `!` against a comparison').toContain('!(a == b)');
      // `a` is empty, so the two readings disagree and the result names which one runs: `!(a == b)`
      // negates a false comparison and holds, where `(!a) == b` would test true against the text `b`
      // and fail. The grammar puts a comparison at primary, inside unary, so the negation takes it
      // whole — and a negated left side is not expressible without parentheses of its own.
      expect(evaluateWhenExpression('!a == b', { a: '', b: 'unused' })).toBe(true);
      expect(evaluateWhenExpression('!a == b', { a: 'b', b: 'unused' })).toBe(false);
    });

    it('is right that comparison is identity, with no coercion', async () => {
      const rule = await gateEvaluationRule();
      if (rule === null) return;
      expect(evaluateWhenExpression('a == 5', { a: '5' })).toBe(false);
      expect(evaluateWhenExpression('a == 5', { a: 5 })).toBe(true);
    });

    it('is right that a bare name reads as truthiness and a missing path is falsy', async () => {
      const rule = await gateEvaluationRule();
      if (rule === null) return;
      expect(evaluateWhenExpression('a', { a: 'set' })).toBe(true);
      expect(evaluateWhenExpression('a', { a: '' })).toBe(false);
      expect(evaluateWhenExpression('a.b.c', { a: 1 })).toBe(false);
      expect(evaluateWhenExpression('a.b', { a: { b: true } })).toBe(true);
    });

    it('is right that ordering is false when either side is not a finite number', async () => {
      const rule = await gateEvaluationRule();
      if (rule === null) return;
      expect(evaluateWhenExpression('a > 1', { a: 'x' })).toBe(false);
      expect(evaluateWhenExpression('a > 1', { a: 2 })).toBe(true);
    });

    it('is right that an unparseable expression is false', async () => {
      const rule = await gateEvaluationRule();
      if (rule === null) return;
      expect(evaluateWhenExpression('a ===', { a: true })).toBe(false);
    });
  });
});
