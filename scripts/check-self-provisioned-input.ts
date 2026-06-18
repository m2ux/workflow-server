/**
 * check-self-provisioned-input — deterministic guard for anti-pattern AP-68.
 *
 * A step's bound technique resolves its `inputs` when the technique is invoked; the step's own
 * `set` actions are side-effects of that same step. There is no contract that a step's actions
 * resolve BEFORE its technique inputs are interpolated, so a technique input that interpolates a
 * variable the SAME step `set`s is a self-reference / ordering hazard — the value may be unbound at
 * invocation, and producer + consumer are the same step. Such a value is almost always a derivation
 * of a variable established UPSTREAM (e.g. a base name derived from a path set activities earlier);
 * the derivation belongs where its source is established (or as a genuine output of an earlier
 * step's technique), never lazily produced as a side-effect on the consuming step.
 *
 * This flags any step where a `set` action's `target` is interpolated (`{target}` or `{target.x}`)
 * into a value of that same step's `technique.inputs`. It is the INPUT-side complement of AP-67
 * (a `set` capturing the bound technique's OUTPUT): AP-67 externalizes an output, AP-68
 * self-provisions an input. This is a hard-zero rule (no baseline): every violation must be fixed
 * by hoisting the derivation upstream of the consumer.
 *
 * Run:
 *   npx tsx scripts/check-self-provisioned-input.ts
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { decodeToonRaw } from '../src/utils/toon.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(DIR, '..', 'workflows');

export interface SelfProvisionedInputViolation { site: string; detail: string }

/** Collect the `target`s of a step's `set` actions. */
function setTargets(step: Record<string, unknown>): string[] {
  const acts = step.actions;
  if (!Array.isArray(acts)) return [];
  return acts
    .filter((a): a is Record<string, unknown> => !!a && typeof a === 'object' && !Array.isArray(a))
    .filter((a) => a.action === 'set' && typeof a.target === 'string')
    .map((a) => a.target as string);
}

/** Flag a step whose technique input interpolates a variable the same step `set`s. */
function checkStep(step: Record<string, unknown>, file: string, out: SelfProvisionedInputViolation[]): void {
  const tech = step.technique;
  if (!tech || typeof tech !== 'object' || Array.isArray(tech)) return; // bare-string binding carries no inputs
  const inputs = (tech as Record<string, unknown>).inputs;
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) return;
  const targets = setTargets(step);
  if (!targets.length) return;
  for (const [key, value] of Object.entries(inputs as Record<string, unknown>)) {
    if (typeof value !== 'string') continue;
    for (const t of targets) {
      const re = new RegExp('\\{' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\.[^}]*)?\\}');
      if (re.test(value)) out.push({ site: `${file}[${step.id ?? '?'}]`, detail: `technique input '${key}' interpolates {${t}}, which this same step provides via a 'set' action — hoist the derivation upstream of the consumer (AP-68)` });
    }
  }
}

/** Recursively walk every `steps[]` array (including loop steps). */
function walk(node: unknown, file: string, out: SelfProvisionedInputViolation[]): void {
  if (Array.isArray(node)) { for (const n of node) walk(n, file, out); return; }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === 'steps' && Array.isArray(v)) {
      for (const step of v) if (step && typeof step === 'object' && !Array.isArray(step)) checkStep(step as Record<string, unknown>, file, out);
    }
    walk(v, file, out);
  }
}

export function collectSelfProvisionedInputViolations(): SelfProvisionedInputViolation[] {
  const out: SelfProvisionedInputViolation[] = [];
  const wfs = readdirSync(ROOT).filter((d) => {
    const p = join(ROOT, d);
    return statSync(p).isDirectory() && existsSync(join(p, 'activities'));
  });
  for (const wf of wfs.sort()) {
    const adir = join(ROOT, wf, 'activities');
    for (const f of readdirSync(adir).filter((x) => x.endsWith('.toon'))) {
      const rel = relative(ROOT, join(adir, f));
      try { walk(decodeToonRaw(readFileSync(join(adir, f), 'utf-8')), rel, out); }
      catch { /* malformed TOON is validate-workflow-toon's job, not this guard's */ }
    }
  }
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectSelfProvisionedInputViolations();
  if (violations.length) {
    process.stdout.write(`self-provisioned input: ${violations.length} step(s) provision their own technique input (AP-68) — hoist the derivation upstream:\n`);
    for (const v of violations.sort((a, b) => a.site.localeCompare(b.site))) process.stdout.write(`  ${v.site} — ${v.detail}\n`);
    process.exit(1);
  }
  process.stdout.write('self-provisioned input: OK — no step interpolates its own set target into its technique inputs\n');
}
