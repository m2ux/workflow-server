import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { TRIAGE_PATH } from '../guards/check-section-framing.js';

/**
 * The `section-framing` guard reports untriaged sites; the judgement for each lives in
 * `ledgers/section-framing-triage.json`. The guard does not read that file's shape, so this does.
 */
const triage = existsSync(TRIAGE_PATH)
  ? JSON.parse(readFileSync(TRIAGE_PATH, 'utf-8')) as {
    rationales: Record<string, string>;
    entries: Array<{ site: string; verdict: string; rationale: string; owed?: string }>;
  }
  : null;

describe.skipIf(triage === null)('section-framing triage', () => {

  it('gives every entry a verdict this file defines and a rationale it names', () => {
    const verdicts = new Set(['harmless', 'fix-later']);
    for (const e of triage!.entries) {
      expect(verdicts, `${e.site} carries an unknown verdict`).toContain(e.verdict);
      expect(Object.keys(triage!.rationales), `${e.site} names an undefined rationale`).toContain(e.rationale);
    }
  });

  it('records what a fix-later site owes, so the debt is legible without re-reading the file', () => {
    for (const e of triage!.entries.filter((x) => x.verdict === 'fix-later')) {
      expect(e.owed, `${e.site} is deferred without naming the rule it strands`).toBeTruthy();
    }
  });

  it('carries no duplicate sites', () => {
    const sites = triage!.entries.map((e) => e.site);
    expect(sites.length).toBe(new Set(sites).size);
  });
});
