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
 * continuation test to state. A repeat-until loop is bounded by its test: it declares
 * `continueWhile`, and iterates no collection. Each rule below is one half of that.
 *
 * A repeat-until loop with no continuation test is also the unbounded case — nothing in the
 * definition says when it stops — so `repeat-loop-without-continuation` covers it and no separate
 * ceiling rule is needed. `condition` on a loop needs no rule either: a step kind is a closed
 * object, so the field is already a schema error.
 *
 * Hard zero, no baseline: every loop in the corpus satisfies both partitions the moment the
 * continuation test moves to its own key.
 *
 * Run: npx tsx scripts/check-loop-shape.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

interface LoopStep {
  id?: unknown;
  loopType?: unknown;
  over?: unknown;
  variable?: unknown;
  continueWhile?: unknown;
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
  const workflows = readdirSync(root).filter((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory() && existsSync(join(path, 'activities'));
  });
  // Recursive, because activity definitions also sit a level down — `meta/activities/patterns/`
  // holds five, and a flat read leaves them unscanned while `assertScanned` still passes.
  const definitions = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return definitions(path);
      return entry.name.endsWith('.yaml') ? [path] : [];
    });

  for (const workflow of workflows.sort()) {
    // `workflow.yaml` too: a workflow file may carry activities inline, loops and all.
    const roots = [join(root, workflow, 'workflow.yaml')].filter((path) => existsSync(path));
    for (const path of [...roots, ...definitions(join(root, workflow, 'activities'))]) {
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
