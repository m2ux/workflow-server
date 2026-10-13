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
 * test rather than borrowed from the corpus, so it is skipped and counted. A bare literal whose
 * workflow segment is not a workflow directory is a fixture id (`wf/`, `alpha/`) and is skipped the
 * same way. Both counts print on a clean run, so the reach of the check is visible rather than
 * assumed.
 *
 * A pin is spelled from whichever root the file reading it resolves against, so the workflow segment
 * may sit behind leading directories — a suite reading through `liveCorpusRoot()` writes the corpus
 * checkout's own `corpus/meta/techniques/…`. The construct directory is what locates the workflow
 * segment within the literal, and everything ahead of it is path context the finding quotes back.
 * Where those leading segments name a directory the checkout holds, the literal is addressed at
 * that checkout and resolves whole or is reported: a workflow the corpus retires leaves a pin whose
 * workflow segment names nothing, which is the rot this exists for rather than a fixture id.
 *
 * JSON ledgers are out of scope: `binding-fidelity-triage.json` already reports an entry that
 * matches nothing, and a second check over the same sites would be a second home for that verdict.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { report, requireRootOrExit, type Finding } from './guard-protocol.js';
import { defaultCorpusDest } from './workflows-root.js';
import { indexCorpus, workflowSubdir } from '../src/loaders/corpus-index.js';

const REPO = resolve(import.meta.dirname, '..');
const DEFAULT_ROOT = defaultCorpusDest(REPO);

/** Directories of this repo's own TypeScript that may name a corpus file. */
const SOURCE_DIRS = ['guards', 'scripts', 'src', 'tests'];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', '.worktrees', 'fixtures']);

/**
 * A quoted corpus path: `…/<workflow>/<construct-dir>/…/<file>.md|.yaml`. The construct directory is
 * what separates a corpus path from any other slashed string in these sources, and the segment
 * ahead of it is the workflow. Leading segments are the root the literal is spelled from, taken
 * lazily so the first segment that fronts a construct directory is read as the workflow.
 */
const PINNED = /['"`]((?:[A-Za-z0-9_.-]+\/)*?)([a-z0-9][a-z0-9-]*)\/(techniques|activities|resources)\/([A-Za-z0-9/_.-]+\.(?:md|ya?ml))['"`]/g;

/**
 * Calls that author a path into a temp tree rather than read one from the corpus. `withCorpus` is
 * among them: it takes a map of path to body, so every key is a file the test writes.
 */
const AUTHORING_CALL = /\b(write|writeFile|writeFileSync|mkdir|mkdirSync|outputFile|withCorpus)\s*\(/;

/** How far a line opens or closes a parenthesis, counting only the two characters. */
function parenShift(text: string): number {
  let shift = 0;
  for (const ch of text) {
    if (ch === '(') shift += 1;
    else if (ch === ')') shift -= 1;
  }
  return shift;
}

/**
 * True when the literal sits inside an authoring call's argument list.
 *
 * A call long enough to wrap puts each path on a line of its own, and a call taking a map of path
 * to body puts several there, so the call name is above the literal rather than beside it. The
 * walk down from the top of the file opens at an authoring call and stays open until its paren
 * closes, which reads every path of a multi-file fixture as the fixture write it is. A literal in
 * an unrelated call is outside any such span and takes no exemption.
 */
export function authorsIntoFixture(lines: string[], lineNo: number): boolean {
  if (AUTHORING_CALL.test(lines[lineNo]!)) return true;
  let depth = 0;
  for (const text of lines.slice(0, lineNo)) {
    if (depth > 0) {
      depth += parenShift(text);
      continue;
    }
    const opens = AUTHORING_CALL.exec(text);
    if (opens) depth = parenShift(text.slice(opens.index + opens[0].length - 1));
  }
  return depth > 0;
}

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
  /** Literals whose workflow segment names no workflow — a synthetic corpus id. */
  foreign: number;
  /** Literals illustrating a shape in a comment rather than naming a path the code resolves. */
  illustrative: number;
  /** Literals checked against the corpus. */
  checked: number;
}

/**
 * Every pin in `repo`'s own TypeScript, resolved against the corpus at `root`.
 *
 * `repo` is this repository. A test names a tree of its own to put a particular source line in
 * front of the scan, which is how a spelling the scan once passed over is held to a verdict.
 */
export function collect(root: string, repo: string = REPO): PinnedPathTally {
  const corpus = indexCorpus(root);
  const workflows = new Set(corpus.workflows.keys());
  const findings: Finding[] = [];
  let authored = 0;
  let foreign = 0;
  let illustrative = 0;
  let checked = 0;

  for (const file of sources(repo).filter((f) => SOURCE_DIRS.some((d) => f.startsWith(join(repo, d))))) {
    const text = readFileSync(file, 'utf-8');
    const lines = text.split('\n');
    for (const [lineNo, line] of lines.entries()) {
      for (const match of line.matchAll(PINNED)) {
        const [, prefix, workflow, construct, tail] = match;
        const rel = `${prefix}${workflow}/${construct}/${tail}`;
        if (inComment(line, match.index)) {
          illustrative += 1;
          continue;
        }
        if (authorsIntoFixture(lines, lineNo)) {
          authored += 1;
          continue;
        }
        // A literal spelled from the corpus checkout's own layout is addressed at that checkout,
        // and a suite reading through `liveCorpusRoot()` is the only thing that spells one. The
        // workflow segment is then no exemption: a workflow the corpus retired leaves a pin naming
        // no workflow at all, which is the very rot this reports.
        const fromRoot = prefix !== '' && existsSync(join(root, prefix!));
        if (!fromRoot && !workflows.has(workflow!)) {
          foreign += 1;
          continue;
        }
        checked += 1;
        if (fromRoot && existsSync(join(root, rel))) continue;
        const held = workflows.has(workflow!)
          ? workflowSubdir(corpus, workflow!, join(construct!, tail!))
          : null;
        if (held && existsSync(held)) continue;
        findings.push({
          check: 'dangling-pin',
          site: `${relative(repo, file)}:${lineNo + 1}`,
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

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
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
}
