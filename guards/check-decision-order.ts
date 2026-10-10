/**
 * check-decision-order — a checkpoint may not decide a value an earlier step already read (#469).
 *
 * A step gated on a variable no earlier step could have bound reads nothing, so it is skipped; the
 * checkpoint that would have bound it runs later and its answer arrives too late to steer anything.
 * The run completes, having asked a question that changed nothing.
 *
 * What the rule keys on, and why each exemption holds: docs/checkpoint.md § Where a Checkpoint
 * Belongs.
 *
 * Run: npx tsx guards/check-decision-order.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { parseWhen, type WhenAst } from '../src/schema/when-expression.js';
import { type CorpusSource, indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, corpusWorkflows, defaultCorpusDest, ownDefinitionsIn, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';
import { declaredVariables } from './workflow-declarations.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

interface Step {
  kind?: string;
  id?: string;
  when?: string;
  condition?: unknown;
  actions?: { action?: string }[];
  options?: { effect?: { setVariable?: Record<string, unknown>; recordReply?: string; exit?: string } }[];
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
 * Variables a gate needs a *value* for. A presence test answers on a missing variable, so it is
 * not waiting on a later decision and is left out: `exists` / `notExists`, and the inline form
 * that holds for every present non-null value,
 * `x != null && (x == false || x == 0 || x == "" || x)`.
 */
function valueReads(step: Step): Set<string> {
  const out = new Set<string>();
  if (typeof step.when === 'string') {
    const parsed = parseWhen(step.when);
    if (parsed.ok) collectWhenReads(parsed.ast, out, presenceRoots(parsed.ast));
  }
  collectConditionReads(step.condition, out);
  return out;
}

function flattenAnd(ast: WhenAst): WhenAst[] {
  return ast.kind === 'and' ? [...flattenAnd(ast.left), ...flattenAnd(ast.right)] : [ast];
}

function flattenOr(ast: WhenAst): WhenAst[] {
  return ast.kind === 'or' ? [...flattenOr(ast.left), ...flattenOr(ast.right)] : [ast];
}

/** The variable whose falsy-or-truthy disjunction is the present half of an inline presence test. */
function falsyDisjunction(ast: WhenAst): string | null {
  const leaves = flattenOr(ast);
  if (leaves.length !== 4) return null;
  let name: string | null = null;
  const values = new Set<unknown>();
  let sawTruthy = false;
  for (const leaf of leaves) {
    if (leaf.kind === 'truthy') {
      if (sawTruthy) return null;
      sawTruthy = true;
      name = rootOf(leaf.path);
      continue;
    }
    if (leaf.kind !== 'cmp' || leaf.op !== '==') return null;
    values.add(leaf.value);
    const root = rootOf(leaf.path);
    if (name === null) name = root;
    else if (name !== root) return null;
  }
  if (!sawTruthy || name === null) return null;
  if (values.size !== 3 || !values.has(false) || !values.has(0) || !values.has('')) return null;
  return name;
}

/** `x != null && (x == false || x == 0 || x == "" || x)`, and nothing else. */
function existsConjunction(ast: WhenAst): string | null {
  const parts = flattenAnd(ast);
  if (parts.length !== 2) return null;
  let nullCheck: string | null = null;
  let idiom: string | null = null;
  for (const part of parts) {
    if (part.kind === 'cmp' && part.op === '!=' && part.value === null) nullCheck = rootOf(part.path);
    else {
      const found = falsyDisjunction(part);
      if (found) idiom = found;
    }
  }
  return nullCheck !== null && nullCheck === idiom ? nullCheck : null;
}

/** Variables an expression only tests for presence, in either inline shape. */
function presenceRoots(ast: WhenAst): Set<string> {
  const roots = new Set<string>();
  if (ast.kind === 'not') {
    const name = existsConjunction(ast.expr);
    if (name) roots.add(name);
    return roots;
  }
  const nullChecks = new Set<string>();
  const idioms = new Set<string>();
  for (const part of flattenAnd(ast)) {
    if (part.kind === 'not') {
      const name = existsConjunction(part.expr);
      if (name) roots.add(name);
    } else if (part.kind === 'cmp' && part.op === '!=' && part.value === null) {
      nullChecks.add(rootOf(part.path));
    } else {
      const name = falsyDisjunction(part);
      if (name) idioms.add(name);
    }
  }
  for (const name of idioms) if (nullChecks.has(name)) roots.add(name);
  return roots;
}

function isPresenceNode(ast: WhenAst, presence: Set<string>): boolean {
  if (ast.kind === 'not') {
    const name = existsConjunction(ast.expr);
    return name !== null && presence.has(name);
  }
  if (ast.kind === 'cmp' && ast.op === '!=' && ast.value === null && presence.has(rootOf(ast.path))) return true;
  const idiom = falsyDisjunction(ast);
  return idiom !== null && presence.has(idiom);
}

function collectWhenReads(ast: WhenAst, out: Set<string>, presence: Set<string>): void {
  if (isPresenceNode(ast, presence)) return;
  switch (ast.kind) {
    case 'literal':
      return;
    case 'truthy':
    case 'cmp':
      out.add(rootOf(ast.path));
      return;
    case 'not':
      collectWhenReads(ast.expr, out, presence);
      return;
    default:
      collectWhenReads(ast.left, out, presence);
      collectWhenReads(ast.right, out, presence);
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
    if (parsed.ok) collectWhenRequirements(parsed.ast, out, presenceRoots(parsed.ast));
  }
  collectConditionRequirements(step.condition, out);
  return out;
}

function collectWhenRequirements(ast: WhenAst, out: Requirement[], presence: Set<string>): void {
  if (isPresenceNode(ast, presence)) return;
  if (ast.kind === 'and') {
    collectWhenRequirements(ast.left, out, presence);
    collectWhenRequirements(ast.right, out, presence);
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

/** Variables a checkpoint's options bind, minus those bound by an option that leaves the activity. */
function decidedVariables(step: Step): Set<string> {
  const decided = new Set<string>();
  const reentrant = new Set<string>();
  for (const option of step.options ?? []) {
    const names = [
      ...Object.keys(option.effect?.setVariable ?? {}),
      ...(option.effect?.recordReply ? [option.effect.recordReply] : []),
    ];
    const target = typeof option.effect?.exit === 'string' ? reentrant : decided;
    for (const name of names) target.add(name);
  }
  for (const name of reentrant) decided.delete(name);
  return decided;
}

/** Declared variables carrying a `defaultValue`: an earlier read of one has the default to read. */
function defaultedVariables(root: string, workflowId: string, source: CorpusSource = root): Set<string> {
  const out = new Set<string>();
  for (const [name, declaration] of declaredVariables(root, workflowId, source)) {
    if (declaration.defaultValue !== undefined) out.add(name);
  }
  return out;
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  const index = indexCorpus(root);
  for (const { id: workflow, dir: workflowDir } of corpusWorkflows(root, index)) {
    const activitiesDir = join(workflowDir, 'activities');
    if (!existsSync(activitiesDir) || !statSync(activitiesDir).isDirectory()) continue;
    // This workflow's own activities: what suppresses a finding here is its defaulted set.
    const defaulted = defaultedVariables(root, workflow, index);
    for (const { path } of ownDefinitionsIn(activitiesDir)) {
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
