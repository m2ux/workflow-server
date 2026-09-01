import { describe, it, expect } from 'vitest';
import { loadTriage } from '../scripts/check-binding-fidelity.js';

/**
 * The guard holds the ledger against the corpus: a finding with no entry is untriaged, an entry
 * matching no finding is stale, and an entry citing the wrong line is misplaced. All three need the
 * corpus to decide, so the sweep owns them.
 *
 * What is left is the ledger against itself — the vocabulary its entries are written in, which is
 * decidable from the file alone and which the guard never reads while no verdict is `live-bug`.
 */
describe('binding-fidelity triage ledger', () => {
  const triage = loadTriage();

  it('cites every rationale it declares', () => {
    const cited = new Set(triage.entries.map((e) => e.rationale));
    const uncited = Object.keys(triage.rationales).filter((name) => !cited.has(name)).sort();
    expect(
      uncited,
      'a reason no entry cites reads as a carve-out in force and suppresses nothing — delete it, '
      + "and record the closure in the file's note if the class is worth remembering",
    ).toEqual([]);
  });

  it('declares every rationale it cites', () => {
    // A verdict's reason degrades to the bare key when the map has no entry for it, so an undeclared
    // name reads as a rationale in the report while stating nothing.
    const undeclared = triage.entries
      .map((e) => e.rationale)
      .filter((name) => !(name in triage.rationales))
      .sort();
    expect(undeclared, 'an entry naming a reason the file does not define').toEqual([]);
  });

  it('gives every entry a verdict the guard acts on', () => {
    const verdicts = new Set(['harmless', 'fix-later', 'live-bug']);
    const wrong = triage.entries.filter((e) => !verdicts.has(e.verdict)).map((e) => e.site).sort();
    expect(wrong, 'an entry whose verdict is none of harmless, fix-later or live-bug').toEqual([]);
  });

  it('states the corpus its verdicts were made against', () => {
    expect(triage.corpusSha, 'the ledger records no corpus, so no drift can be reported')
      .toMatch(/^[0-9a-f]{40}$/);
  });
});
