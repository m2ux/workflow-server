/**
 * One reporting protocol for every guard.
 *
 * Guards used to each own a print format and an exit convention, so a full sweep was fourteen
 * hand-chained invocations whose results could only be read by eye (issue #327 S1). A guard now
 * hands its findings to `report`, which renders them one way and exits one way:
 *
 *   text (default) — a summary line, then one `[check] site / detail` block per finding
 *   `--json`       — `{ "guard": <id>, "root": <corpus>, "findings": [...] }` and nothing else
 *
 * Both modes exit 1 when findings remain. `check:all` reads exit codes; `check:delta` reads the
 * JSON and compares it to the same guard's findings on the merge-base tree.
 *
 * A guard that cannot reach its corpus throws `UnreachableCorpusError`; `report` renders that as a
 * distinct exit 2 — "measurement failed" is not the same answer as "nothing wrong" (#327 S2).
 */
import { requireWorkflowsRoot, UnreachableCorpusError } from './workflows-root.js';

export interface Finding {
  /** The sub-check that produced it — a guard's own finding family (`dead-output`, `orphan-input`). */
  check: string;
  /** Where it is: `<path>`, `<path>:<line>`, or a symbolic key like `<workflow>::<activity>::<id>`. */
  site: string;
  detail: string;
}

/** Exit codes: 0 clean, 1 findings, 2 the guard could not measure. */
export const EXIT_CLEAN = 0;
export const EXIT_FINDINGS = 1;
export const EXIT_UNMEASURED = 2;

export function wantsJson(argv: string[] = process.argv.slice(2)): boolean {
  return argv.includes('--json');
}

/**
 * Resolve the corpus root for a guard whose walk happens at module scope, exiting 2 with the reason
 * when it is unreachable. Guards that collect inside a function use `runGuard`, which catches the
 * same failure lazily.
 */
export function requireRootOrExit(guard: string, defaultDir: string, argv?: string[]): string {
  try {
    return requireWorkflowsRoot(defaultDir, argv);
  } catch (err) {
    if (err instanceof UnreachableCorpusError) {
      process.stderr.write(`${guard}: cannot measure — ${err.message}\n`);
      process.exit(EXIT_UNMEASURED);
    }
    throw err;
  }
}

/**
 * Resolve the corpus root strictly, run `collect` against it, and exit 2 when either step finds the
 * corpus unreachable — whether the root is missing or the walk inspected nothing.
 *
 * This is the entry point for a guard that renders its own findings rather than speaking the finding
 * protocol. `runGuard` covers the ones that speak it. Both exist so that every corpus guard has a
 * path to exit 2: a guard with no such path answers "nothing wrong" when asked a question it could
 * not read, and a clean run over an absent corpus is the one result that must never look like a pass.
 */
export function measureOrExit<T>(
  guard: string,
  defaultDir: string,
  collect: (root: string) => T,
  argv?: string[],
): T {
  try {
    return collect(requireWorkflowsRoot(defaultDir, argv));
  } catch (err) {
    if (err instanceof UnreachableCorpusError) {
      process.stderr.write(`${guard}: cannot measure — ${err.message}\n`);
      process.exit(EXIT_UNMEASURED);
    }
    throw err;
  }
}

export function findingKey(f: Finding): string {
  // Line numbers move when a file above the finding grows, so the key drops a trailing `:<line>`
  // — the same normalisation the retired baselines used, kept so a delta compares defects and not
  // line arithmetic.
  return `${f.check}\u0000${f.site.replace(/:\d+$/, '')}\u0000${f.detail}`;
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => findingKey(a).localeCompare(findingKey(b)));
}

export interface ReportOptions {
  /** What the guard proved when it finds nothing, e.g. "every lens is goal-routable". */
  okMessage: string;
  /** Corpus root the findings were collected against; echoed in JSON so a delta can prove the pair. */
  root?: string;
  /** One line above the finding list telling the reader how to act on them. */
  remedy?: string;
}

/** Render findings and exit. Never returns. */
export function report(guard: string, findings: Finding[], opts: ReportOptions): never {
  const sorted = sortFindings(findings);
  if (wantsJson()) {
    process.stdout.write(JSON.stringify({ guard, root: opts.root ?? null, findings: sorted }, null, 2) + '\n');
    process.exit(sorted.length ? EXIT_FINDINGS : EXIT_CLEAN);
  }
  if (sorted.length === 0) {
    process.stdout.write(`${guard}: OK — ${opts.okMessage}\n`);
    process.exit(EXIT_CLEAN);
  }
  process.stdout.write(`${guard}: ${sorted.length} violation(s)${opts.remedy ? ` — ${opts.remedy}` : ''}\n`);
  for (const f of sorted) process.stdout.write(`  [${f.check}] ${f.site}\n     ${f.detail}\n`);
  process.exit(EXIT_FINDINGS);
}

/**
 * Resolve the corpus, collect findings, report. Root resolution runs inside the guarded block so an
 * unprovisioned worktree or a mis-pointed `--root` exits 2 with the reason — a broken measurement,
 * not a clean corpus.
 */
export async function runGuard(
  guard: string,
  resolveRoot: () => string,
  collect: (root: string) => Finding[] | Promise<Finding[]>,
  opts: Omit<ReportOptions, 'root'>,
): Promise<never> {
  let findings: Finding[];
  let root: string | undefined;
  try {
    root = resolveRoot();
    findings = await collect(root);
  } catch (err) {
    if (err instanceof UnreachableCorpusError) {
      process.stderr.write(`${guard}: cannot measure — ${err.message}\n`);
      process.exit(EXIT_UNMEASURED);
    }
    throw err;
  }
  return report(guard, findings, { ...opts, root });
}
