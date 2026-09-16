/**
 * check-repeated-runs — a run of steps carried at two or more sites, and what differs between the
 * copies.
 *
 * An activity composes work by listing steps. When the same sequence of steps is wanted in a second
 * activity there is no construct that names it, so it is copied — and once copied the two halves
 * drift, because nothing holds them together. The drift is invisible: each activity reads correctly
 * on its own, and the differences only exist between files nobody diffs. This guard is what makes
 * them visible, and the population it reports is the constituency any shared-run construct would
 * serve.
 *
 * ## What counts as the same step
 *
 * Two steps match when they are the same kind doing the same bound work. Each step reduces to a
 * signature that keeps what the run *is* and drops what a site is free to vary:
 *
 *   technique    the operation reference, plus the sorted keys of its input bindings
 *   checkpoint   the shared-body reference, or the sorted ids of its inline options
 *   action       the sorted `verb=target` pairs, or `marker` for a step that carries none
 *   loop         the iteration type, the collection, and the signatures of its own body
 *
 * Identifiers, `when` gates, `condition` blocks, `continueWhile`, `breakCondition`, `maxIterations`,
 * option labels and prose sign as nothing. Those are the fields a site legitimately varies, so two
 * copies differing only there are still one run — and the difference is the finding's content rather
 * than a reason to split the run in two.
 *
 * ## What counts as one window
 *
 * Every consecutive window of two to eight steps is indexed, and a window appearing in two or more
 * activity FILES is a shared run. A window is dropped when a longer shared window over the
 * *identical* file set contains it as a contiguous run of signatures — the longer window is the same
 * fact stated more completely. Containment is tested with the window delimiter on both ends, so
 * `A | B` is not read as sitting inside `AA | BB`. A longer window over a *different* file set
 * suppresses nothing: a three-step run at two sites and its two-step head at four are two facts, and
 * the wider one is the one a construct would have to serve.
 *
 * Loop bodies are windowed as sequences of their own as well as signing into their parent's window,
 * so a run shared only inside two loop bodies is reported. Its depth is the shallowest nesting it was
 * seen at. Repetition inside a single file is outside the grain: the population is what two sites
 * carry, so a file that repeats a run internally contributes one occurrence to its file set and its
 * copies to the difference report.
 *
 * A run longer than the eight-step ceiling reports as the overlapping windows that fit inside it, so
 * a window that reaches the ceiling is worth raising rather than accepting.
 *
 * ## What the report carries
 *
 * A run's differences are the finding's content: which step position differs, and in which field.
 * The census line carries how many of the population differ at all, so a passing guard never reads
 * as "nothing is copied" while the corpus carries copied runs, and a provisional run is printed with
 * its differences in full. A difference appearing inside an already-classified run needs no ledger
 * edit — the ledger classifies the run, not the state of its copies, so the population is what rises
 * and falls.
 *
 * ## The baseline
 *
 * Every shared run present when this guard lands is classified in `repeated-run-baseline.json`, one
 * entry per run, each carrying a verdict and a named rationale. The baseline is not a snapshot to
 * regenerate: an entry is a judgement about one run, in the same spirit as
 * `ledgers/binding-fidelity-triage.json`. There is no update flag, and adding a run that no entry
 * classifies fails the guard.
 *
 *   converging   a run a named stage of the shared-run plan removes; suppressed, counted
 *   unassigned   a real repeated run no stage claims; suppressed, counted
 *   provisional  a run whose existence turns on an open finding; NAMED IN EVERY RUN, not suppressed
 *
 * So the baseline can only fall. Closing a run means deleting its entry: an entry matching no shared
 * run is reported (`repeated-run-baseline-stale`), which makes a migration's effect on the population
 * a diff of this file rather than a comparison of two guard runs.
 *
 * A verdict outside those three is reported rather than honoured, so a typo cannot suppress a run
 * silently.
 *
 * Run: npx tsx guards/check-repeated-runs.ts [--root <workflows-dir>] [--json]
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertScanned, citePath, corpusWorkflows, defaultCorpusDest, definitionsUnder, ledgerPath, UnreachableCorpusError } from './workflows-root.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { EXIT_UNMEASURED, report, requireRootOrExit, wantsJson, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const BASELINE_FILE = 'repeated-run-baseline.json';

/** A run is two or more consecutive steps; the ceiling bounds the index, not the corpus. */
const MIN_WINDOW = 2;
const MAX_WINDOW = 8;

/** The window delimiter, also the containment anchor. */
const SEP = ' | ';

type Step = Record<string, unknown>;

function isRecord(value: unknown): value is Step {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/* ------------------------------- step signatures ------------------------------- */

/** The operation a technique step binds, in either the bare-string or the structured form. */
function opReference(binding: unknown): string {
  if (typeof binding === 'string') return binding;
  if (isRecord(binding)) return String(binding.name ?? '');
  return '';
}

/** Which inputs the site binds, not what it binds them to — a rename is not a different run. */
function inputKeys(binding: unknown): string {
  if (isRecord(binding) && isRecord(binding.inputs)) return Object.keys(binding.inputs).sort().join(',');
  return '';
}

/** What a step is, with everything a site may vary signing as nothing. */
export function stepSignature(step: Step): string {
  switch (step.kind) {
    case 'technique':
      return `T:${opReference(step.technique)}(${inputKeys(step.technique)})`;
    case 'checkpoint': {
      if (step.ref) return `C:ref=${String(step.ref)}`;
      const options = Array.isArray(step.options) ? step.options : [];
      const ids = options.filter(isRecord).map((o) => String(o.id ?? '')).sort();
      return `C:[${ids.join(',')}]`;
    }
    case 'action': {
      const actions = Array.isArray(step.actions) ? step.actions : [];
      const parts = actions
        .filter(isRecord)
        .map((a) => `${String(a.action ?? '')}=${String(a.target ?? '')}`)
        .sort();
      return parts.length > 0 ? `A:${parts.join(',')}` : 'A:marker';
    }
    case 'loop': {
      const body = (Array.isArray(step.steps) ? step.steps : [])
        .filter(isRecord)
        .map(stepSignature)
        .join(';');
      return `L:${String(step.loopType)}/${step.over ? String(step.over) : ''}{${body}}`;
    }
    case 'routine': {
      // The routine named and the parameters bound, on the same terms as a technique step: the run
      // a reference stands for is decided by which routine it names, and a site varies by the
      // values it binds rather than by which parameters it binds at all.
      const bound = isRecord(step.with) ? Object.keys(step.with).sort().join(',') : '';
      return `R:${String(step.routine)}(${bound})`;
    }
    default:
      return `X:${String(step.kind)}`;
  }
}

/* --------------------------------- the windows --------------------------------- */

interface Sequence {
  steps: Step[];
  /** 0 at an activity's own step list, 1 inside a loop body, 2 inside a loop inside a loop. */
  depth: number;
}

/** Every step list an activity holds: its own, then each loop body, recursively. */
function sequences(steps: unknown, depth = 0): Sequence[] {
  const list = Array.isArray(steps) ? steps : [];
  const out: Sequence[] = [{ steps: list.filter(isRecord), depth }];
  for (const step of list) {
    if (isRecord(step) && step.kind === 'loop') out.push(...sequences(step.steps, depth + 1));
  }
  return out;
}

/**
 * Enumeration goes through `corpusWorkflows` rather than reading the root directly, so a workflow
 * the server runs is a workflow this guard measures — discovery is the server's rule, and it finds a
 * definition at any depth under a grouping folder.
 */
function activityFiles(root: string): string[] {
  const out: string[] = [];
  for (const workflow of corpusWorkflows(root)) {
    const dir = join(workflow.dir, 'activities');
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
    out.push(...definitionsUnder(dir).map(({ path }) => path));
  }
  return out;
}

interface WindowIndex {
  files: Set<string>;
  depth: number;
  /** The actual step objects behind each occurrence, which is what the difference report reads. */
  copies: Step[][];
}

function indexWindows(root: string): { windows: Map<string, WindowIndex>; files: number } {
  const windows = new Map<string, WindowIndex>();
  const index = indexCorpus(root);
  let files = 0;
  for (const path of activityFiles(root)) {
    let doc: unknown;
    try {
      doc = parseDefinition(readFileSync(path, 'utf-8'));
    } catch {
      continue; // Malformed YAML is validate-activities' finding, not this guard's.
    }
    if (!isRecord(doc) || !Array.isArray(doc.steps)) continue;
    files++;
    // `citePath` keys the site on the workflow id rather than the path, so a grouping folder names
    // nothing in a finding and a ledger entry survives the tree being nested.
    const label = citePath(root, path, index);
    for (const { steps, depth } of sequences(doc.steps)) {
      const signs = steps.map(stepSignature);
      for (let size = MIN_WINDOW; size <= MAX_WINDOW; size++) {
        for (let start = 0; start + size <= signs.length; start++) {
          const key = signs.slice(start, start + size).join(SEP);
          const entry = windows.get(key) ?? { files: new Set<string>(), depth, copies: [] };
          entry.files.add(label);
          entry.depth = Math.min(entry.depth, depth);
          entry.copies.push(steps.slice(start, start + size));
          windows.set(key, entry);
        }
      }
    }
  }
  return { windows, files };
}

/* ------------------------------ what differs ------------------------------ */

/** Order-independent deep serialisation, so two copies written key-shuffled compare equal. */
function canonical(value: unknown): string {
  if (value === null || value === undefined || typeof value !== 'object') {
    return JSON.stringify(value ?? null) ?? 'null';
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const record = value as Step;
  return `{${Object.keys(record).sort().map((k) => `${JSON.stringify(k)}:${canonical(record[k])}`).join(',')}}`;
}

/**
 * The field paths whose value is not the same at every copy, descending as far as the shapes agree.
 * Array positions collapse to `[]`, so one differing option id reads as `options[].id` rather than
 * as a position that moves when a list grows.
 */
function walkDiff(values: unknown[], path: string, out: Set<string>): void {
  const first = canonical(values[0]);
  if (values.every((v) => canonical(v) === first)) return;
  if (values.every(isRecord)) {
    const keys = new Set<string>();
    for (const value of values) for (const key of Object.keys(value)) keys.add(key);
    for (const key of [...keys].sort()) {
      walkDiff(values.map((v) => (v as Step)[key]), path ? `${path}.${key}` : key, out);
    }
    return;
  }
  const lengths = new Set(values.map((v) => (Array.isArray(v) ? v.length : -1)));
  if (values.every((v) => Array.isArray(v)) && lengths.size === 1) {
    for (let i = 0; i < (values[0] as unknown[]).length; i++) {
      walkDiff(values.map((v) => (v as unknown[])[i]), `${path}[]`, out);
    }
    return;
  }
  out.add(path || 'step');
}

/** Every difference between the copies, labelled by the step position it sits at. */
function driftBetween(copies: Step[][], size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < size; i++) {
    const paths = new Set<string>();
    walkDiff(copies.map((copy) => copy[i]), '', paths);
    for (const path of [...paths].sort()) out.push(`${i + 1}.${path}`);
  }
  return out;
}

/* ------------------------------- the shared runs ------------------------------- */

export interface SharedRun {
  /** The activity files carrying the run, sorted and joined — where the run is. */
  site: string;
  files: string[];
  /** One signature per step: what the run is. */
  run: string[];
  /** Shallowest nesting the run was seen at: 0 at a step list, 1 or more inside a loop body. */
  depth: number;
  /** Field paths that are not the same at every copy, each prefixed by its step position. */
  drift: string[];
  /** Occurrences, which exceeds the file count when one file carries the run more than once. */
  copies: number;
}

/**
 * The ledger key: which files carry the run, and what the run is. The two halves are joined by a
 * character neither can contain, so no site spelling collides with a run signature — the separator
 * `findingKey` uses for the same reason, written as an escape because a literal control character
 * makes a text source binary to grep.
 */
export function runKey(run: Pick<SharedRun, 'site' | 'run'>): string {
  return `${run.site}\u0000${run.run.join(SEP)}`;
}

function sameFiles(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every((file) => b.has(file));
}

/**
 * Every maximal run of steps that two or more activity files carry. Throws
 * `UnreachableCorpusError` when the walk found no activity to read, so a guard run over an
 * unprovisioned corpus is a measurement failure rather than a clean population.
 */
export function collectSharedRuns(root: string = DEFAULT_ROOT): SharedRun[] {
  const { windows, files } = indexWindows(root);
  assertScanned(files, 'activity definitions carrying a step list', root);
  const shared = [...windows].filter(([, window]) => window.files.size >= 2);
  const runs: SharedRun[] = [];
  for (const [key, window] of shared) {
    const anchored = `${SEP}${key}${SEP}`;
    const contained = shared.some(([other, index]) => other !== key
      && sameFiles(index.files, window.files)
      && `${SEP}${other}${SEP}`.includes(anchored));
    if (contained) continue;
    const run = key.split(SEP);
    const files_ = [...window.files].sort();
    runs.push({
      site: files_.join(' + '),
      files: files_,
      run,
      depth: window.depth,
      drift: driftBetween(window.copies, run.length),
      copies: window.copies.length,
    });
  }
  return runs.sort((a, b) => b.run.length - a.run.length
    || b.files.length - a.files.length
    || runKey(a).localeCompare(runKey(b)));
}

/* --------------------------------- the baseline --------------------------------- */

export type RunVerdict = 'converging' | 'unassigned' | 'provisional';
const VERDICTS: readonly string[] = ['converging', 'unassigned', 'provisional'];

export interface BaselineEntry {
  site: string;
  run: string[];
  verdict: string;
  /** Key into the file's `rationales` map — the reason this verdict holds. */
  rationale: string;
}

export interface BaselineFile {
  /** What the ledger is, the revision its population was measured at, and the verdict vocabulary. */
  note?: string;
  rationales?: Record<string, string>;
  entries: BaselineEntry[];
}

export function loadBaseline(path: string): BaselineFile {
  if (!existsSync(path)) return { entries: [] };
  return JSON.parse(readFileSync(path, 'utf-8')) as BaselineFile;
}

export interface RepeatedRunReport {
  runs: SharedRun[];
  findings: Finding[];
  /** Baselined provisional runs, named in every run of the guard rather than suppressed. */
  provisional: Array<{ run: SharedRun; rationale: string; why: string }>;
  counts: Record<RunVerdict | 'untriaged' | 'stale' | 'malformed', number>;
}

function describe(run: SharedRun): string {
  const where = run.depth === 0 ? 'at the top level' : 'inside a loop body';
  const copies = run.copies > run.files.length ? `, ${run.copies} copies` : '';
  const drift = run.drift.length === 0
    ? 'the copies are identical field for field'
    : `the copies differ at ${run.drift.join(', ')}`;
  return `a ${run.run.length}-step run ${where} in ${run.files.length} activity files${copies} — `
    + `${drift}; the run is ${run.run.join(SEP)}`;
}

/**
 * `baselinePath` lets a test point at a fixture ledger instead of the repo's own; a ledger and the
 * corpus it classifies belong to one tree, which is also why `--root` does not weaken the stale
 * rule — pointing a guard at a worktree's corpus is the documented way to check a corpus edit, and a
 * rule that switched itself off there would leave the ledger unprunable exactly where runs move.
 * `reportStale: false` measures the population alone.
 */
export function measure(
  root: string = DEFAULT_ROOT,
  opts: { reportStale?: boolean; baselinePath?: string } = {},
): RepeatedRunReport {
  const reportStale = opts.reportStale ?? true;
  const baseline = loadBaseline(opts.baselinePath ?? ledgerPath(root, BASELINE_FILE));
  const byKey = new Map(baseline.entries.map((entry) => [runKey(entry), entry]));
  const runs = collectSharedRuns(root);
  const findings: Finding[] = [];
  const provisional: Array<{ run: SharedRun; rationale: string; why: string }> = [];
  const counts = { converging: 0, unassigned: 0, provisional: 0, untriaged: 0, stale: 0, malformed: 0 };
  const seen = new Set<string>();

  for (const run of runs) {
    const entry = byKey.get(runKey(run));
    if (!entry) {
      counts.untriaged++;
      findings.push({
        check: 'repeated-run',
        site: run.site,
        detail: `${describe(run)} — no baseline entry classifies it; name it in `
          + 'ledgers/repeated-run-baseline.json with a verdict and a rationale, or remove the repetition',
      });
      continue;
    }
    seen.add(runKey(run));
    if (!VERDICTS.includes(entry.verdict)) {
      counts.malformed++;
      findings.push({
        check: 'repeated-run-baseline-verdict',
        site: run.site,
        detail: `baseline entry carries verdict '${entry.verdict}', which is none of `
          + `${VERDICTS.join(', ')} — a verdict outside the three suppresses nothing; correct it in `
          + 'ledgers/repeated-run-baseline.json',
      });
      continue;
    }
    counts[entry.verdict as RunVerdict]++;
    if (entry.verdict === 'provisional') {
      provisional.push({
        run,
        rationale: entry.rationale,
        why: baseline.rationales?.[entry.rationale] ?? entry.rationale,
      });
    }
  }

  // An entry matching no shared run is the baseline falling, and it falls by being deleted. Until it
  // is, the entry claims a judgement about a run the corpus no longer carries.
  for (const entry of reportStale ? baseline.entries : []) {
    if (seen.has(runKey(entry))) continue;
    counts.stale++;
    findings.push({
      check: 'repeated-run-baseline-stale',
      site: entry.site,
      detail: `baseline entry for a ${entry.run.length}-step run matches no repeated run — the run `
        + 'converged, moved, or changed shape; delete the entry from ledgers/repeated-run-baseline.json '
        + `(the run it classified is ${entry.run.join(SEP)})`,
    });
  }

  return { runs, findings, provisional, counts };
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  return measure(root).findings;
}

/* --------------------------------- CLI runner --------------------------------- */

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const root = requireRootOrExit('repeated-runs', DEFAULT_ROOT);
  let measured: RepeatedRunReport;
  try {
    measured = measure(root);
  } catch (err) {
    if (!(err instanceof UnreachableCorpusError)) throw err;
    process.stderr.write(`repeated-runs: cannot measure — ${err.message}\n`);
    process.exit(EXIT_UNMEASURED);
  }
  const { counts, provisional, runs } = measured;
  if (!wantsJson()) {
    // The census line, so a passing guard never reads as "nothing is copied" while the corpus carries
    // a population of copied runs. A provisional run is named here rather than suppressed: its
    // existence turns on a decision nobody has taken, so whoever takes it needs the run in front of
    // them.
    const drifting = runs.filter((run) => run.drift.length > 0).length;
    process.stdout.write(`repeated-runs: ${runs.length} repeated run(s) of steps — `
      + `${counts.converging} converging under a named stage, ${counts.unassigned} unassigned, `
      + `${counts.provisional} provisional, ${counts.untriaged} untriaged`
      + `${counts.stale ? `, ${counts.stale} stale baseline entr(ies)` : ''}`
      + `${counts.malformed ? `, ${counts.malformed} unreadable verdict(s)` : ''}\n`
      + `repeated-runs: ${drifting} differ between their copies, `
      + `${runs.length - drifting} are identical field for field\n`);
    for (const { run, rationale } of provisional) {
      const drift = run.drift.length === 0
        ? 'identical field for field'
        : `differing at ${run.drift.join(', ')}`;
      process.stdout.write(`repeated-runs: [provisional: ${rationale}] ${run.run.length}-step run at `
        + `${run.site}\n     ${run.run.join(SEP)}\n     ${drift}\n`);
    }
    for (const rationale of new Set(provisional.map((p) => p.rationale))) {
      const why = provisional.find((p) => p.rationale === rationale)?.why ?? rationale;
      process.stdout.write(`repeated-runs: ${rationale} — ${why}\n`);
    }
  }
  report('repeated-runs', measured.findings, {
    okMessage: `every repeated run of steps is classified (${counts.converging + counts.unassigned} `
      + `accepted as debt, ${counts.provisional} provisional and named above)`,
    root,
    remedy: 'classify each new repeated run in ledgers/repeated-run-baseline.json, or remove the '
      + 'repetition — and delete the entry of a run that no longer occurs',
  });
}
