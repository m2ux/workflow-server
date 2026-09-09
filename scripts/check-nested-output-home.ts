/**
 * check-nested-output-home — every nested output component is declared in one place.
 *
 * A technique group splits its I/O contract between a container and its operations. The container
 * declares what the group shares; each operation declares what it produces, with `#### artifact`
 * and `#### audience` on the file it writes. A nested `####` component under an output names a part
 * of that output's content.
 *
 * Two shapes put one component in two places, and both drift:
 *
 *   same-id — the container declares output `X` with component `c`, and an operation declares the
 *   same output `X` with the same component `c`. Whoever edits one has no signal that the other
 *   exists, and the two statements diverge into different descriptions of the same value.
 *
 *   sibling-top-level — the container nests component `c` under its artifact output, and a sibling
 *   operation declares `c` as a top-level output of its own. The same value is a part of a document
 *   in one file and a first-class product in another.
 *
 * Every instance found by hand had already drifted by the time it was read — one container called a
 * component "sections added during user-driven loop" where the operation producing it called them
 * "findings for the selected area". A description that has drifted still reads as current fact.
 *
 * The operation keeps the declaration: it produces the value, and it sits beside the artifact and
 * audience declarations for the same output. A container component no operation re-declares is
 * untouched — that is the working split, not a defect.
 *
 * Run: npx tsx scripts/check-nested-output-home.ts [--root <workflows-dir>] [--json]
 */
import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));
const TRIAGE = resolve(join(DIR, 'nested-output-home-triage.json'));

interface TriageEntry {
  site: string;
  component: string;
  verdict: string;
  rationale: string;
}

/**
 * Accepted debt.
 *
 * The remedy this guard names — the producing operation keeps the declaration — assumes the two
 * statements mean the same thing. Where they do not, applying it adopts one meaning over the other,
 * and which is correct is a question about the workflow that produces the values rather than about
 * the duplication. Those entries are triaged until that workflow is walked.
 */
function loadTriage(): { entries: TriageEntry[] } {
  if (!existsSync(TRIAGE)) return { entries: [] };
  return JSON.parse(readFileSync(TRIAGE, 'utf-8')) as { entries: TriageEntry[] };
}

/** `#### artifact` and `#### audience` declare where a file lands, not a content component. */
const NOT_A_COMPONENT = new Set(['artifact', 'audience', 'default']);

/** {outputId: [component ids]} read from a file's `## Outputs` section. */
function outputs(path: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let inside = false;
  let current: string | null = null;
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    if (/^## /.test(line)) {
      inside = /^## +Outputs\s*$/i.test(line);
      current = null;
      continue;
    }
    if (!inside) continue;
    const top = line.match(/^### +(\S+)\s*$/);
    if (top) {
      current = top[1].trim();
      out.set(current, []);
      continue;
    }
    const nested = line.match(/^#### +(\S+)\s*$/);
    if (nested && current) {
      const id = nested[1].trim();
      if (!NOT_A_COMPONENT.has(id.toLowerCase())) out.get(current)!.push(id);
    }
  }
  return out;
}

/** Every group container in the corpus: a directory holding a TECHNIQUE.md. */
function containers(root: string): string[] {
  const out: string[] = [];
  const visit = (dir: string) => {
    if (!existsSync(dir)) return;
    const names = readdirSync(dir).sort();
    if (names.includes('TECHNIQUE.md')) out.push(join(dir, 'TECHNIQUE.md'));
    for (const name of names) {
      if (name === '.git') continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) visit(path);
    }
  };
  visit(root);
  return out;
}

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  const out: Finding[] = [];
  const files = containers(root);
  assertScanned(files.length, 'technique group container(s)', root);
  const accepted = new Map(loadTriage().entries.map((e) => [`${e.site} ${e.component}`, e]));
  const matched = new Set<string>();
  for (const container of files) {
    const dir = join(container, '..');
    const declared = outputs(container);
    if (declared.size === 0) continue;
    // Every nested component the container declares, and which output it sits under.
    const nested = new Map<string, string>();
    for (const [outputId, comps] of declared) for (const c of comps) nested.set(c, outputId);
    if (nested.size === 0) continue;

    for (const name of readdirSync(dir).sort()) {
      if (name === 'TECHNIQUE.md' || !name.endsWith('.md')) continue;
      const opPath = join(dir, name);
      if (statSync(opPath).isDirectory()) continue;
      const opOutputs = outputs(opPath);
      const site = relative(root, opPath);
      for (const [opOutputId, comps] of opOutputs) {
        // sibling-top-level: the operation declares at top level what the container nests.
        if (nested.has(opOutputId) && !accepted.has(`${site} ${opOutputId}`)) {
          out.push({
            check: 'nested-output-declared-once',
            site,
            detail:
              `declares '${opOutputId}' as a top-level output while `
              + `${relative(root, container)} nests it under '${nested.get(opOutputId)}' — two homes for one `
              + `value. The producing operation keeps it; drop the container's nested component`,
          });
        }
        if (nested.has(opOutputId)) matched.add(`${site} ${opOutputId}`);
        // same-id: both declare the same output with the same nested component.
        for (const c of comps) {
          if (declared.get(opOutputId)?.includes(c)) {
            if (accepted.has(`${site} ${c}`)) {
              matched.add(`${site} ${c}`);
              continue;
            }
            out.push({
              check: 'nested-output-declared-once',
              site,
              detail:
                `output '${opOutputId}' declares component '${c}', which `
                + `${relative(root, container)} also declares under the same output — two homes for one `
                + `value. The producing operation keeps it; drop the container's nested component`,
            });
          }
        }
      }
    }
  }
  // A triage entry matching nothing is stale — the duplication was resolved. Reporting it keeps the
  // ledger from outliving the debt it records, the convention the sibling triage ledgers state.
  for (const [key, entry] of accepted) {
    if (matched.has(key)) continue;
    out.push({
      check: 'nested-output-home-triage-stale',
      site: entry.site,
      detail: `triage entry for '${entry.component}' matches no finding — the duplication was resolved; delete the entry from scripts/nested-output-home-triage.json`,
    });
  }
  return out.sort((a, b) => (a.site + a.detail).localeCompare(b.site + b.detail));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  // Name the accepted-debt count in the clean message, so a passing guard never reads as "every
  // component has one home" while some of them still have two.
  const owed = loadTriage().entries.length;
  await runGuard('nested-output-home', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: owed === 0
      ? 'every nested output component is declared in one place'
      : `every nested output component is declared in one place (${owed} triaged as still doubled)`,
  });
}
