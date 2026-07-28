/**
 * check:all — run every registered guard once and report the sweep in one table.
 *
 * Before this, a full sweep was fourteen hand-chained `npm run check:*` invocations with fourteen
 * output formats, and three guards on disk that nothing invoked at all (issue #327 S1). The set of
 * guards is `scripts/guards.ts`; adding an entry there enforces it here and in CI.
 *
 *   npx tsx scripts/check-all.ts [--root <workflows-dir>] [--only <id,id>] [--corpus-only] [--verbose]
 *
 * Exit 0 when every guard is clean, 1 when any reports findings, 2 when any could not measure
 * (unreachable corpus) — an unmeasured guard is never folded into "pass".
 */
import { spawn } from 'node:child_process';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { EXIT_CLEAN, EXIT_FINDINGS, EXIT_UNMEASURED } from './guard-protocol.js';
import { GUARDS, type GuardSpec } from './guards.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(DIR, '..');

const argv = process.argv.slice(2);
const verbose = argv.includes('--verbose');
const corpusOnly = argv.includes('--corpus-only');
const onlyFlag = argv.indexOf('--only');
const only = onlyFlag !== -1 && argv[onlyFlag + 1] ? new Set(argv[onlyFlag + 1]!.split(',')) : null;

/** Args to forward to each guard: everything check:all does not own itself. */
function forwardedArgs(): string[] {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--verbose' || a === '--corpus-only') continue;
    if (a === '--only') { i++; continue; }
    if (a.startsWith('--only=')) continue;
    out.push(a);
  }
  return out;
}

export interface GuardRun {
  guard: GuardSpec;
  code: number;
  /** stdout — a guard's verdict and findings. */
  output: string;
  /** stderr — loader logs and unmeasured-corpus reasons; shown only when a guard is not clean. */
  errors: string;
  ms: number;
}

/**
 * The tsx CLI entry, resolved from wherever node found the package. A git worktree with no
 * `node_modules` of its own resolves up the tree to the parent checkout's install, so the sweep
 * runs in a worktree without a per-worktree install.
 */
const TSX_CLI = fileURLToPath(import.meta.resolve('tsx/cli'));

function runOne(guard: GuardSpec, args: string[]): Promise<GuardRun> {
  return new Promise((resolveRun) => {
    const started = Date.now();
    const child = spawn(process.execPath, [TSX_CLI, join(REPO, guard.script), ...args], {
      cwd: REPO,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let errors = '';
    child.stdout.on('data', (d: Buffer) => { output += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { errors += d.toString(); });
    child.on('error', (err) => {
      resolveRun({ guard, code: EXIT_UNMEASURED, output: '', errors: `failed to spawn: ${err.message}\n`, ms: Date.now() - started });
    });
    child.on('close', (code) => {
      resolveRun({ guard, code: code ?? EXIT_UNMEASURED, output, errors, ms: Date.now() - started });
    });
  });
}

/** The last non-empty stdout line — a guard's own verdict, whatever format it prints in. */
function verdict(run: GuardRun): string {
  const lines = run.output.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length) return lines[lines.length - 1]!;
  const errs = run.errors.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  return errs[errs.length - 1] ?? '(no output)';
}

async function main(): Promise<void> {
  const selected = GUARDS
    .filter((g) => (only ? only.has(g.id) : true))
    .filter((g) => (corpusOnly ? g.scope === 'corpus' : true));
  if (only) {
    for (const id of only) if (!GUARDS.some((g) => g.id === id)) {
      process.stderr.write(`check:all: unknown guard '${id}'. Known: ${GUARDS.map((g) => g.id).join(', ')}\n`);
      process.exit(EXIT_UNMEASURED);
    }
  }

  const args = forwardedArgs();
  const started = Date.now();
  // Guards are independent readers, so they run concurrently; the report is still emitted in
  // registry order so two sweeps of the same tree read identically.
  const limit = Math.max(1, Math.min(selected.length, cpus().length - 1));
  const runs: GuardRun[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    for (;;) {
      const i = next++;
      if (i >= selected.length) return;
      runs[i] = await runOne(selected[i]!, args);
    }
  }));

  const failed = runs.filter((r) => r.code === EXIT_FINDINGS);
  const unmeasured = runs.filter((r) => r.code !== EXIT_CLEAN && r.code !== EXIT_FINDINGS);
  // A filter combination can select nothing (`--corpus-only --only site-links`); say so rather than
  // printing an empty table that reads like a clean sweep.
  if (selected.length === 0) {
    process.stderr.write('check:all: no guard matched the given filters — nothing was measured.\n');
    process.exit(EXIT_UNMEASURED);
  }
  const width = Math.max(...selected.map((g) => g.id.length));

  process.stdout.write('\n');
  for (const run of runs) {
    const mark = run.code === EXIT_CLEAN ? 'PASS' : run.code === EXIT_FINDINGS ? 'FAIL' : 'UNMEASURED';
    process.stdout.write(`  [${mark}] ${run.guard.id.padEnd(width)}  ${(run.ms / 1000).toFixed(1)}s  ${verdict(run)}\n`);
  }
  process.stdout.write(`\n${runs.length} guard(s) in ${((Date.now() - started) / 1000).toFixed(1)}s — `
    + `${runs.length - failed.length - unmeasured.length} pass, ${failed.length} fail, ${unmeasured.length} unmeasured\n`);

  const detailed = verbose ? runs : [...failed, ...unmeasured];
  for (const run of detailed) {
    // An unmeasured guard's reason is on stderr; a failing guard's findings are on stdout.
    const body = run.output.trim() ? run.output : run.errors;
    if (!body.trim()) continue;
    process.stdout.write(`\n──── ${run.guard.id} (${relative(REPO, join(REPO, run.guard.script))}) ────\n`);
    process.stdout.write(body.endsWith('\n') ? body : body + '\n');
  }

  if (unmeasured.length) process.exit(EXIT_UNMEASURED);
  process.exit(failed.length ? EXIT_FINDINGS : EXIT_CLEAN);
}

await main();
