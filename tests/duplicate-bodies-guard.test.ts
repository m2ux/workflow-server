import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { collectDuplicateViolations } from '../guards/check-duplicate-bodies.js';

/**
 * Duplicated inline content (#738 W01): the same rule text authored in two workflows, and the same
 * checkpoint body authored at two sites. Both remedies name a home — a conduct technique for a rule,
 * a routine for a gate — so the detail is asserted rather than just the count, a message naming the
 * wrong remedy being the failure that survives a passing count.
 *
 * Hard-zero over the corpus; the fixture carries exactly two engineered defects.
 */

const FIXTURE_ROOT = resolve(import.meta.dirname, 'fixtures/duplicate-bodies');

describe('duplicate-bodies guard (fixture corpus)', () => {
  const violations = collectDuplicateViolations(FIXTURE_ROOT);
  const byRule = (rule: string) => violations.filter((v) => v.rule === rule);

  it('flags one rule text authored in two workflows, and names a conduct home', () => {
    const duplicates = byRule('duplicate-rule');
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]!.detail).toContain('2 workflows');
    expect(duplicates[0]!.detail).toContain('conduct technique whose audience it binds');
  });

  it('flags one checkpoint body authored at two sites, and names a routine', () => {
    const duplicates = byRule('duplicate-checkpoint');
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]!.detail).toContain('2 sites');
    expect(duplicates[0]!.detail).toContain('declare it as a routine');
  });

  it('reports nothing beyond the engineered defects', () => {
    expect(violations).toHaveLength(2);
  });
});
