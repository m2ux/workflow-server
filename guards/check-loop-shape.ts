/**
 * check-loop-shape — a loop declares the fields its iteration type uses, and a gate in its body
 * asks once per iteration (#594, #1432).
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
 * A checkpoint in a loop body is one definition the run reaches once per round, and its answer is
 * recorded under `<activity>-<checkpoint>`. An id that reads the same every round therefore holds
 * one answer for the whole loop, and every round after the first replays it: the operator is asked
 * once where the definition declares a decision per round. The discriminator `<base>#{<expression>}`
 * is what separates them — `getCheckpoint` resolves a qualified id back to the one definition, so a
 * key per round costs the definition nothing but the id it is yielded under. `gate-inside-loop`
 * reads shape alone: that the id carries an expression, not that the expression names a value the
 * bag changes each round.
 *
 * A gate a routine declares is unmeasured here. A `kind: routine` step in a loop body splices that
 * routine's steps in at load under a prefix fixed for the site, so a gate inside it reaches this
 * guard in the routine's own file, where no loop encloses it, and its spliced id repeats each round.
 * The two populations do not meet today — of the thirteen routines a loop body refers to, none
 * declares a checkpoint — so the reach stands on what the splice means rather than on a site that
 * exercises it.
 *
 * Hard zero, no baseline: every loop in the corpus satisfies both partitions the moment the
 * continuation test moves to its own key, and every gate in a body names its round.
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

/**
 * The discriminator that gives one checkpoint definition an identity per round: an expression read
 * against the bag, which the yielded id carries resolved. A literal discriminator reads the same
 * every round, so it separates nothing and does not count.
 */
const DISCRIMINATOR = /#\{[^}]+\}/;

/**
 * Every gate the loop body holds directly. A gate in a nested loop belongs to that loop's own pass,
 * which reports it once, and the discriminator it needs is the inner round's.
 */
function checkBodyGates(steps: unknown, site: string, findings: Finding[]): void {
  if (!Array.isArray(steps)) return;
  for (const step of steps) {
    if (!step || typeof step !== 'object') continue;
    const record = step as Record<string, unknown>;
    if (record.kind !== 'checkpoint') continue;
    const id = typeof record.id === 'string' ? record.id : '?';
    if (DISCRIMINATOR.test(id)) continue;
    findings.push({
      check: 'gate-inside-loop',
      site: `${site}.${id}`,
      detail: 'a checkpoint records its answer under `<activity>-<checkpoint>`, and this one is '
        + 'yielded under the same id every round, so the loop holds one answer and every round after '
        + `the first replays it — name the round in the id (\`${id}#{<variable>}\`), whose base still `
        + 'resolves to this one definition',
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
    checkBodyGates(record.steps, `${file}[${id}]`, findings);
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
    // `routines/` too, because a routine body holds loops and an unbounded `while` in a shared body
    // propagates to every reference site rather than to one.
    const owned = [join(dir, 'activities'), join(dir, 'routines')]
      .filter((path) => existsSync(path))
      .flatMap((path) => definitions(path));
    for (const path of owned) {
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
    okMessage: 'every loop declares the fields its iteration type uses, and every gate in a body asks once per round',
    remedy: 'give an item loop its collection and item, a repeat-until loop its continuation test, and a loop-body gate a round in its id',
  });
}
