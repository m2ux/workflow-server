/**
 * check-loop-shape — a loop declares the fields its iteration type uses, and no others (#594).
 *
 * A loop step answers three separate questions, and until `continueWhile` existed two of them shared
 * one field. `condition` was documented as an entry gate and used by every repeat-until loop as a
 * continuation test, so both mechanical readers took the continuation test at entry and six doWhile
 * bodies never ran. Splitting the field fixes the reading; this guard is what keeps the two
 * partitions apart afterwards.
 *
 * An item loop is bounded by its collection: it declares `over` and `variable`, and has no
 * continuation test to state. Its one early exit is `breakCondition`, which stops the walk part way
 * through the collection. A repeat-until loop is bounded by its test: it declares `continueWhile`,
 * iterates no collection, and needs no separate exit, because the test it already takes each pass is
 * where an exit belongs. The rules below are the halves of that partition.
 *
 * `breakCondition` earns a rule of its own rather than a deletion. No corpus loop declares one, so
 * the rule stands on what the field means rather than on a site that exercises it: an item loop is
 * the only loop that can have a reason to stop before its collection ends, because a repeat-until
 * loop already takes a stopping decision every pass. What is worth refusing is therefore not the
 * field but its appearance on a loop that already has a continuation test — one field, one job,
 * which is the whole point of keeping the two partitions apart.
 *
 * A repeat-until loop with no continuation test is also the unbounded case — nothing in the
 * definition says when it stops — so `repeat-loop-without-continuation` covers it and no separate
 * ceiling rule is needed. `condition` on a loop needs no rule either: a step kind is a closed
 * object, so the field is already a schema error.
 *
 * Hard zero, no baseline: every loop in the corpus satisfies both partitions the moment the
 * continuation test moves to its own key.
 *
 * Run: npx tsx guards/check-loop-shape.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertScanned, corpusWorkflows, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

interface LoopStep {
  id?: unknown;
  loopType?: unknown;
  over?: unknown;
  variable?: unknown;
  continueWhile?: unknown;
  breakCondition?: unknown;
}

function checkLoop(loop: LoopStep, site: string, findings: Finding[]): void {
  const { loopType } = loop;
  const has = (field: keyof LoopStep): boolean => loop[field] !== undefined && loop[field] !== null;

  if (loopType === 'forEach') {
    const missing = (['over', 'variable'] as const).filter((field) => !has(field));
    if (missing.length > 0) {
      findings.push({
        check: 'item-loop-without-collection',
        site,
        detail: `a forEach loop iterates a collection one item at a time and declares no ${missing.join(' and no ')} `
          + '— name the collection in `over` and the item in `variable`',
      });
    }
    if (has('continueWhile')) {
      findings.push({
        check: 'item-loop-with-continuation',
        site,
        detail: 'a forEach loop is bounded by its collection, so a `continueWhile` states a second '
          + 'stopping rule beside the one the collection already gives — gate the loop with `when`, '
          + 'stop it early with `breakCondition`, or make it a while loop',
      });
    }
    return;
  }

  if (loopType !== 'while' && loopType !== 'doWhile') return;

  if (!has('continueWhile')) {
    findings.push({
      check: 'repeat-loop-without-continuation',
      site,
      detail: `a ${loopType} loop repeats while its continuation test holds, and this one declares none, `
        + 'so nothing in the definition says when it stops — state the test in `continueWhile`',
    });
  }
  for (const field of ['over', 'variable'] as const) {
    if (!has(field)) continue;
    findings.push({
      check: 'repeat-loop-with-collection',
      site,
      detail: `a ${loopType} loop repeats until its test fails rather than walking a collection, so `
        + `\`${field}\` belongs to a forEach — move the loop to \`loopType: forEach\` or drop the field`,
    });
  }
  if (has('breakCondition')) {
    findings.push({
      check: 'repeat-loop-with-break',
      site,
      detail: `a ${loopType} loop already decides each pass in \`continueWhile\`, so a \`breakCondition\` `
        + 'is a second stopping rule beside it, evaluated at a different moment — fold the exit into '
        + 'the continuation test',
    });
  }
}

/** Every `kind: loop` step under any `steps[]`, nested loop bodies included. */
function walk(node: unknown, file: string, findings: Finding[]): void {
  if (Array.isArray(node)) { for (const child of node) walk(child, file, findings); return; }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  if (record.kind === 'loop') {
    const id = typeof record.id === 'string' ? record.id : '?';
    checkLoop(record as LoopStep, `${file}[${id}]`, findings);
  }
  for (const value of Object.values(record)) walk(value, file, findings);
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  const workflows = corpusWorkflows(root)
    .filter(({ dir }) => existsSync(join(dir, 'activities')) || existsSync(join(dir, 'routines')));
  // Recursive, because activity definitions also sit a level down — `meta/activities/patterns/`
  // holds five, and a flat read leaves them unscanned while `assertScanned` still passes.
  const definitions = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return definitions(path);
      return entry.name.endsWith('.yaml') ? [path] : [];
    });

  for (const { dir } of workflows) {
    // `workflow.yaml` too: a workflow file may carry activities inline, loops and all. And
    // `routines/`, because a routine body holds loops and an unbounded `while` in a shared body
    // propagates to every reference site rather than to one (#704).
    const roots = [join(dir, 'workflow.yaml')].filter((path) => existsSync(path));
    const owned = [join(dir, 'activities'), join(dir, 'routines')]
      .filter((path) => existsSync(path))
      .flatMap((path) => definitions(path));
    for (const path of [...roots, ...owned]) {
      scanned++;
      try {
        walk(parseDefinition(readFileSync(path, 'utf-8')), relative(root, path), findings);
      } catch {
        // Malformed YAML is validate-workflow-yaml's finding, not this guard's.
      }
    }
  }
  assertScanned(scanned, 'activity definitions', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('loop-shape', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every loop declares the fields its iteration type uses, and no others',
    remedy: 'give an item loop its collection and item, and a repeat-until loop its continuation test',
  });
}
