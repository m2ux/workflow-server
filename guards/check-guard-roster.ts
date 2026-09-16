#!/usr/bin/env npx tsx
/**
 * Guard programs the corpus cites, against the registry that holds them.
 *
 * `guards/guards.ts` is the one enumeration of what verifies this repository, and `check-all` walks
 * it — so a guard added there runs without anybody remembering it. Corpus prose that names guard
 * programs one by one is a second copy of that enumeration, and it drifts in both directions at
 * once: it keeps naming a program deleted with the mechanism it policed, and it says nothing about
 * guards added since. Neither drift fails anything, because prose naming a program that no longer
 * exists reads exactly like prose naming one that does.
 *
 *   `missing-program`  — a `guards/<name>.ts` path cited in the corpus with no such file in the
 *                       repository. Existence is what makes the citation true or false; whether a
 *                       program that exists is also enrolled in the registry is a separate question,
 *                       and `tests/guard-registry.test.ts` owns it along with the reasons a program
 *                       may run outside the sweep. Restating that here would be a second home for it.
 *   `restated-roster` — a corpus file citing three or more distinct guard programs. One or two are
 *                       a pointer at a specific check; a list is the registry written out again,
 *                       and the remedy is to cite the registry and let the runner walk it.
 *
 * Run: npx tsx guards/check-guard-roster.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { requireRootOrExit, report, type Finding } from './guard-protocol.js';
import { resolveWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { GUARDS } from './guards.js';

const GUARDS_DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(GUARDS_DIR, '..'));
const ROOT = resolveWorkflowsRoot(DEFAULT_ROOT);

/** A guard program path as prose spells it. */
const GUARD_PATH = /guards\/([a-z0-9-]+)\.ts/g;

/**
 * Where a list stops being a pointer. Two named checks answer a reader; three is an inventory.
 * The registry and the runners are not programs a roster enumerates, so they do not count toward it.
 */
const ROSTER_THRESHOLD = 3;
const NOT_A_PROGRAM = new Set(['guards', 'check-all', 'check-delta']);

function markdownFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) markdownFiles(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

function collect(root: string = ROOT): Finding[] {
  const findings: Finding[] = [];

  for (const file of markdownFiles(root)) {
    const text = readFileSync(file, 'utf-8');
    const site = relative(root, file);
    const cited = new Map<string, number>();

    for (const match of text.matchAll(GUARD_PATH)) {
      const name = match[1]!;
      if (NOT_A_PROGRAM.has(name)) continue;
      if (!cited.has(name)) cited.set(name, text.slice(0, match.index).split('\n').length);
    }

    for (const [name, line] of cited) {
      if (existsSync(join(GUARDS_DIR, `${name}.ts`))) continue;
      findings.push({
        check: 'missing-program',
        site: `${site}:${line}`,
        detail: `cites 'guards/${name}.ts', and the repository has no such file — the program named here cannot run`,
      });
    }

    if (cited.size >= ROSTER_THRESHOLD) {
      findings.push({
        check: 'restated-roster',
        site,
        detail: `names ${cited.size} guard programs of the registry's ${GUARDS.length} — a roster kept by hand, which goes stale in both directions`,
      });
    }
  }

  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = requireRootOrExit('guard-roster', DEFAULT_ROOT);
  report('guard-roster', collect(root), {
    okMessage: 'every guard program the corpus cites exists, and no file restates the roster',
    root,
    remedy: 'cite guards/guards.ts and run the suite through its runner, rather than naming programs one by one',
  });
}

export { collect };
