/**
 * check-decision-order — a checkpoint may not decide a value an earlier step already read (#469).
 *
 * A step gated on a variable no earlier step could have bound reads nothing, so it is skipped; the
 * checkpoint that would have bound it runs later and its answer arrives too late to steer anything.
 * The run completes, having asked a question that changed nothing.
 *
 * What the rule keys on, and why each exemption holds: docs/checkpoint-model.md § Where a Checkpoint
 * Belongs.
 *
 * Run: npx tsx scripts/check-decision-order.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { parseWhen, type WhenAst } from '../src/schema/when-expression.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { declaredVariables } from './workflow-declarations.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

interface Step {
  kind?: string;
  id?: string;
  when?: string;
  condition?: unknown;
  actions?: { action?: string }[];
  options?: { effect?: { setVariable?: Record<string, unknown>; transitionTo?: string } }[];
}

/** A value a gate requires of one variable. Only conjuncts a run must satisfy to reach the step. */
interface Requirement {
  variable: string;
  negated: boolean;
  value: string;
}

/** The bag entry a dotted path belongs to: writers name whole variables, gates read into them. */
function rootOf(path: string): string {
  return path.split('.')[0] ?? path;
}

/**
 * Variables a gate needs a *value* for. `exists` / `notExists` answer on a missing variable, so a
 * presence read is not waiting on anything and is left out.
 */
function valueReads(step: Step): Set<string> {
  const out = new Set<string>();
  if (typeof step.when === 'string') {
    const parsed = parseWhen(step.when);
    if (parsed.ok) collectWhenReads(parsed.ast, out);
  }
  collectConditionReads(step.condition, out);
  return out;
}

function collectWhenReads(ast: WhenAst, out: Set<string>): void {
  switch (ast.kind) {
    case 'literal':
      return;
    case 'truthy':
    case 'cmp':
      out.add(rootOf(ast.path));
      return;
    case 'not':
      collectWhenReads(ast.expr, out);
      return;
    default:
      collectWhenReads(ast.left, out);
      collectWhenReads(ast.right, out);
  }
}

function collectConditionReads(condition: unknown, out: Set<string>): void {
  if (condition === null || typeof condition !== 'object') return;
  const c = condition as Record<string, unknown>;
  if (typeof c.variable === 'string' && c.operator !== 'exists' && c.operator !== 'notExists') {
    out.add(rootOf(c.variable));
  }
  for (const sub of Array.isArray(c.conditions) ? c.conditions : []) collectConditionReads(sub, out);
  collectConditionReads(c.condition, out);
}

/** Requirements provable from a gate: equality conjuncts only. An `or` proves nothing about a run. */
function requirements(step: Step): Requirement[] {
  const out: Requirement[] = [];
  if (typeof step.when === 'string') {
    const parsed = parseWhen(step.when);
    if (parsed.ok) collectWhenRequirements(parsed.ast, out);
  }
  collectConditionRequirements(step.condition, out);
  return out;
}

function collectWhenRequirements(ast: WhenAst, out: Requirement[]): void {
  if (ast.kind === 'and') {
    collectWhenRequirements(ast.left, out);
    collectWhenRequirements(ast.right, out);
    return;
  }
  if (ast.kind !== 'cmp' || (ast.op !== '==' && ast.op !== '!=')) return;
  out.push({ variable: rootOf(ast.path), negated: ast.op === '!=', value: String(ast.value) });
}

function collectConditionRequirements(condition: unknown, out: Requirement[]): void {
  if (condition === null || typeof condition !== 'object') return;
  const c = condition as Record<string, unknown>;
  if (c.type === 'simple') {
    if ((c.operator === '==' || c.operator === '!=') && typeof c.variable === 'string') {
      out.push({ variable: rootOf(c.variable), negated: c.operator === '!=', value: String(c.value) });
    }
    return;
  }
  if (c.type !== 'and') return;
  for (const sub of Array.isArray(c.conditions) ? c.conditions : []) {
    collectConditionRequirements(sub, out);
  }
}

/** Whether two gates demand incompatible values of one variable, so no run reaches both steps. */
function neverBothRun(a: Requirement[], b: Requirement[]): boolean {
  for (const ra of a) {
    for (const rb of b) {
      if (ra.variable !== rb.variable) continue;
      if (!ra.negated && !rb.negated) {
        if (ra.value !== rb.value) return true;
      } else if (ra.negated !== rb.negated && ra.value === rb.value) {
        return true;
      }
    }
  }
  return false;
}

/** Whether a skipped run loses anything. An announcement that does not fire costs nothing. */
function doesWork(step: Step): boolean {
  if (step.kind === 'technique' || step.kind === 'loop') return true;
  if (step.kind !== 'action') return false;
  const actions = step.actions ?? [];
  return actions.some((a) => a.action !== 'message' && a.action !== 'log');
}

/** Variables a checkpoint's options bind, minus those bound by an option that re-enters. */
function decidedVariables(step: Step): Set<string> {
  const decided = new Set<string>();
  const reentrant = new Set<string>();
  for (const option of step.options ?? []) {
    const set = option.effect?.setVariable;
    if (set === undefined) continue;
    const target = typeof option.effect?.transitionTo === 'string' ? reentrant : decided;
    for (const name of Object.keys(set)) target.add(name);
  }
  for (const name of reentrant) decided.delete(name);
  return decided;
}

/** Declared variables carrying a `defaultValue`: an earlier read of one has the default to read. */
function defaultedVariables(root: string, workflowId: string): Set<string> {
  const out = new Set<string>();
  for (const [name, declaration] of declaredVariables(root, workflowId)) {
    if (declaration.defaultValue !== undefined) out.add(name);
  }
  return out;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const workflow of readdirSync(root).sort()) {
    const workflowDir = join(root, workflow);
    const activitiesDir = join(workflowDir, 'activities');
    if (!existsSync(activitiesDir) || !statSync(activitiesDir).isDirectory()) continue;
    const defaulted = defaultedVariables(root, workflow);
    for (const entry of readdirSync(activitiesDir).sort()) {
      if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
      const path = join(activitiesDir, entry);
      const def = parse(readFileSync(path, 'utf-8')) as { id?: string; steps?: Step[] } | null;
      scanned++;
      const steps = def?.steps ?? [];
      steps.forEach((checkpoint, index) => {
        if (checkpoint.kind !== 'checkpoint') return;
        const gate = requirements(checkpoint);
        for (const name of decidedVariables(checkpoint)) {
          if (defaulted.has(name)) continue;
          const reader = steps
            .slice(0, index)
            .find((s) => doesWork(s) && valueReads(s).has(name) && !neverBothRun(requirements(s), gate));
          if (reader === undefined) continue;
          findings.push({
            check: 'decides-after-use',
            site: `${relative(root, path)}::${checkpoint.id ?? '?'}`,
            detail: `checkpoint '${checkpoint.id ?? '?'}' decides '${name}', which step `
              + `'${reader.id ?? '?'}' is already gated on — that step runs first, reads nothing, and `
              + `is skipped. Move the checkpoint above it, or give '${name}' a producer that runs first.`,
          });
        }
      });
    }
  }
  assertScanned(scanned, 'activity files', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('decision-order', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no checkpoint decides a value an earlier step already read',
    remedy: 'move the checkpoint above the step gated on its decision, or give that variable an earlier producer',
  });
}
