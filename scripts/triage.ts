/**
 * Per-finding triage, shared by the guards whose corpus carries debt (#327 R3).
 *
 * A guard that reports true findings the corpus has not yet worked down would be red forever, and a
 * suppressed count says nothing about whether the suppression was reasoned. A triage file records a
 * verdict per finding with a named rationale, so "harmless" and "live bug" are no longer the same
 * silence:
 *
 *   harmless   — the finding is correct about the structure and correct BY DESIGN; suppressed.
 *   fix-later  — a real seam to close, accepted as debt for now; suppressed but counted.
 *   live-bug   — affects a run; REPORTED, so the guard stays red until it is fixed.
 *
 * A finding absent from the file is untriaged and reported. An entry that matches nothing is stale
 * and reported. There is no regenerate flag: the file is edited by a human making a judgement.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { findingKey, type Finding } from './guard-protocol.js';

export type TriageVerdict = 'harmless' | 'fix-later' | 'live-bug';

export interface TriageEntry extends Finding {
  verdict: TriageVerdict;
  /** Key into the file's `rationales` map — the reason this verdict holds. */
  rationale: string;
}

export interface TriageFile {
  corpusSha: string;
  rationales: Record<string, string>;
  entries: TriageEntry[];
}

export function loadTriageFile(path: string): TriageFile {
  if (!existsSync(path)) return { corpusSha: '', rationales: {}, entries: [] };
  return JSON.parse(readFileSync(path, 'utf-8')) as TriageFile;
}

export interface TriagedResult {
  findings: Finding[];
  counts: Record<TriageVerdict | 'untriaged' | 'stale', number>;
  total: number;
}

export interface TriageOptions {
  /** Path of the triage file, named in the untriaged prompt so the reader knows where to classify. */
  file: string;
  /** Extra detail for a stale entry — what now satisfies the finding, where the guard can tell. */
  staleNote?: (entry: TriageEntry) => string | undefined;
}

/** Apply a triage file to a guard's findings: report the live and the unclassified, count the rest. */
export function applyTriage(findings: Finding[], triage: TriageFile, opts: TriageOptions): TriagedResult {
  const byKey = new Map(triage.entries.map((e) => [findingKey(e), e]));
  const seen = new Set<string>();
  const reported: Finding[] = [];
  const counts = { harmless: 0, 'fix-later': 0, 'live-bug': 0, untriaged: 0, stale: 0 };
  for (const finding of findings) {
    const key = findingKey(finding);
    const entry = byKey.get(key);
    if (!entry) {
      counts.untriaged++;
      reported.push({ ...finding, detail: `${finding.detail} [untriaged — classify it in ${opts.file}]` });
      continue;
    }
    seen.add(key);
    counts[entry.verdict]++;
    if (entry.verdict === 'live-bug') {
      const why = triage.rationales[entry.rationale] ?? entry.rationale;
      reported.push({ ...finding, detail: `${finding.detail} [live bug: ${why}]` });
    }
  }
  for (const [key, entry] of byKey) {
    if (seen.has(key)) continue;
    counts.stale++;
    // "No longer occurs" has two causes a reader must be able to tell apart: the seam was CLOSED, or
    // the guard stopped SEEING it. A note that names what now satisfies the finding makes the second
    // visible, so deleting the entry cannot quietly drop real debt out of the ledger.
    const note = opts.staleNote?.(entry);
    reported.push({
      check: 'stale-triage',
      site: entry.site,
      detail: note
        ? `triaged '${entry.check}' finding no longer occurs — ${note}; delete the entry only if that is a real closure`
        : `triaged '${entry.check}' finding no longer occurs — delete the entry from ${opts.file}`,
    });
  }
  return { findings: reported, counts, total: findings.length };
}

/**
 * How far the corpus has moved since these verdicts were made, or null where that cannot be
 * established. Report-only: see docs/development.md § Corpus-coupled baselines.
 */
export function triageStampNote(corpusSha: string, root: string): string | null {
  if (!corpusSha) return null;
  const head = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf-8' });
  if (head.status !== 0) return null;
  const current = head.stdout.trim();
  if (!current || current === corpusSha) return null;
  const behind = spawnSync('git', ['-C', root, 'rev-list', '--count', `${corpusSha}..${current}`], { encoding: 'utf-8' });
  const commits = behind.status === 0 ? behind.stdout.trim() : '';
  const distance = commits && commits !== '0' ? ` — ${commits} corpus commit(s) since` : '';
  return `triage verdicts were made against corpus ${corpusSha.slice(0, 12)}, `
    + `the checkout is at ${current.slice(0, 12)}${distance}`;
}

/** The count line a triaged guard prints above its findings. */
export function triageSummary(guard: string, result: TriagedResult): string {
  const { counts, total } = result;
  return `${guard}: ${total} violation(s) — ${counts.harmless} harmless, ${counts['fix-later']} fix-later, `
    + `${counts['live-bug']} live bug(s), ${counts.untriaged} untriaged`
    + `${counts.stale ? `, ${counts.stale} stale triage entr(ies)` : ''}\n`;
}
