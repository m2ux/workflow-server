import { describe, it, expect } from 'vitest';
import { applyTriage, loadTriage } from '../scripts/check-binding-fidelity.js';

/**
 * Binding-fidelity gate. The corpus carries triaged debt, recorded per finding with a verdict and a
 * rationale in scripts/binding-fidelity-triage.json; this asserts the two states that must never
 * ship: a finding nobody has judged, and a finding judged a live bug.
 *
 * There is no baseline and no re-snapshot command. A new finding is classified by hand — the act the
 * retired baseline let a `--update-baseline` skip, which is how two live defects reached a session
 * (#324 A1/A2). "Did MY change add this?" is `npm run check:delta`.
 */
describe('binding-fidelity gate', () => {
  const { findings, counts, total } = applyTriage();

  it('leaves no finding untriaged and no live bug unfixed', () => {
    expect(findings.map((v) => `[${v.check}] ${v.site} — ${v.detail}`)).toEqual([]);
  });

  it('accounts for every violation with a verdict', () => {
    expect(counts.harmless + counts['fix-later'] + counts['live-bug'] + counts.untriaged).toBe(total);
    expect(counts.untriaged).toBe(0);
  });

  it('names a rationale that the triage file defines for every entry', () => {
    const triage = loadTriage();
    const undefinedRationales = triage.entries
      .filter((e) => !(e.rationale in triage.rationales))
      .map((e) => `${e.site}: ${e.rationale}`);
    expect(undefinedRationales).toEqual([]);
  });
});
