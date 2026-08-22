import { evaluateCondition, type Condition } from '../schema/condition.schema.js';
import { evaluateWhenExpression, parseWhen, type WhenAst } from '../schema/when-expression.js';
import type { ProducerSite } from './binding-provenance.js';

/** The bag entry a dotted path belongs to: writers name whole variables, gates read into them. */
function rootOf(path: string): string {
  return path.split('.')[0] ?? path;
}

function collectWhenPaths(ast: WhenAst, out: Set<string>): void {
  switch (ast.kind) {
    case 'literal':
      return;
    case 'truthy':
    case 'cmp':
      out.add(ast.path);
      return;
    case 'not':
      collectWhenPaths(ast.expr, out);
      return;
    case 'and':
    case 'or':
      collectWhenPaths(ast.left, out);
      collectWhenPaths(ast.right, out);
      return;
  }
}

/** Paths a condition reads. `exists` / `notExists` answer on a missing variable; the rest need a value. */
function collectConditionPaths(
  condition: Condition,
  value: Set<string>,
  presence: Set<string>,
): void {
  switch (condition.type) {
    case 'simple':
      if (condition.operator === 'exists' || condition.operator === 'notExists') {
        presence.add(condition.variable);
      } else {
        value.add(condition.variable);
      }
      return;
    case 'and':
    case 'or':
      for (const c of condition.conditions) collectConditionPaths(c, value, presence);
      return;
    case 'not':
      collectConditionPaths(condition.condition, value, presence);
      return;
  }
}

/** Resolve a dotted bag path, mirroring both reference evaluators' lookup. */
function readPath(path: string, variables: Record<string, unknown>): unknown {
  let cur: unknown = variables;
  for (const part of path.split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/**
 * Bag entries the producer scan places inside `activityId` — technique outputs and their remaps,
 * checkpoint-effect assignments, `action: set` targets, and loop item variables.
 */
export function variablesWrittenIn(
  producers: readonly ProducerSite[],
  activityId: string,
): Set<string> {
  const written = new Set<string>();
  for (const site of producers) {
    if (site.activityId === activityId) written.add(rootOf(site.name));
  }
  return written;
}

/**
 * Bag entries a gate can only be satisfied by a *present* value of, absent from `variables`. Such a
 * gate is false for want of an answer rather than because the answer is no, and once its step is
 * skipped the two are indistinguishable.
 *
 * Negative and presence forms are left out, because absence answers them: `x != true` and
 * `notExists x` hold on a missing variable, which is how this corpus spells "not in that mode".
 */
export function unboundPositiveReads(
  when: string | undefined,
  condition: Condition | undefined,
  variables: Record<string, unknown>,
): string[] {
  const paths = new Set<string>();
  const fromWhen = (ast: WhenAst): void => {
    switch (ast.kind) {
      case 'literal':
        return;
      case 'truthy':
        paths.add(ast.path);
        return;
      case 'cmp':
        if (ast.op !== '!=') paths.add(ast.path);
        return;
      case 'not':
        return; // negation is satisfied by absence
      default:
        fromWhen(ast.left);
        fromWhen(ast.right);
    }
  };
  if (when !== undefined) {
    const parsed = parseWhen(when);
    if (parsed.ok) fromWhen(parsed.ast);
  }
  const fromCondition = (c: Condition): void => {
    if (c.type === 'simple') {
      if (c.operator !== '!=' && c.operator !== 'exists' && c.operator !== 'notExists') {
        paths.add(c.variable);
      }
      return;
    }
    if (c.type === 'and' || c.type === 'or') {
      for (const sub of c.conditions) fromCondition(sub);
    }
  };
  if (condition !== undefined) fromCondition(condition);

  const unbound: string[] = [];
  for (const path of paths) {
    if (readPath(path, variables) === undefined) unbound.push(rootOf(path));
  }
  return unbound;
}

/**
 * Why a gate has no answer at delivery time. The three are separate because they call for different
 * responses, and one counter over all of them says only that something was deferred:
 *
 * - `pending` — this activity produces the variable, so the answer arrives while the run is under
 *   way. Ordinary lazy delivery, and the expected reason on a healthy activity.
 * - `unbound` — the variable is absent from the bag and no step of this activity writes it, so
 *   nothing on the path taken so far has produced it. Either an upstream activity should have set
 *   it, or the gate reads a name that never gets bound.
 * - `unparsed` — the expression does not parse, so it has no reading at all. The corpus guards own
 *   this one; delivery only declines to guess.
 */
export type GateUnanswered = 'pending' | 'unbound' | 'unparsed';

/** A tally of unanswered gates by reason, one field per `GateUnanswered`. */
export interface GateUnansweredCounts {
  pending: number;
  unbound: number;
  unparsed: number;
}

/**
 * What the gate evaluates to for the whole activity, and where there is no answer, why. The two
 * arms carry the reason exactly where one exists, so reading it needs no assertion.
 */
export type GateVerdict =
  | { answer: boolean; reason?: undefined }
  | { answer: undefined; reason: GateUnanswered };

/**
 * What a step's gate evaluates to for the whole of the activity being delivered, or no answer and
 * the reason why. `when` and `condition` combine under and-semantics; no gate answers `true`.
 * The cases and what each means for delivery: docs/resource-resolution-model.md § Which steps get inlined.
 */
export function gateAnswer(args: {
  when?: string | undefined;
  condition?: Condition | undefined;
  variables: Record<string, unknown>;
  writtenInActivity: ReadonlySet<string>;
}): GateVerdict {
  const { when, condition, variables, writtenInActivity } = args;
  if (when === undefined && condition === undefined) return { answer: true };

  const valuePaths = new Set<string>();
  const presencePaths = new Set<string>();
  if (when !== undefined) {
    const parsed = parseWhen(when);
    if (!parsed.ok) return { answer: undefined, reason: 'unparsed' };
    collectWhenPaths(parsed.ast, valuePaths);
  }
  if (condition !== undefined) collectConditionPaths(condition, valuePaths, presencePaths);

  for (const path of [...valuePaths, ...presencePaths]) {
    if (writtenInActivity.has(rootOf(path))) return { answer: undefined, reason: 'pending' };
  }
  // Both evaluators return false for an unbound read and for a false one. A compared value that is
  // absent is the first, so it has no answer rather than a negative one.
  for (const path of valuePaths) {
    if (readPath(path, variables) === undefined) return { answer: undefined, reason: 'unbound' };
  }

  const whenSays = when === undefined ? true : evaluateWhenExpression(when, variables);
  const conditionSays = condition === undefined ? true : evaluateCondition(condition, variables);
  return { answer: whenSays && conditionSays };
}

/**
 * And-combine an enclosing gate's verdict with a step's own.
 *
 * Where both lack an answer the enclosing reason is the one reported: it strands the whole body
 * whatever the body's own gate would have said, so it is the reason the step stayed lazy.
 */
export function bothGates(outer: GateVerdict, own: GateVerdict): GateVerdict {
  if (outer.answer === false || own.answer === false) return { answer: false };
  if (outer.answer === undefined) return outer;
  if (own.answer === undefined) return own;
  return { answer: true };
}
