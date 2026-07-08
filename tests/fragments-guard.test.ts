import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { collectFragmentViolations } from '../scripts/check-fragments.js';

/**
 * Shared-fragment guard (B10, issue #166): every rules `{ ref }` and checkpoint `ref` resolves,
 * every declared fragment is referenced, and shared content is not quietly re-inlined — an
 * inline copy of a fragment, or the same rule/checkpoint body authored inline at multiple sites,
 * is the declaration drift the fragment mechanism exists to end. Hard-zero over the corpus.
 */

const CORPUS_ROOT = resolve(import.meta.dirname, '../workflows');
const FIXTURE_ROOT = resolve(import.meta.dirname, 'fixtures/fragments');

describe('fragments guard (corpus)', () => {
  it('holds the corpus at zero violations', () => {
    const { violations } = collectFragmentViolations(CORPUS_ROOT);
    expect(violations).toEqual([]);
  });
});

describe('fragments guard (fixture corpus)', () => {
  const { violations, warnings } = collectFragmentViolations(FIXTURE_ROOT);
  const byRule = (rule: string) => violations.filter((v) => v.rule === rule);

  it('flags unresolved and dash-line refs', () => {
    expect(byRule('unresolved-ref').map((v) => v.file)).toEqual(['beta-fixture/activities/00-beta-activity.yaml']);
    expect(byRule('unresolved-ref')[0]!.detail).toContain('missing-gate');
    expect(byRule('ref-opens-step').map((v) => v.file)).toEqual(['beta-fixture/activities/00-beta-activity.yaml']);
  });

  it('flags a condition declared on both the step and its fragment', () => {
    expect(byRule('ref-body-conflict').map((v) => v.detail)).toEqual([
      expect.stringContaining("checkpoint 'beta-confirm' declares a condition"),
    ]);
  });

  it('flags fragment effects targeting variables the referencing workflow does not declare', () => {
    expect(byRule('undeclared-effect-variable').map((v) => v.detail)).toEqual([
      expect.stringContaining("sets 'scope_confirmed', which 'beta-fixture' does not declare"),
    ]);
  });

  it('flags unused fragments and inline copies of fragments', () => {
    expect(byRule('unused-fragment').map((v) => v.detail)).toEqual([
      expect.stringContaining('unused-fragment-rule'),
    ]);
    expect(byRule('inline-duplicate-of-fragment').map((v) => v.file)).toEqual(['beta-fixture/workflow.yaml']);
  });

  it('flags identical inline content authored at multiple sites', () => {
    expect(byRule('duplicate-rule').map((v) => v.detail)).toEqual([
      expect.stringContaining('2 workflows'),
    ]);
    expect(byRule('duplicate-checkpoint').map((v) => v.detail)).toEqual([
      expect.stringContaining('2 sites'),
    ]);
  });

  it('reports nothing beyond the engineered defects', () => {
    expect(violations).toHaveLength(8);
    expect(warnings).toEqual([]);
  });
});
