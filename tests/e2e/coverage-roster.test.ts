import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { corpusRoot } from '../corpus-root.js';
import { WALKED, NOT_WALKED } from './walked-workflows.js';

/**
 * The coverage roster accounts for every workflow the corpus holds.
 *
 * This costs nothing to check and used to sit inside the coverage walk, which runs on a push to main
 * and takes about thirteen minutes — so a workflow added to the corpus and to neither list was
 * measured by nothing, and nothing said so until someone merged. The assertion belongs where it can
 * fail on the change that causes it.
 *
 * The walk itself stays where it is: it is slow because it is a walk, and no amount of moving it
 * makes it fast.
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
