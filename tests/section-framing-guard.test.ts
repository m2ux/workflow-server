import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { TRIAGE_PATH } from '../scripts/check-section-framing.js';

/**
 * The `section-framing` guard reports untriaged sites; the judgement for each lives in
 * `section-framing-triage.json`. The guard does not read that file's shape, so this does.
 */
describe('section-framing triage', () => {
  const triage = JSON.parse(
    readFileSync(TRIAGE_PATH, 'utf-8'),
  ) as { rationales: Record<string, string>; entries: Array<{ site: string; verdict: string; rationale: string; owed?: string }> };

  it('gives every entry a verdict this file defines and a rationale it names', () => {
    const verdicts = new Set(['harmless', 'fix-later']);
    for (const e of triage.entries) {
      expect(verdicts, `${e.site} carries an unknown verdict`).toContain(e.verdict);
      expect(Object.keys(triage.rationales), `${e.site} names an undefined rationale`).toContain(e.rationale);
    }
  });

  it('records what a fix-later site owes, so the debt is legible without re-reading the file', () => {
    for (const e of triage.entries.filter((x) => x.verdict === 'fix-later')) {
      expect(e.owed, `${e.site} is deferred without naming the rule it strands`).toBeTruthy();
    }
  });

  it('carries no duplicate sites', () => {
    const sites = triage.entries.map((e) => e.site);
    expect(sites.length).toBe(new Set(sites).size);
  });
});
