import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { collectFragmentViolations } from '../scripts/check-fragments.js';

/**
 * Shared-fragment guard (B10, issue #166): every checkpoint `ref` resolves, every declared fragment
 * is referenced, and a shared checkpoint body is not quietly re-inlined. Rule text is held to a
 * different remedy — a rule authored in two workflows belongs in a conduct home, not in a fragment
 * (#519), so `duplicate-rule` is what fires for it. Hard-zero over the corpus.
 */

const FIXTURE_ROOT = resolve(import.meta.dirname, 'fixtures/fragments');

describe('fragments guard (fixture corpus)', () => {
  const violations = collectFragmentViolations(FIXTURE_ROOT);
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

  it('flags a declared fragment nothing references', () => {
    expect(byRule('unused-fragment').map((v) => v.detail)).toEqual([
      expect.stringContaining('unused-fragment-gate'),
    ]);
  });

  it('flags identical inline content authored at multiple sites', () => {
    // Rule text repeated across workflows is a home problem, so the remedy names a home.
    const duplicateRules = byRule('duplicate-rule');
    expect(duplicateRules).toHaveLength(2);
    for (const v of duplicateRules) {
      expect(v.detail).toContain('2 workflows');
      expect(v.detail).toContain('conduct technique whose audience it binds');
    }
    expect(byRule('duplicate-checkpoint').map((v) => v.detail)).toEqual([
      expect.stringContaining('2 sites'),
    ]);
  });

  it('reports nothing beyond the engineered defects', () => {
    expect(violations).toHaveLength(8);
  });
});
