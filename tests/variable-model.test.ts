import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';
import { lintDeclarations, lintDocument } from '../guards/check-variable-model.js';

/**
 * Variable-model guard (B7, issue #166): the corpus stays coherent with the
 * seeded variable model — no exists/notExists gates on defaulted variables,
 * defaults match their declared type, setVariable literals match the target's
 * declared type (template passthroughs exempt) and target declared variables.
 * Hard-zero over the corpus.
 */

const DECLS = new Map([
  ['review_needed', { type: 'boolean', hasDefault: true, defaultValue: false }],
  ['repo_root', { type: 'string', hasDefault: false, defaultValue: undefined }],
  ['finding_items', { type: 'array', hasDefault: true, defaultValue: '[]' }],
]);

describe('variable-model guard', () => {
  it('flags exists/notExists gates on defaulted variables only', () => {
    const doc = parse(`
steps:
  - kind: technique
    id: gated-step
    condition:
      type: and
      conditions:
        - { type: simple, variable: review_needed, operator: notExists }
        - { type: simple, variable: repo_root, operator: exists }
`);
    expect(lintDocument(doc, DECLS, 'x.yaml').map(v => v.rule)).toEqual(['exists-on-defaulted']);
  });

  it('does not match dotted paths against declaration names', () => {
    const doc = parse('condition: { type: simple, variable: review_needed.nested, operator: exists }');
    expect(lintDocument(doc, DECLS, 'x.yaml')).toEqual([]);
  });

  it('flags a defaultValue that mismatches its own declared type', () => {
    expect(lintDeclarations(DECLS, 'workflow.yaml').map(v => `${v.rule} ${v.detail}`))
      .toEqual(["default-type-mismatch 'finding_items': defaultValue is string but the variable is declared array"]);
  });

  it('flags setVariable type mismatches and undeclared targets, exempting {name} templates', () => {
    const doc = parse(`
options:
  - id: pick
    effect:
      setVariable:
        review_needed: "yes"
        repo_root: "{finding_items}"
        phantom_value: true
`);
    expect(lintDocument(doc, DECLS, 'x.yaml').map(v => v.rule).sort())
      .toEqual(['setvariable-type-mismatch', 'setvariable-undeclared']);
  });

  it('accepts matching assignments', () => {
    const doc = parse('effect: { setVariable: { review_needed: true, repo_root: some/path } }');
    expect(lintDocument(doc, DECLS, 'x.yaml')).toEqual([]);
  });

  describe('declared value sets (#518 W5.4)', () => {
    const SET_DECLS = new Map([
      ...DECLS,
      ['operation_type', { type: 'string', hasDefault: false, defaultValue: undefined, values: ['create', 'update', 'review'] }],
    ]);

    it('flags a setVariable literal outside the declared set', () => {
      const doc = parse('effect: { setVariable: { operation_type: audit } }');
      expect(lintDocument(doc, SET_DECLS, 'x.yaml').map(v => `${v.rule} ${v.detail}`))
        .toEqual(['setvariable-outside-value-set setVariable \'operation_type\': "audit" is outside the declared value set [create, update, review]']);
    });

    it('admits a member, and exempts a {name} passthrough', () => {
      const doc = parse('options: [{ effect: { setVariable: { operation_type: update } } }, { effect: { setVariable: { operation_type: "{chosen_operation}" } } }]');
      expect(lintDocument(doc, SET_DECLS, 'x.yaml')).toEqual([]);
    });

    it('leaves a variable with no declared set unconstrained', () => {
      const doc = parse('effect: { setVariable: { repo_root: anything/at/all } }');
      expect(lintDocument(doc, SET_DECLS, 'x.yaml')).toEqual([]);
    });
  });

  /**
   * A routine file is its own name scope (#704), so the same rules run against the routine's own
   * three declaration lists rather than the workflow's. The direction inverts: inside a routine an
   * output or an internal satisfies `setvariable-undeclared` and a workflow variable violates it.
   *
   * These drive `lintDocument` with a routine-scoped map directly, which is the same way the four
   * cases above drive it with a workflow-scoped one — the guard's own collector builds the map from
   * the routine file, and the rules are what these pin.
   */
  describe('a routine file as its own name scope (#704)', () => {
    /** What `routineDeclarations` builds: outputs carry a type, internals carry nothing. */
    const ROUTINE_DECLS = new Map([
      ['run_verdict', { type: 'string', hasDefault: false, defaultValue: undefined, values: ['resolved', 'deferred'] }],
      ['interim_finding', { hasDefault: false, defaultValue: undefined }],
      ['decision_space', { hasDefault: true, defaultValue: 'resolve-or-defer' }],
    ]);

    it('admits a setVariable naming a declared output', () => {
      const doc = parse('effect: { setVariable: { run_verdict: resolved } }');
      expect(lintDocument(doc, ROUTINE_DECLS, 'r.yaml')).toEqual([]);
    });

    it('admits a setVariable naming an internal', () => {
      const doc = parse('effect: { setVariable: { interim_finding: noted } }');
      expect(lintDocument(doc, ROUTINE_DECLS, 'r.yaml')).toEqual([]);
    });

    it('flags a setVariable naming a WORKFLOW variable — the arm that points the other way', () => {
      // `repo_root` is declared by the workflow and is not in the routine's scope, so inside a
      // routine file it is exactly the undeclared name the rule is for.
      const doc = parse('effect: { setVariable: { repo_root: /somewhere } }');
      expect(lintDocument(doc, ROUTINE_DECLS, 'r.yaml').map((v) => v.rule))
        .toEqual(['setvariable-undeclared']);
    });

    it('checks a literal against an output\'s type and value set, and stays silent on an internal', () => {
      const typed = parse('effect: { setVariable: { run_verdict: 3 } }');
      expect(lintDocument(typed, ROUTINE_DECLS, 'r.yaml').map((v) => v.rule))
        .toEqual(['setvariable-type-mismatch', 'setvariable-outside-value-set']);
      // An internal declares no type and no value set, so neither rule has a subject.
      const untyped = parse('effect: { setVariable: { interim_finding: 3 } }');
      expect(lintDocument(untyped, ROUTINE_DECLS, 'r.yaml')).toEqual([]);
    });

    it('flags an exists gate on a defaulted INPUT, constant for the reason it is on a defaulted variable', () => {
      const doc = parse('condition: { type: simple, variable: decision_space, operator: exists }');
      expect(lintDocument(doc, ROUTINE_DECLS, 'r.yaml').map((v) => v.rule))
        .toEqual(['exists-on-defaulted']);
    });

    it('checks a routine input\'s default against a declared type', () => {
      const mismatched = new Map([['page_limit', { type: 'number', hasDefault: true, defaultValue: 'ten' }]]);
      expect(lintDeclarations(mismatched, 'r.yaml').map((v) => v.rule)).toEqual(['default-type-mismatch']);
    });
  });
});
