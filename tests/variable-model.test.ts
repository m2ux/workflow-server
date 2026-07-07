import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';
import {
  collectVariableModelViolations,
  lintDeclarations,
  lintDocument,
} from '../scripts/check-variable-model.js';

/**
 * Variable-model guard (B7, issue #166): the corpus stays coherent with the
 * seeded variable model — no exists/notExists gates on defaulted variables,
 * defaults match their declared type, setVariable literals match the target's
 * declared type (template passthroughs exempt) and target declared variables.
 * Hard-zero over the corpus.
 */

const DECLS = new Map([
  ['review_needed', { type: 'boolean', hasDefault: true, defaultValue: false }],
  ['reference_path', { type: 'string', hasDefault: false, defaultValue: undefined }],
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
        - { type: simple, variable: reference_path, operator: exists }
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
        reference_path: "{finding_items}"
        phantom_value: true
`);
    expect(lintDocument(doc, DECLS, 'x.yaml').map(v => v.rule).sort())
      .toEqual(['setvariable-type-mismatch', 'setvariable-undeclared']);
  });

  it('accepts matching assignments', () => {
    const doc = parse('effect: { setVariable: { review_needed: true, reference_path: some/path } }');
    expect(lintDocument(doc, DECLS, 'x.yaml')).toEqual([]);
  });

  it('the corpus is coherent with the seeded variable model', () => {
    expect(collectVariableModelViolations().map(v => `[${v.rule}] ${v.file}: ${v.detail}`)).toEqual([]);
  });
});
