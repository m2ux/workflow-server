/**
 * check-unserved-operation-refs — a technique that sends its reader to another operation.
 *
 * An operation is served only where a role's contract names it: `get_technique { technique_id }`
 * admits what the workflow techniques list, the activity techniques list, or the activity's own
 * `techniques[]` declare, and never what a step binds. A technique naming a sibling or a
 * cross-namespace operation therefore addresses something its reader cannot fetch — and the
 * markdown path beside it points into a corpus checkout the reader does not hold, so neither half
 * of the reference resolves. The prose reads as a route and is a dead end.
 *
 * The whole file is read, not one section of it. Where the reference sits changes what it is FOR
 * and changes nothing about whether it resolves: a Protocol step that applies a sibling is
 * unperformable, a Rule that names one is unfollowable, and an Inputs entry that cites one is
 * uninterpretable. All three send a reader somewhere it cannot go. A technique carries what its
 * reader needs or states the fact plainly; composition belongs to the routine or activity that
 * binds both operations as steps.
 *
 * Three spellings count, because the corpus writes the reference each way:
 *
 *   sibling          [op](./op.md), [op](../group/op.md) — a path to a technique file
 *   cross-namespace  [ns](/ns/techniques/TECHNIQUE.md)::[op](/ns/techniques/op.md)
 *   definition file  [run](/ns/routines/run.yaml) — a routine or activity the reader cannot open
 *
 * The third is the same dead end reached through a different extension. No route hands over a
 * definition file, and a role's own conduct forbids it opening one, so a link to `routines/x.yaml`
 * resolves for nobody — while naming a real path, which is what makes it worth reporting: an agent
 * working in a checkout that holds the file may simply go and read it, and what it finds there is
 * written in a dialect whose defaults differ from the one it holds the rules for.
 *
 * A link whose path lands under `resources/` is a resource citation and is passed over — a resource
 * is delivered alongside the technique that cites it, so that reference does resolve. READMEs are
 * not techniques: they orient an author rather than instructing a run, and are not read here.
 *
 * ## The ledger
 *
 * Every reference present when this guard lands is classified in
 * `ledgers/unserved-operation-ref-triage.json`, one entry per site, each carrying a verdict and a
 * named rationale — the shape `ledgers/binding-fidelity-triage.json` carries. The ledger is a set
 * of judgements rather than a snapshot to regenerate: there is no update flag, and a reference no
 * entry covers fails the guard. An entry whose site no longer holds a reference is reported stale,
 * so a fix takes its ledger row with it.
 *
 * Verdicts. Both suppress the finding — a classified reference is a judgement on record rather than
 * an open question — and the census line carries the split, so a passing guard never reads as "the
 * corpus holds none of these" while it holds hundreds:
 *
 *   accepted    the reference names a fact its reader can act on without fetching anything
 *   fix-later   a real dead end, not yet rehomed
 *
 * Run: npx tsx guards/check-unserved-operation-refs.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, corpusNamespaces, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const LEDGER = 'ledgers/unserved-operation-ref-triage.json';

/** A markdown link, label and target. */
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
/** A `## ` section heading, carried on the finding so a reader knows what the reference was for. */
const H2 = /^##\s+(.+?)\s*$/;

export interface Ref {
  /** `<path>:<line>` of the reference. */
  site: string;
  /** The operation the reference names, as the link's label reads it. */
  op: string;
  /** The `## ` section holding it, which says what the reference was for. */
  section: string;
}

export interface TriageEntry {
  site: string;
  op: string;
  verdict: 'accepted' | 'fix-later';
  rationale: string;
}

/**
 * Whether a link target names something the corpus holds and no route serves.
 *
 * The question is where the target LANDS, so a relative one is resolved against the directory of
 * the file citing it. Every scanned file already sits under a `techniques/` directory, so a sibling
 * `./op.md` and a cousin `../group/op.md` both land under one — and a path test applied to the
 * unresolved text answers for neither, because such a text carries a slash and does not carry
 * `techniques/`. Resolving first is what makes the spellings one question.
 *
 * A target under `resources/` is a resource citation, which resolves: a resource travels with the
 * technique that cites it.
 *
 * A definition file is the other unserved target. It is reached by extension rather than by
 * directory, because a routine and an activity sit in folders of their own and neither is anything
 * a reader can fetch.
 */
function namesTechnique(target: string, fromDir: string): boolean {
  const text = target.split('#')[0] ?? '';
  if (text.includes('://')) return false;
  if (text.endsWith('README.md')) return false;
  const isDefinition = text.endsWith('.yaml') || text.endsWith('.yml');
  if (!text.endsWith('.md') && !isDefinition) return false;
  // A workflow-anchored target (`/ns/techniques/op.md`) is already absolute within the corpus;
  // anything else is relative to the citing file.
  const landed = text.startsWith('/') ? text : resolve(fromDir, text);
  if (landed.includes('/resources/')) return false;
  if (isDefinition) return true;
  return landed.includes('/techniques/') || landed.includes('techniques/');
}

/** Record every technique link in one technique file, wherever in it they sit. */
function scanFile(path: string, rel: string, refs: Ref[]): void {
  const fromDir = dirname(path);
  let section = 'frontmatter';
  readFileSync(path, 'utf-8').split('\n').forEach((line, i) => {
    const head = H2.exec(line);
    if (head) { section = head[1]!.trim(); return; }
    for (const match of line.matchAll(LINK)) {
      const [, label, target] = match;
      if (namesTechnique(target!, fromDir)) refs.push({ site: `${rel}:${i + 1}`, op: label!, section });
    }
  });
}

function scanDir(dir: string, root: string, refs: Ref[]): number {
  if (!existsSync(dir)) return 0;
  let scanned = 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isFile() && entry.endsWith('.md') && entry !== 'README.md') {
      scanFile(p, relative(root, p), refs);
      scanned++;
    } else if (st.isDirectory()) scanned += scanDir(p, root, refs);
  }
  return scanned;
}

export function collectRefs(root: string = DEFAULT_ROOT): Ref[] {
  const refs: Ref[] = [];
  let scanned = 0;
  for (const { dir } of corpusNamespaces(root)) {
    scanned += scanDir(join(dir, 'techniques'), root, refs);
  }
  assertScanned(scanned, 'technique files', root);
  return refs;
}

function readLedger(root: string): TriageEntry[] {
  const path = join(root, LEDGER);
  if (!existsSync(path)) return [];
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf-8'));
  const entries = (parsed as { entries?: TriageEntry[] }).entries;
  return Array.isArray(entries) ? entries : [];
}

/** A ledger key drops the line number, so a reference does not re-open when a file above it grows. */
function key(site: string, op: string): string {
  return `${site.replace(/:\d+$/, '')} ${op}`;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const refs = collectRefs(root);
  const triaged = new Map(readLedger(root).map((e) => [key(e.site, e.op), e]));
  const seen = new Set<string>();
  const findings: Finding[] = [];

  for (const ref of refs) {
    const k = key(ref.site, ref.op);
    seen.add(k);
    if (triaged.has(k)) continue;
    findings.push({
      check: 'unserved-operation-ref',
      site: ref.site,
      detail: `${ref.section} names '${ref.op}', an operation its reader is not served and whose path it cannot resolve`
        + ' — bind the operation as a step of the run that needs both, or carry the fact the reference stood for;'
        + ` classify it in ${LEDGER} if it stays`,
    });
  }

  for (const [k, entry] of triaged) {
    if (!seen.has(k)) {
      findings.push({
        check: 'stale-triage',
        site: entry.site,
        detail: `ledger classifies a reference to '${entry.op}' that the file no longer holds`
          + ' — delete the entry with the change that closed it',
      });
    }
  }
  return findings;
}

/** What the ledger classified, printed so a pass never reads as an empty corpus. */
function census(root: string): void {
  if (process.argv.includes('--json')) return;
  const entries = readLedger(root);
  const accepted = entries.filter((e) => e.verdict === 'accepted').length;
  const later = entries.filter((e) => e.verdict === 'fix-later').length;
  const files = new Set(entries.map((e) => e.site.replace(/:\d+$/, ''))).size;
  process.stdout.write(
    `unserved-operation-refs: ${entries.length} classified reference(s) across ${files} file(s)`
    + ` — ${accepted} accepted, ${later} fix-later\n`,
  );
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  // Census runs inside the guarded block, so an unreachable corpus exits 2 with its reason rather
  // than throwing past the handler — a measurement that failed is not a corpus with nothing wrong.
  const collect = (root: string): Finding[] => { census(root); return collectFindings(root); };
  await runGuard('unserved-operation-refs', () => requireWorkflowsRoot(DEFAULT_ROOT), collect, {
    okMessage: 'no technique sends its reader to an operation it was not served',
    remedy: `bind the operation as a step of the run that needs both, or carry the fact; classify what stays in ${LEDGER}`,
  });
}
