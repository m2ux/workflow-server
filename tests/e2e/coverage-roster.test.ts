import { describe, it, expect } from 'vitest';

import { liveCorpusRoot } from '../corpus-root.js';
import { indexCorpus } from '../../src/loaders/corpus-index.js';
import { loadRoster, rosterIds } from '../../scripts/roster.js';

/**
 * The coverage roster accounts for every workflow the corpus holds.
 *
 * A workflow on neither list is measured by nothing: the walk drives what `walked` names, and
 * `notWalked` carries the reason for each one it leaves to the uncovered list. This check costs
 * nothing, so it belongs in the suite every change runs rather than in the walk it guards — a
 * roster gap fails on the change that opens it.
 */
describe('coverage roster', () => {
  const root = liveCorpusRoot();
  const roster = root ? loadRoster(root) : null;

  /** Every workflow the corpus holds, so the two lists are checked against it rather than trusted. */
  function corpusWorkflows(): string[] {
    return [...indexCorpus(root!).workflows.keys()].sort();
  }

  it.skipIf(!roster)('accounts for every workflow the corpus holds', () => {
    const accounted = new Set(rosterIds(roster!));
    const corpus = corpusWorkflows();
    expect(corpus.length).toBeGreaterThan(0);
    expect(
      corpus.filter((w) => !accounted.has(w)),
      'this workflow is in the corpus but neither walked nor listed as not walked, so nothing '
      + 'measures its options. Add it to walks/roster.json walked, or to notWalked with the reason.',
    ).toEqual([]);
    expect(
      [...accounted].filter((w) => !corpus.includes(w)),
      'this workflow is named in the roster but is not in the corpus — remove it.',
    ).toEqual([]);
  });

  it.skipIf(!roster)('names each workflow once', () => {
    const all = rosterIds(roster!);
    expect(all.length, 'a workflow is on both lists, or twice on one').toBe(new Set(all).size);
  });
});
