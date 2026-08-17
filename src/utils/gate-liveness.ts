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

/**
 * Paths a condition reads, split by whether absence is itself an answer: `exists` / `notExists`
 * answer on a missing variable, every other operator needs a value to compare.
 */
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
 * What a step's gate evaluates to for the whole of the activity being delivered, or `undefined` where
 * that has no answer yet: the gate reads a variable this activity produces, reads one that is not in
 * the bag at all, or does not parse. See docs/resource_resolution_model.md § Which steps get inlined.
 *
 * A step declaring no gate answers `true`; declaring both `when` and `condition` answers under
 * and-semantics.
 */
export function gateAnswer(args: {
  when?: string | undefined;
  condition?: Condition | undefined;
  variables: Record<string, unknown>;
  writtenInActivity: ReadonlySet<string>;
}): boolean | undefined {
  const { when, condition, variables, writtenInActivity } = args;
  if (when === undefined && condition === undefined) return true;

  const valuePaths = new Set<string>();
  const presencePaths = new Set<string>();
  if (when !== undefined) {
    const parsed = parseWhen(when);
    if (!parsed.ok) return undefined;
    collectWhenPaths(parsed.ast, valuePaths);
  }
  if (condition !== undefined) collectConditionPaths(condition, valuePaths, presencePaths);

  for (const path of [...valuePaths, ...presencePaths]) {
    if (writtenInActivity.has(rootOf(path))) return undefined;
  }
  // Both evaluators return false for an unbound read and for a false one. A compared value that is
  // absent is the first, so it has no answer rather than a negative one.
  for (const path of valuePaths) {
    if (readPath(path, variables) === undefined) return undefined;
  }

  const whenSays = when === undefined ? true : evaluateWhenExpression(when, variables);
  const conditionSays = condition === undefined ? true : evaluateCondition(condition, variables);
  return whenSays && conditionSays;
}

/** And-combine an enclosing gate's answer with a step's own. */
export function bothGates(outer: boolean | undefined, own: boolean | undefined): boolean | undefined {
  if (outer === false || own === false) return false;
  if (outer === undefined || own === undefined) return undefined;
  return true;
}
