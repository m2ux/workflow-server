/**
 * check:delta — what did MY change break? Computed against the merge-base, never stored.
 *
 * A stored baseline is a cache of "what did this guard report before my change". It drifts, it needs
 * pruning PRs, and it silently absorbs real defects (issue #327 R1). The before-state does not need
 * storing: it is the merge-base with the integration branch.
 *
 * This runner resolves that merge-base, materialises it in a throwaway git worktree with the
 * workflows submodule pinned to the commit THAT tree recorded, runs the guard registry against both
 * trees, and reports only the difference. Nothing is stored, so nothing drifts; the verdict is exact
 * and scoped to the change; and every guard gets a ratchet, including the ones that never had a
 * baseline concept.
 *
 *   npx tsx scripts/check-delta.ts [--base <ref>] [--only <id,id>] [--no-cache] [--keep-base] [--verbose]
 *
 * Base results are cached under `.guard-cache/` keyed by (base commit, base corpus commit), so the
 * doubled runtime is paid once per rebase rather than once per run.
 *
 * Guards that speak the `--json` finding protocol yield a precise per-finding delta. The rest are
 * compared by exit code and by new output lines — coarser, and the reason to move a guard onto the
 * protocol when its findings start mattering.
 *
 * Exit 0 when the change adds nothing, 1 when it adds findings, 2 when the comparison could not be
 * set up (no merge-base, submodule unavailable, guard unmeasurable in either tree).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT_CLEAN, EXIT_FINDINGS, EXIT_UNMEASURED, findingKey, type Finding } from './guard-protocol.js';
import { GUARDS, type GuardSpec } from './guards.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(DIR, '..');
const TSX_CLI = fileURLToPath(import.meta.resolve('tsx/cli'));

const argv = process.argv.slice(2);
const verbose = argv.includes('--verbose');
const noCache = argv.includes('--no-cache');
const keepBase = argv.includes('--keep-base');
const flagValue = (name: string): string | null => {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1]! : null;
};
const onlyIds = flagValue('--only');
const only = onlyIds ? new Set(onlyIds.split(',')) : null;

/* ------------------------------- git helpers ------------------------------- */

function git(args: string[], cwd = REPO): { ok: boolean; out: string } {
  const r = spawnSync('git', args, { cwd, encoding: 'utf-8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim() };
}

function die(message: string): never {
  process.stderr.write(`check:delta: ${message}\n`);
  process.exit(EXIT_UNMEASURED);
}

/** The integration branch to compare against: `--base`, else INTEGRATION_BRANCH, else origin/main, else main. */
function integrationRef(): string {
  const explicit = flagValue('--base') ?? process.env.INTEGRATION_BRANCH;
  if (explicit) return explicit;
  if (git(['rev-parse', '--verify', '--quiet', 'origin/main']).ok) return 'origin/main';
  if (git(['rev-parse', '--verify', '--quiet', 'main']).ok) return 'main';
  return die('no integration branch found — pass --base <ref>.');
}

/** The submodule commit a tree-ish recorded for `workflows`. */
function recordedCorpusSha(treeish: string): string {
  const r = git(['ls-tree', treeish, 'workflows']);
  const sha = r.out.split(/\s+/)[2];
  if (!r.ok || !sha) return die(`cannot read the workflows submodule commit recorded at ${treeish}.`);
  return sha;
}

/* ------------------------------- base worktree ------------------------------- */

interface BaseTree {
  path: string;
  cleanup: () => void;
}

/**
 * Materialise the merge-base in a throwaway worktree with the submodule pinned to the commit that
 * commit recorded. Pinning is what removes the "which corpus am I measuring?" ambiguity: the base
 * corpus is whatever the base tree said it was, not whatever is checked out now.
 */
function materialiseBase(mergeBase: string, corpusSha: string): BaseTree {
  const path = join(REPO, '.worktrees', `.delta-base-${mergeBase.slice(0, 12)}`);
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
  git(['worktree', 'prune']);
  const add = spawnSync('git', ['worktree', 'add', '--detach', path, mergeBase], { cwd: REPO, encoding: 'utf-8' });
  if (add.status !== 0) die(`could not create the base worktree at ${path}: ${add.stderr?.trim()}`);
  const cleanup = (): void => {
    if (keepBase) {
      process.stdout.write(`base worktree kept at ${path}\n`);
      return;
    }
    spawnSync('git', ['worktree', 'remove', '--force', path], { cwd: REPO });
    if (existsSync(path)) rmSync(path, { recursive: true, force: true });
  };
  const init = spawnSync('git', ['submodule', 'update', '--init', 'workflows'], { cwd: path, encoding: 'utf-8' });
  if (init.status !== 0) {
    cleanup();
    die(`could not check out the workflows submodule in the base worktree: ${init.stderr?.trim()}`);
  }
  const actual = git(['rev-parse', 'HEAD'], join(path, 'workflows')).out;
  if (actual !== corpusSha) {
    // The recorded commit is the authority; force it so the base corpus matches the base tree even
    // if the submodule's default branch has moved on.
    const fetch = spawnSync('git', ['fetch', 'origin', corpusSha], { cwd: join(path, 'workflows'), encoding: 'utf-8' });
    const co = spawnSync('git', ['checkout', '--detach', corpusSha], { cwd: join(path, 'workflows'), encoding: 'utf-8' });
    if (co.status !== 0) {
      cleanup();
      die(`base corpus is at ${actual} but ${corpusSha} is recorded, and it could not be checked out`
        + `${fetch.status === 0 ? '' : ' (fetch failed — is the submodule remote reachable?)'}.`);
    }
  }
  return { path, cleanup };
}

/* --------------------------------- guard runs --------------------------------- */

interface GuardRun {
  id: string;
  code: number;
  findings: Finding[] | null;
  lines: string[];
  stderr: string[];
}

/**
 * Make two trees' output comparable: strip tree-specific absolute paths, and strip the values that
 * differ between any two runs of the same guard (ISO timestamps, elapsed milliseconds). Without the
 * volatile-value pass every run of a loader-backed guard would look like new findings.
 */
function normalise(text: string, treeRoot: string): string[] {
  return text
    .replace(new RegExp(treeRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<tree>')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '<ts>')
    .replace(/\b\d+(\.\d+)?\s?ms\b/g, '<ms>')
    .replace(/\b\d+(\.\d+)?s\b/g, '<s>')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);
}

function runGuardIn(tree: string, guard: GuardSpec): Promise<GuardRun> {
  const corpus = join(tree, 'workflows');
  const args = [join(tree, guard.script)];
  if (guard.scope === 'corpus') args.push('--root', corpus);
  if (guard.json) args.push('--json');
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, [TSX_CLI, ...args], {
      cwd: tree,
      // A guard must read the corpus it was handed, not an ambient WORKFLOWS_DIR from the caller's
      // shell — that ambiguity is what made cross-checkout measurement unreliable.
      env: { ...process.env, WORKFLOWS_DIR: corpus },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    child.on('error', (err) => resolveRun({ id: guard.id, code: EXIT_UNMEASURED, findings: null, lines: [], stderr: [`spawn failed: ${err.message}`] }));
    child.on('close', (code) => {
      let findings: Finding[] | null = null;
      if (guard.json) {
        try { findings = (JSON.parse(stdout) as { findings: Finding[] }).findings; } catch { findings = null; }
      }
      resolveRun({
        id: guard.id,
        code: code ?? EXIT_UNMEASURED,
        findings,
        // Only stdout carries findings; the loaders log to stderr, so stderr is kept for the
        // unmeasured-guard report and left out of the line comparison.
        lines: normalise(stdout, tree),
        stderr: normalise(stderr, tree),
      });
    });
  });
}

async function runAll(tree: string, guards: GuardSpec[]): Promise<GuardRun[]> {
  const limit = Math.max(1, Math.min(guards.length, cpus().length - 1));
  const runs: GuardRun[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    for (;;) {
      const i = next++;
      if (i >= guards.length) return;
      runs[i] = await runGuardIn(tree, guards[i]!);
    }
  }));
  return runs;
}

/* ---------------------------------- caching ---------------------------------- */

const CACHE_DIR = join(REPO, '.guard-cache');

function cachePath(mergeBase: string, corpusSha: string): string {
  return join(CACHE_DIR, `${mergeBase.slice(0, 12)}-${corpusSha.slice(0, 12)}.json`);
}

function readCache(path: string, guards: GuardSpec[]): GuardRun[] | null {
  if (noCache || !existsSync(path)) return null;
  try {
    const cached = JSON.parse(readFileSync(path, 'utf-8')) as { runs: GuardRun[] };
    // A cache entry is only usable if it covers every guard being compared; a registry that grew
    // since the entry was written must re-measure rather than treat the new guard as "no findings".
    if (guards.every((g) => cached.runs.some((r) => r.id === g.id))) return cached.runs;
    return null;
  } catch {
    return null;
  }
}

function writeCache(path: string, runs: GuardRun[]): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify({ runs }, null, 2) + '\n');
}

/* ----------------------------------- main ----------------------------------- */

async function main(): Promise<void> {
  if (!git(['rev-parse', '--git-dir']).ok) die('not a git checkout.');
  const guards = GUARDS.filter((g) => (only ? only.has(g.id) : true));
  if (only) for (const id of only) if (!GUARDS.some((g) => g.id === id)) die(`unknown guard '${id}'.`);

  const base = integrationRef();
  const mergeBase = git(['merge-base', 'HEAD', base]).out;
  if (!mergeBase) die(`no merge-base between HEAD and ${base}.`);
  const headSha = git(['rev-parse', 'HEAD']).out;
  if (mergeBase === headSha) {
    process.stdout.write(`check:delta: HEAD is the merge-base with ${base} — nothing to compare.\n`);
    process.exit(EXIT_CLEAN);
  }
  const baseCorpus = recordedCorpusSha(mergeBase);
  const headCorpus = git(['rev-parse', 'HEAD'], join(REPO, 'workflows')).out || '(unavailable)';

  process.stdout.write(`base ${base} @ ${mergeBase.slice(0, 12)} (corpus ${baseCorpus.slice(0, 12)})\n`);
  process.stdout.write(`head    @ ${headSha.slice(0, 12)} (corpus ${headCorpus.slice(0, 12)})\n`);

  const cache = cachePath(mergeBase, baseCorpus);
  let baseRuns = readCache(cache, guards);
  if (baseRuns) {
    process.stdout.write(`base results reused from ${cache.replace(REPO + '/', '')}\n`);
  } else {
    process.stdout.write('measuring the base tree…\n');
    const tree = materialiseBase(mergeBase, baseCorpus);
    try {
      baseRuns = await runAll(tree.path, guards);
    } finally {
      tree.cleanup();
    }
    writeCache(cache, baseRuns);
  }

  process.stdout.write('measuring this tree…\n');
  const headRuns = await runAll(REPO, guards);

  /* ------------------------------- the delta ------------------------------- */
  let added = 0;
  let unmeasured = 0;
  const report: string[] = [];

  for (const guard of guards) {
    const b = baseRuns.find((r) => r.id === guard.id);
    const h = headRuns.find((r) => r.id === guard.id);
    if (!b || !h) continue;
    if (h.code === EXIT_UNMEASURED) {
      // THIS tree could not measure — the delta has a hole in it, whatever the base did.
      unmeasured++;
      report.push(`  [UNMEASURED] ${guard.id} — head could not measure (exit ${h.code})`);
      for (const l of [...h.stderr, ...h.lines].slice(-5)) report.push(`      ${l}`);
      continue;
    }
    if (b.code === EXIT_UNMEASURED) {
      // The BASE tree could not run this guard as invoked — normal when the change alters a guard's
      // CLI (this tree taught two validators to accept --root). The head measured fine, so there is
      // no hole; there is simply no before-state to subtract, and that is reported, not counted.
      report.push(`  [NO-BASE] ${guard.id} — the base tree could not run this guard as invoked`
        + ` (exit ${b.code}); head reports ${h.findings ? `${h.findings.length} finding(s)` : `exit ${h.code}`}`);
      continue;
    }
    if (guard.json && h.findings && !b.findings) {
      // Head speaks the finding protocol and base does not: this change put the guard on the
      // protocol. Comparing formatted output would read every JSON line as a new finding, so compare
      // the verdicts only.
      const wentRed = b.code === EXIT_CLEAN && h.code !== EXIT_CLEAN;
      if (wentRed) added++;
      report.push(`  [${wentRed ? 'ADDED' : 'PROTOCOL'}] ${guard.id} — base predates the finding protocol;`
        + ` base exit ${b.code}, head ${h.findings.length} finding(s)`);
      if (wentRed) for (const f of h.findings) report.push(`      [${f.check}] ${f.site}\n         ${f.detail}`);
      continue;
    }
    if (b.findings && h.findings) {
      const baseKeys = new Set(b.findings.map(findingKey));
      const headKeys = new Set(h.findings.map(findingKey));
      const fresh = h.findings.filter((f) => !baseKeys.has(findingKey(f)));
      const gone = b.findings.filter((f) => !headKeys.has(findingKey(f)));
      if (fresh.length === 0) {
        report.push(`  [SAME] ${guard.id} — ${h.findings.length} finding(s), none new`
          + `${gone.length ? `, ${gone.length} fixed by this change` : ''}`);
        continue;
      }
      added += fresh.length;
      report.push(`  [ADDED] ${guard.id} — ${fresh.length} new finding(s)`
        + `${gone.length ? `, ${gone.length} fixed` : ''}`);
      for (const f of fresh) report.push(`      [${f.check}] ${f.site}\n         ${f.detail}`);
      continue;
    }
    // Coarse comparison: no finding protocol here, so the only reliable signal is the verdict. New
    // output lines are shown but not counted — without a finding protocol an output-format tweak is
    // indistinguishable from a finding, and counting it would make the delta cry wolf.
    const baseLines = new Set(b.lines);
    const freshLines = h.lines.filter((l) => !baseLines.has(l));
    const wentRed = b.code === EXIT_CLEAN && h.code !== EXIT_CLEAN;
    if (!wentRed && freshLines.length === 0) {
      report.push(`  [SAME] ${guard.id} — output unchanged (exit ${h.code})`);
      continue;
    }
    if (wentRed) added++;
    report.push(`  [${wentRed ? 'ADDED' : 'CHANGED'}] ${guard.id} — base exit ${b.code}, head exit ${h.code}`
      + `${freshLines.length ? `, ${freshLines.length} new output line(s)` : ''}`
      + `${wentRed ? '' : ' (not counted — this guard has no finding protocol)'}`);
    for (const l of freshLines.slice(0, 20)) report.push(`      ${l}`);
    if (freshLines.length > 20) report.push(`      … ${freshLines.length - 20} more line(s)`);
  }

  process.stdout.write('\n' + report.join('\n') + '\n\n');
  if (unmeasured) {
    process.stdout.write(`${unmeasured} guard(s) could not be measured — the delta is incomplete.\n`);
    process.exit(EXIT_UNMEASURED);
  }
  if (added) {
    process.stdout.write(`${added} finding(s) introduced by this change against ${base}.\n`);
    process.exit(EXIT_FINDINGS);
  }
  process.stdout.write(`OK — this change introduces no new findings against ${base}.\n`);
  if (verbose) process.stdout.write(`(pre-existing findings are reported by 'npm run check:all'.)\n`);
  process.exit(EXIT_CLEAN);
}

await main();
