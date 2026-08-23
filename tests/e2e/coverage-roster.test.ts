import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { corpusRoot } from '../corpus-root.js';
import { WALKED, NOT_WALKED } from './walked-workflows.js';

/**
 * The coverage roster accounts for every workflow the corpus holds.
 *
 * A workflow on neither list is measured by nothing: the walk drives what WALKED names, and
 * NOT_WALKED carries the reason for each one it leaves to the uncovered list. This check costs
 * nothing, so it belongs in the suite every change runs rather than in the walk it guards — a
 * roster gap fails on the change that opens it.
 */
describe('coverage roster', () => {
  /** Every workflow the corpus holds, so the two lists are checked against it rather than trusted. */
  function corpusWorkflows(): string[] {
    const root = corpusRoot();
    return readdirSync(root).filter((d) => existsSync(join(root, d, 'workflow.yaml'))).sort();
  }

  it('accounts for every workflow the corpus holds', () => {
    const accounted = new Set<string>([...WALKED, ...NOT_WALKED]);
    const corpus = corpusWorkflows();
    expect(corpus.length).toBeGreaterThan(0);
    expect(
      corpus.filter((w) => !accounted.has(w)),
      'this workflow is in the corpus but neither walked nor listed as not walked, so nothing '
      + 'measures its options. Add it to WALKED, or to NOT_WALKED with the reason.',
    ).toEqual([]);
    expect(
      [...accounted].filter((w) => !corpus.includes(w)),
      'this workflow is named in the roster but is not in the corpus — remove it.',
    ).toEqual([]);
  });

  it('names each workflow once', () => {
    const all = [...WALKED, ...NOT_WALKED];
    expect(all.length, 'a workflow is on both lists, or twice on one').toBe(new Set(all).size);
  });
});
