/**
 * check-self-composed-set — deterministic guard for a `set` action whose value is
 * built out of the variable it writes.
 *
 * `set { target: output_path, value: "{output_path}/{group.subdir}" }` reads as descending
 * one level. Reached a second time it descends from where it already is, so the value
 * compounds and the directory the run started from is unreachable. Inside a loop that is
 * every iteration; on a re-entered activity it is every pass. Where the target is a path,
 * the base the whole run writes into is what goes missing.
 *
 * A step that needs both a base and a derived value needs two names: one variable the run
 * establishes once, and one the step composes from it. That is also what makes the
 * derivation readable — `{evaluation_output_path}/{group.subdir}` says which part is
 * fixed, where `{output_path}/{group.subdir}` says only that something grew.
 *
 * Accumulator appends are the legitimate shape of self-reference, and they are how a
 * collection is built: a value that IS the target, or the target inside a JSON array or
 * object literal, is an append rather than a compose. Those pass. What fails is a target
 * interpolated into surrounding text — a path segment, a delimiter, another variable.
 *
 * This is a hard-zero rule: every violation splits into two variables.
 *
 * Run:
 *   npx tsx scripts/check-self-composed-set.ts
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertScanned, resolveWorkflowsRoot } from './workflows-root.js';
import { measureOrExit } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
// Defaults to ../workflows; --root <path> or WORKFLOWS_DIR redirects to a worktree.
const ROOT = resolveWorkflowsRoot(join(DIR, '..', 'workflows'));

export interface SelfComposedSetViolation { site: string; detail: string }

/**
 * True when `value` appends to `target` rather than composing a new value out of it.
 *
 * Read the value with every `{…}` interpolation removed and judge what is left. Nothing
 * left, from a single interpolation, is the target restated (`{items}`). Only collection
 * punctuation left is a literal holding it (`[{items}, {new}]`, `{ "acc": {items} }`).
 * Anything else left is text the target was placed inside — a path separator, a
 * delimiter, a word — and that is a compose.
 *
 * The two are told apart by residue rather than by first and last character, because an
 * interpolation and an object literal both open with a brace: `{base}/{leaf}` would
 * otherwise read as a collection.
 */
function isAccumulatorAppend(value: string, target: string): boolean {
  const trimmed = value.trim();
  if (trimmed === `{${target}}`) return true;
  const interpolations = trimmed.match(/\{[^}]*\}/g) ?? [];
  const residue = trimmed.replace(/\{[^}]*\}/g, '').trim();
  if (residue === '') return interpolations.length <= 1;
  // Array of interpolations, or an object literal — a key/value colon or a spread is what
  // makes a brace a literal rather than an interpolation.
  if (/^[[\],\s]+$/.test(residue)) return true;
  return /^[{[]/.test(trimmed) && /[}\]]$/.test(trimmed) && /[:]|\.\.\./.test(residue);
}

/** Flag a `set` action whose value interpolates its own target into surrounding text. */
function checkStep(step: Record<string, unknown>, file: string, out: SelfComposedSetViolation[]): void {
  const acts = step.actions;
  if (!Array.isArray(acts)) return;
  for (const a of acts) {
    if (!a || typeof a !== 'object' || Array.isArray(a)) continue;
    const act = a as Record<string, unknown>;
    if (act.action !== 'set' || typeof act.target !== 'string' || typeof act.value !== 'string') continue;
    const target = act.target;
    const value = act.value;
    const re = new RegExp('\\{' + target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\.[^}]*)?\\}');
    if (!re.test(value)) continue;
    if (isAccumulatorAppend(value, target)) continue;
    out.push({
      site: `${file}[${step.id ?? '?'}]`,
      detail: `set '${target}' composes its value from {${target}} — reached twice it compounds, and the value the run started from is unreachable. Split into the variable the run establishes and the one this step derives`,
    });
  }
}

/** Recursively walk every `steps[]` array, loop bodies included. */
function walk(node: unknown, file: string, out: SelfComposedSetViolation[]): void {
  if (Array.isArray(node)) { for (const n of node) walk(n, file, out); return; }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === 'steps' && Array.isArray(v)) {
      for (const step of v) if (step && typeof step === 'object' && !Array.isArray(step)) checkStep(step as Record<string, unknown>, file, out);
    }
    walk(v, file, out);
  }
}

export function collectSelfComposedSetViolations(root: string = ROOT): SelfComposedSetViolation[] {
  const out: SelfComposedSetViolation[] = [];
  let scanned = 0;
  const wfs = readdirSync(root).filter((d) => {
    const p = join(root, d);
    return statSync(p).isDirectory() && existsSync(join(p, 'activities'));
  });
  for (const wf of wfs.sort()) {
    const adir = join(root, wf, 'activities');
    for (const f of readdirSync(adir).filter((x) => x.endsWith('.yaml'))) {
      const rel = relative(root, join(adir, f));
      scanned++;
      try { walk(parseDefinition(readFileSync(join(adir, f), 'utf-8')), rel, out); }
      catch { /* malformed YAML is validate-workflow-yaml's job, not this guard's */ }
    }
  }
  assertScanned(scanned, 'activity files', root);
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = measureOrExit('self-composed-set', join(DIR, '..', 'workflows'), collectSelfComposedSetViolations);
  if (violations.length) {
    process.stdout.write(`self-composed set: ${violations.length} set action(s) compose a value from the variable they write — split the base from the derivation:\n`);
    for (const v of violations.sort((a, b) => a.site.localeCompare(b.site))) process.stdout.write(`  ${v.site} — ${v.detail}\n`);
    process.exit(1);
  }
  process.stdout.write('self-composed set: OK — no set action builds its value out of the variable it writes\n');
}
