#!/usr/bin/env npx tsx
/**
 * Corpus paths pinned as string literals in this repo's TypeScript.
 *
 * A test or guard that names a corpus file — `consumerReaches('prism/techniques/present-result.md',
 * …)` — is holding a string the corpus is free to rename. Nothing links the two: the corpus moves on
 * its own branch, and the helpers that take these paths mostly split the workflow prefix off and
 * never touch disk. So a rename leaves the literal naming a file that is gone, the assertion still
 * evaluates, and the suite stays green over a premise that has rotted.
 *
 * That silence is the whole defect. A pinned path that no longer resolves is not a failing test, it
 * is a test whose subject has quietly changed, and the next reader takes its green as evidence.
 *
 * Scope is a literal a file READS. A test that builds a synthetic corpus writes the same shape of
 * path into a temp tree — `write('meta/techniques/plan.md', …)` — and that path is authored by the
 * test rather than borrowed from the corpus, so it is skipped and counted. A literal whose leading
 * segment is not a workflow directory is a fixture id (`wf/`, `alpha/`) and is skipped the same way.
 * Both counts print on a clean run, so the reach of the check is visible rather than assumed.
 *
 * JSON ledgers are out of scope: `binding-fidelity-triage.json` already reports an entry that
 * matches nothing, and a second check over the same sites would be a second home for that verdict.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { report, requireRootOrExit, type Finding } from './guard-protocol.js';

const REPO = resolve(import.meta.dirname, '..');
const DEFAULT_ROOT = join(REPO, 'workflows');

/** Directories of this repo's own TypeScript that may name a corpus file. */
const SOURCE_DIRS = ['scripts', 'src', 'tests'];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', '.worktrees', 'fixtures']);

/**
 * A quoted repo-relative corpus path: `<workflow>/<construct-dir>/…/<file>.md|.yaml`. The construct
 * directory is what separates a corpus path from any other slashed string in these sources.
 */
const PINNED = /['"`]([a-z0-9][a-z0-9-]*)\/(techniques|activities|resources)\/([A-Za-z0-9/_.-]+\.(?:md|ya?ml))['"`]/g;

/** Calls that author a path into a temp tree rather than read one from the corpus. */
const AUTHORING_CALL = /\b(write|writeFile|writeFileSync|mkdir|mkdirSync|outputFile)\s*\(/;

/**
 * True when the match sits in a comment. An example in prose illustrates a shape — a loader comment
 * showing what a cross-workflow reference looks like means the same thing whichever activity it
 * names. Holding those to the corpus would fire on documentation and teach the reader to suppress
 * the guard, so the subject is a path the code resolves, not one it mentions.
 */
function inComment(line: string, at: number): boolean {
  const before = line.slice(0, at);
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return true;
  return before.includes('//');
}

function sources(dir: string, into: string[] = []): string[] {
  if (!existsSync(dir)) return into;
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sources(full, into);
    else if (entry.endsWith('.ts')) into.push(full);
  }
  return into;
}

export interface PinnedPathTally {
  findings: Finding[];
  /** Literals a file authors into its own fixture tree. */
  authored: number;
  /** Literals whose leading segment names no workflow — a synthetic corpus id. */
  foreign: number;
  /** Literals illustrating a shape in a comment rather than naming a path the code resolves. */
  illustrative: number;
  /** Literals checked against the corpus. */
  checked: number;
}

export function collect(root: string): PinnedPathTally {
  const workflows = new Set(
    readdirSync(root).filter((e) => statSync(join(root, e)).isDirectory()),
  );
  const findings: Finding[] = [];
  let authored = 0;
  let foreign = 0;
  let illustrative = 0;
  let checked = 0;

  for (const file of sources(REPO).filter((f) => SOURCE_DIRS.some((d) => f.startsWith(join(REPO, d))))) {
    const text = readFileSync(file, 'utf-8');
    const lines = text.split('\n');
    for (const [index, line] of lines.entries()) {
      for (const match of line.matchAll(PINNED)) {
        const [, workflow, , tail] = match;
        const rel = `${workflow}/${match[2]}/${tail}`;
        if (!workflows.has(workflow!)) {
          foreign += 1;
          continue;
        }
        if (inComment(line, match.index)) {
          illustrative += 1;
          continue;
        }
        if (AUTHORING_CALL.test(line)) {
          authored += 1;
          continue;
        }
        checked += 1;
        if (existsSync(join(root, rel))) continue;
        findings.push({
          check: 'dangling-pin',
          site: `${relative(REPO, file)}:${index + 1}`,
          detail:
            `names \`${rel}\`, which the pinned corpus does not hold — the corpus renamed or removed `
            + 'it and nothing failed, so whatever this line asserts now rests on a path that is gone. '
            + 'Point it at the successor, or stop naming a corpus file here.',
        });
      }
    }
  }
  return { findings, authored, foreign, illustrative, checked };
}

const root = requireRootOrExit('pinned-corpus-paths', DEFAULT_ROOT);
const tally = collect(root);
report('pinned-corpus-paths', tally.findings, {
  root,
  okMessage:
    `${tally.checked} corpus path(s) pinned in TypeScript all resolve `
    + `(${tally.authored} authored into a fixture tree, ${tally.illustrative} illustrating a shape in a comment, `
    + `and ${tally.foreign} naming a non-corpus id were not checked)`,
  remedy: 'point the literal at the successor, or stop naming a corpus file there',
});
