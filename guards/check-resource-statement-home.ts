#!/usr/bin/env npx tsx
/**
 * A statement a resource makes has one home in the corpus.
 *
 * A resource holds what other layers consult: a template, a vocabulary, criteria, policy. The
 * value of that arrangement is that one statement is read from one place, so correcting it
 * corrects every reader. The same statement written into a second resource defeats it twice over:
 * the copies drift with nothing holding them together, and a reader who finds one has no way to
 * know the other exists.
 *
 * Two shapes carry a statement, and both are checked:
 *
 *   `duplicate-section` — two resources whose section under one heading has the same body.
 *   `duplicate-table`   — the same table authored in two resources, under any heading.
 *
 * A table is checked apart from its section because restating one under a new heading is the
 * ordinary way a copy enters: the heading differs, so a section comparison alone reads the two as
 * unrelated while the rows a consumer acts on are identical.
 *
 * What is NOT a finding, because a corpus that forbade it would be worse:
 *
 * - A short body. Below {@link MIN_BODY_LENGTH} characters a match is a shared turn of phrase —
 *   "Omit if none", a one-line note — rather than a statement with a home.
 * - A table of fewer than {@link MIN_TABLE_ROWS} body rows. Two-row tables repeat legitimately:
 *   the same two-column key, the same yes/no pair.
 * - Two sections of ONE resource. A resource is free to arrange its own content; the defect here
 *   is a second home, and one file is one home.
 * - A heading with no body, and a body that is only a link.
 *
 * The comparison is over resources alone. A technique restating what a resource owns is
 * `no-technique-resource-dual-home` in the canon, which keys on the technique rather than on the
 * pair, and a rule or checkpoint written twice is `duplicate-bodies`.
 *
 * A duplication already in the corpus when this guard arrived is triaged in
 * `ledgers/resource-statement-home-triage.json`, with a verdict and a named rationale, or it is
 * reported. An entry matching nothing is stale and reported too, so the triage cannot outlive the
 * prose it describes. A site is keyed by the reference that reaches it rather than by a path from
 * the corpus root, so the entry survives a tree that joins this corpus under a grouping path.
 *
 * Run: npx tsx guards/check-resource-statement-home.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runGuard, type Finding } from './guard-protocol.js';
import { assertScanned, citePath, corpusNamespaces, defaultCorpusDest, ledgerPath, requireWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** Below this, a matching body is a shared turn of phrase rather than a statement with a home. */
export const MIN_BODY_LENGTH = 120;

/** Below this, a matching table is a shared key rather than a statement with a home. */
export const MIN_TABLE_ROWS = 3;

/** One site a statement is authored at. */
interface Site {
  /** The reference that reaches the resource, which a triage entry is keyed by. */
  file: string;
  /** The heading the statement sits under, for a reader going to look at it. */
  heading: string;
}

/** A judgement already made about one duplication. */
interface TriageEntry {
  site: string;
  verdict: string;
  rationale: string;
}

interface Triage {
  rationales?: Record<string, string>;
  entries?: TriageEntry[];
}

/** The triage ledger on the pointed-at corpus tree. */
export function triagePath(root: string): string {
  return ledgerPath(root, 'resource-statement-home-triage.json');
}

/** The key a group of sites is triaged under: every site that holds the statement, in order. */
const groupKey = (sites: readonly Site[]): string => sites.map((s) => s.file).sort().join(' + ');

const normalise = (text: string): string => text.trim().replace(/\s+/g, ' ').toLowerCase();

/** Every `.md` under a namespace's `resources/`, at any depth. */
function resourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...resourceFiles(path));
    else if (entry.endsWith('.md') && entry !== 'README.md') out.push(path);
  }
  return out;
}

/** A resource's body with its front matter and fenced blocks removed.
 *
 *  A fence shows markup rather than stating anything, and two resources illustrating one shape are
 *  not two homes for it. Front matter carries the id and description, which differ by file anyway.
 */
export function readableLines(text: string): string[] {
  const lines = text.split('\n');
  let at = 0;
  if (lines[0]?.trim() === '---') {
    const close = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    if (close !== -1) at = close + 1;
  }
  const out: string[] = [];
  let fenced = false;
  for (const line of lines.slice(at)) {
    if (/^\s{0,3}(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    out.push(fenced ? '' : line);
  }
  return out;
}

/** Each heading of a resource and the body beneath it, down to the next heading of any level. */
export function sections(lines: readonly string[]): Array<{ heading: string; body: string }> {
  const out: Array<{ heading: string; body: string }> = [];
  let heading: string | null = null;
  let body: string[] = [];
  const close = (): void => {
    if (heading !== null) out.push({ heading, body: body.join('\n') });
  };
  for (const line of lines) {
    const matched = /^\s{0,3}(#{1,6})\s+(.*)$/.exec(line);
    if (matched) {
      close();
      heading = matched[2]!.trim();
      body = [];
      continue;
    }
    if (heading !== null) body.push(line);
  }
  close();
  return out;
}

/** Each table in a resource, as its body rows alone.
 *
 *  The header and its delimiter are dropped: two tables of one subject share them, and what a
 *  consumer acts on is the rows.
 */
export function tables(lines: readonly string[]): string[][] {
  const out: string[][] = [];
  let run: string[] = [];
  const close = (): void => {
    const rows = run.filter((row) => !/^\s*\|[\s|:-]*\|\s*$/.test(row));
    if (rows.length > 1) out.push(rows.slice(1));
    run = [];
  };
  for (const line of lines) {
    if (/^\s*\|.*\|\s*$/.test(line)) run.push(line);
    else close();
  }
  close();
  return out;
}

/** A body carrying nothing a second home could drift from. */
function immaterial(body: string): boolean {
  const text = body.trim();
  if (text.length < MIN_BODY_LENGTH) return true;
  // A body that is only links states nothing of its own: an index pointing at the homes.
  return text.split('\n').every((line) => line.trim() === '' || /^\s*[-*]?\s*\[[^\]]+\]\([^)]+\)\s*$/.test(line.trim()));
}

/** Resource statements authored at more than one site under `root`. */
export function collect(root: string): { findings: Finding[]; scanned: number } {
  const bySection = new Map<string, Site[]>();
  const byTable = new Map<string, Site[]>();
  let scanned = 0;

  for (const { dir } of corpusNamespaces(root)) {
    for (const path of resourceFiles(join(dir, 'resources'))) {
      scanned += 1;
      const file = citePath(root, path);
      const lines = readableLines(readFileSync(path, 'utf-8'));

      for (const { heading, body } of sections(lines)) {
        if (immaterial(body)) continue;
        const key = normalise(body);
        const sites = bySection.get(key) ?? [];
        if (!sites.some((site) => site.file === file)) sites.push({ file, heading });
        bySection.set(key, sites);
      }

      for (const rows of tables(lines)) {
        if (rows.length < MIN_TABLE_ROWS) continue;
        const key = rows.map(normalise).join('\n');
        const sites = byTable.get(key) ?? [];
        if (!sites.some((site) => site.file === file)) sites.push({ file, heading: 'a table' });
        byTable.set(key, sites);
      }
    }
  }

  const triageFile = triagePath(root);
  const triage: Triage = existsSync(triageFile)
    ? (JSON.parse(readFileSync(triageFile, 'utf-8')) as Triage)
    : {};
  const judged = new Map((triage.entries ?? []).map((entry) => [entry.site, entry]));
  const matched = new Set<string>();

  const findings: Finding[] = [];
  const report = (check: string, groups: Map<string, Site[]>, what: string): void => {
    for (const sites of groups.values()) {
      if (sites.length < 2) continue;
      const key = groupKey(sites);
      const entry = judged.get(key);
      if (entry) {
        matched.add(key);
        if (triage.rationales && !(entry.rationale in triage.rationales)) {
          findings.push({
            check: 'unnamed-rationale',
            site: key,
            detail: `the triage entry names rationale '${entry.rationale}', which the ledger does not define`,
          });
        }
        continue;
      }
      const [first, ...rest] = sites;
      findings.push({
        check,
        site: `${first!.file} (${first!.heading})`,
        detail:
          `${what} is authored here and at ${rest.map((s) => `${s.file} (${s.heading})`).join(', ')} — `
          + 'keep one home and cite it from the other at section grain',
      });
    }
  };
  report('duplicate-section', bySection, 'this section body');
  report('duplicate-table', byTable, 'this table');

  for (const site of judged.keys()) {
    if (matched.has(site)) continue;
    findings.push({
      check: 'stale-triage',
      site,
      detail: 'the triage judges a duplication the corpus no longer holds — remove the entry',
    });
  }
  return { findings, scanned };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runGuard('resource-statement-home', () => requireWorkflowsRoot(DEFAULT_ROOT), (root) => {
    const { findings, scanned } = collect(root);
    assertScanned(scanned, 'resources', root);
    return findings;
  }, {
    okMessage: 'no resource statement is authored at two sites',
    remedy: 'keep the statement in one resource and cite that section from the other, per Cite Resources at Section Grain',
  });
}
