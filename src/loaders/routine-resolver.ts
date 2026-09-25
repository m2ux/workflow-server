/**
 * Routine resolution and materialisation (#704 W02).
 *
 * A `kind: routine` step names a routine, binds its inputs under `with` and its outputs under
 * `outputs`. This module resolves the name, substitutes the reference site's arguments through the
 * routine's body, prefixes every identifier inside it, and splices the result in place of the
 * reference — so everything downstream of the loaders sees ordinary steps and none of them learns
 * the construct.
 *
 * A bare argument means the opposite of what it means one layer down, and the gap between them is
 * closed here rather than left to cancel out. At a reference site a braced word is a reference and
 * a bare word is a literal, because substitution runs at load time and no variable bag exists yet
 * to resolve a name against. At a step the executing agent reads, a bare word that resolves in the
 * bag IS a reference. Substitution emits a resolved reference as the bare name, so a braced
 * argument in a routine file arrives at the step in the form the agent reads as a reference, and
 * the author's meaning survives the change of position. That is load-bearing: emitting the braces
 * would deliver a template, and emitting an unresolved name would deliver a literal, and neither
 * is visible at the step. `meta::variable-binding` states the same three positions corpus-side.
 *
 * Reference addressing carries NO group grammar:
 *   - `namespace::name` — resolved ONLY in that namespace's routines (no fallback). The namespace is
 *     spelled by its directory name or by the path from the corpus root reaching it, so every
 *     segment but the last belongs to it.
 *   - `name` — the declaring workflow's routines first, then meta's.
 *   - an empty segment fails, there being no directory or routine of no name.
 *
 * Every terminal state of a reference but `Checked` fails. None is a warning — a routine that
 * half-resolves would hand a worker a step nobody declared. The surface, grouped by what a site got
 * wrong:
 *
 *   the name        more than one separator; a name no candidate workflow declares; a cycle
 *   the arguments   an argument naming no declared input; an output binding naming no declared
 *                   output; an output left unbound whose declaration does not permit it; an
 *                   technique parameter with no argument, or one bound to something that is not a
 *                   literal reference
 *   the body        a parameter standing where the `when` dialect takes a value; a substitution
 *                   carrying a quote into that position; an operand the dialect cannot read beside a
 *                   parameter the site bound to a literal; a loop iterating or binding its item to a
 *                   dropped output; an action targeting one
 *   the result      two reference steps whose materialised ids collide; a reference block the step
 *                   schema does not admit, which reaches the splice through the raw text path
 *
 * Each of those is authorable, so each has a case that provokes it. Two refusals are not: a step
 * reaching materialisation with no resolved id, which `populateStepIds` fills when a file is read,
 * and a folded comparison the dialect cannot read, whose operands `foldableComparison` matches
 * against the shapes the dialect admits. No definition can produce either, so neither has a fixture
 * and both are defect reports rather than authoring errors.
 *
 * The core is synchronous and pure over a `RoutineLookup`, so the async loaders and the synchronous
 * guard scripts share one resolution semantics.
 */
import {
  type Activity,
  type RoutineStep,
  RoutineStepSchema,
  type Step,
  type TechniqueBinding,
} from '../schema/activity.schema.js';
import type { Condition } from '../schema/condition.schema.js';
import { type Routine, isOperationInput, routineScope } from '../schema/routine.schema.js';
import { evaluateWhenExpression, parseWhen } from '../schema/when-expression.js';
import { parseDefinition, stringifyForResponse } from '../utils/serialization.js';
import { META_WORKFLOW_ID } from './corpus-index.js';

export { META_WORKFLOW_ID };

/** Sync routine lookup by workflow id: routine name → definition. Undefined when absent. */
export type RoutineLookup = (workflowId: string) => ReadonlyMap<string, Routine> | undefined;

export class RoutineResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoutineResolutionError';
  }
}

/** The separator between a workflow prefix and a routine name. */
const SEPARATOR = '::';

/** The identifier prefix separator. `#` is the per-iteration discriminator and `::` names a technique. */
const PREFIX_SEPARATOR = '.';

/**
 * Split `[namespace::]name`.
 *
 * The last segment is the routine, and every segment before it spells the namespace holding it: a
 * routine lives one file deep in a flat `routines/` directory, so there is no group level competing
 * for a segment and no corpus has to be consulted to find where the name begins. A namespace named
 * by a path contributes one segment per directory, so `support::gitnexus::probe` is the routine
 * `probe` in `support/gitnexus`.
 */
export function parseRoutineRef(ref: string, context: string): { namespace?: string; name: string } {
  const segments = ref.split(SEPARATOR);
  const name = segments[segments.length - 1];
  if (!name || segments.some((segment) => segment.length === 0)) {
    throw new RoutineResolutionError(
      `${context}: routine reference '${ref}' carries an empty segment — a routine name is `
      + `'name' or 'namespace::name', the namespace spelled by its directory name or by the path reaching it.`,
    );
  }
  if (segments.length === 1) return { name };
  return { namespace: segments.slice(0, -1).join('/'), name };
}

/** The namespaces a reference may resolve in, in order. */
function candidateWorkflows(ref: string, currentWorkflowId: string, context: string): { workflowIds: string[]; name: string } {
  const { namespace, name } = parseRoutineRef(ref, context);
  if (namespace) return { workflowIds: [namespace], name };
  const workflowIds = currentWorkflowId === META_WORKFLOW_ID
    ? [META_WORKFLOW_ID]
    : [currentWorkflowId, META_WORKFLOW_ID];
  return { workflowIds, name };
}

/** Resolve a routine reference to its definition. */
export function resolveRoutine(
  lookup: RoutineLookup,
  currentWorkflowId: string,
  ref: string,
  context: string,
): Routine {
  const { workflowIds, name } = candidateWorkflows(ref, currentWorkflowId, context);
  for (const workflowId of workflowIds) {
    const routine = lookup(workflowId)?.get(name);
    if (routine !== undefined) return routine;
  }
  throw new RoutineResolutionError(
    `${context}: unresolved routine '${ref}' — no routines/${name}.yaml in `
    + `${workflowIds.map((w) => `'${w}'`).join(' or ')}.`,
  );
}

// ---------------------------------------------------------------------------
// Substitution
// ---------------------------------------------------------------------------

/**
 * What one name in a routine's scope becomes at a reference site.
 *
 * `rename` and `reference` differ only in where they came from — an output binding or a braced
 * argument — and both carry a name, so a braced token keeps its braces and a bare name position
 * takes the name. A `literal` contributes its characters instead: a braced token loses its braces,
 * because rewriting the token root would emit a reference to a variable nothing writes. A `drop`
 * removes the binding that carries it.
 *
 * A declared input a reference site leaves unbound, with no default, has NO entry: it substitutes to
 * itself, which is what makes it take the host's value under the same spelling.
 */
type Substitution =
  | { kind: 'name'; name: string }
  | { kind: 'literal'; value: string | number | boolean }
  | { kind: 'drop' };

type SubstitutionMap = ReadonlyMap<string, Substitution>;

/**
 * What a reference site supplies for each parameter declared `kind: technique`: the parameter's name
 * against the technique reference standing in for it.
 *
 * This is a namespace of its own rather than an entry in the substitution map, because the two
 * substitute in disjoint positions. A value moves through bag names, tokens and expressions; an
 * technique moves into exactly one field, and a body that spelled the parameter anywhere else would
 * be naming a variable the signature does not declare.
 */
export type OperationMap = ReadonlyMap<string, string>;

/** Everything one reference site puts over one routine's body. */
interface SiteBinding {
  names: SubstitutionMap;
  techniques: OperationMap;
}

/** The name a substitution puts in a bare-name position. A dropped binding has none. */
function substitutedName(substitution: Substitution): string | undefined {
  if (substitution.kind === 'name') return substitution.name;
  if (substitution.kind === 'literal') return String(substitution.value);
  return undefined;
}

/** A reference's head: `current_unit.mode` addresses `current_unit`. */
function head(reference: string): string {
  return reference.split('.')[0]!;
}

/** Rewrite the head of a dotted bag reference, keeping the tail. */
function renameHead(reference: string, map: SubstitutionMap): string | undefined {
  const segments = reference.split('.');
  const substitution = map.get(segments[0]!);
  if (!substitution) return reference;
  const name = substitutedName(substitution);
  if (name === undefined) return undefined;
  return [name, ...segments.slice(1)].join('.');
}

const TOKEN_RE = /\{([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)*)\}/g;
const LEADING_IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)*/;
const COMPARISON_TAIL_RE = /(?:==|!=|>=|<=|>|<)\s*$/;
const COMPARISON_HEAD_RE = /^\s*(==|!=|>=|<=|>|<)\s*/;
/**
 * One whole right-hand operand, in the shapes the dialect's tokenizer admits there. The operand ends
 * where a token does, so text the dialect would read as a second token leaves no operand to fold
 * rather than a prefix of one.
 */
const VALUE_HEAD_RE = /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?\d+|[A-Za-z_][A-Za-z0-9_.]*)(?=\s|\)|&|\||$)/;
/** Stands for the folded left operand while the dialect decides the comparison. Never emitted. */
const FOLD_OPERAND = 'routine_fold_operand';

/**
 * Rewrite every `{token}` in a string in ONE pass, so a binding mapping `a → b` and `b → c` renames
 * each occurrence exactly once. An iterative rewrite would yield `c` for both.
 */
function substituteTokens(text: string, map: SubstitutionMap): string {
  return text.replace(TOKEN_RE, (match, reference: string) => {
    const substitution = map.get(head(reference));
    if (!substitution) return match;
    if (substitution.kind === 'literal') return String(substitution.value);
    if (substitution.kind === 'drop') return match;
    return `{${[substitution.name, ...reference.split('.').slice(1)].join('.')}}`;
  });
}

/**
 * The value a declared parameter contributes to the right of a comparison.
 *
 * The dialect's comparison is `IDENT op literal`, so this position holds a value and never a name. A
 * string is quoted, because a bare word there is tokenised as `[A-Za-z_][A-Za-z0-9_.]*` and an
 * hyphenated value like `full-prism` would otherwise split at the hyphen.
 */
function comparisonValue(
  substitution: Substitution,
  identifier: string,
  expression: string,
  context: string,
): string {
  if (substitution.kind !== 'literal') {
    throw new RoutineResolutionError(
      `${context}: '${identifier}' stands to the right of a comparison in '${expression}', where the dialect takes a value — `
      + 'bind it to a literal, because a comparison reads its right side as the characters it spells rather than as a name to look up.',
    );
  }
  if (typeof substitution.value !== 'string') return String(substitution.value);
  if (substitution.value.includes("'")) {
    throw new RoutineResolutionError(
      `${context}: '${identifier}' stands to the right of a comparison in '${expression}' and its argument '${substitution.value}' carries a quote, `
      + 'which the dialect has no escape for.',
    );
  }
  return `'${substitution.value}'`;
}

/**
 * The verdict a comparison carries once its left operand is a literal.
 *
 * The dialect compares a bag path against a value, so a literal standing left of the operator has no
 * position to be substituted into. Both operands are known here, which makes the comparison decidable
 * where it stands: it folds to `true` or `false`, which the dialect takes as a primary and composes
 * under `!`, `&&`, `||` and parens like any other.
 *
 * The verdict is the dialect's own — the operands are handed to the evaluator against a bag holding
 * the left one, so quoting, bare-word coercion and the numeric ordering rules are read from the
 * grammar rather than restated here.
 *
 * The operator and the operand are both matched against the shapes the dialect admits, so the probe
 * is well formed by construction and a parse failure is a defect report rather than an authoring
 * error. It is checked because the evaluator answers `false` for an expression it cannot read, which
 * is indistinguishable from a comparison that is genuinely false.
 */
function foldComparison(
  left: string | number | boolean,
  operator: string,
  right: string,
  expression: string,
  context: string,
): string {
  const probe = `${FOLD_OPERAND} ${operator} ${right}`;
  const parsed = parseWhen(probe);
  if (!parsed.ok) {
    throw new RoutineResolutionError(
      `${context}: folding '${expression}' composed the probe '${probe}', which the dialect cannot read — `
      + `${parsed.error}. The operand shapes and the fold disagree, which is a defect in this resolver.`,
    );
  }
  return String(evaluateWhenExpression(probe, { [FOLD_OPERAND]: left }));
}

/**
 * The comparison a literal-bound parameter heads, where it heads one.
 *
 * Reads the operator and the operand behind an identifier the walk is standing on, and answers with
 * both sides resolved. Three shapes decline, each because the identifier is a bag path there and a
 * value would be wrong:
 *
 *   - a parameter bound to a NAME, whose comparison the host's bag settles at run time;
 *   - a DOTTED path, which addresses a field of a value the site did not supply;
 *   - a parameter standing alone, which the dialect reads as truthiness against the bag — the shape a
 *     `validate` action's target takes.
 */
function foldableComparison(
  expression: string,
  index: number,
  identifier: string,
  map: SubstitutionMap,
  context: string,
): { left: string | number | boolean; operator: string; right: string; end: number } | undefined {
  if (identifier.includes('.')) return undefined;
  const substitution = map.get(identifier);
  if (substitution?.kind !== 'literal') return undefined;
  const rest = expression.slice(index + identifier.length);
  const operator = COMPARISON_HEAD_RE.exec(rest);
  if (!operator) return undefined;
  const operand = VALUE_HEAD_RE.exec(rest.slice(operator[0].length))?.[0];
  if (operand === undefined) {
    throw new RoutineResolutionError(
      `${context}: '${identifier}' heads a comparison in '${expression}' and the site bound it to a literal, `
      + 'so the comparison is settled here — but what stands right of the operator is not a value the dialect reads.',
    );
  }
  const bound = map.get(operand);
  return {
    left: substitution.value,
    operator: operator[1]!,
    right: bound ? comparisonValue(bound, operand, expression, context) : operand,
    end: index + identifier.length + operator[0].length + operand.length,
  };
}

/**
 * Rewrite the names a `when` expression carries, in one pass.
 *
 * An expression names its variables bare, so the rewrite has to tell a bag path from the three things
 * that look exactly like one:
 *
 *   - A right-hand operand. `analysis_type == completion` compares against the characters
 *     `completion`, so an identifier directly following a comparison operator is a value and stays as
 *     written — UNLESS the routine declares that exact name, in which case it is the parameter
 *     standing in the value's place and the site's literal replaces it. A routine declares every name
 *     in its own scope, which is what makes the two distinguishable at all.
 *   - A left-hand operand the site bound to a literal. The dialect's comparison reads its left side as
 *     a bag path, so a value has no position there and the comparison is settled here instead, by
 *     `foldableComparison` and `foldComparison`. A parameter bound to a name keeps the bag path, and
 *     so does one standing alone, which the dialect reads as truthiness.
 *   - The contents of a quoted string. `chosen_mode == "current_assumption"` compares against the
 *     characters `current_assumption`, and renaming them would change what the gate tests — silently,
 *     because the result is still a well-formed expression.
 */
function substituteExpression(expression: string, map: SubstitutionMap, context: string): string {
  let out = '';
  let index = 0;
  let quote: string | null = null;
  while (index < expression.length) {
    const character = expression[index]!;
    if (quote !== null) {
      out += character;
      if (character === quote) quote = null;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      out += character;
      index += 1;
      continue;
    }
    const identifier = LEADING_IDENTIFIER_RE.exec(expression.slice(index))?.[0];
    if (identifier === undefined) {
      out += character;
      index += 1;
      continue;
    }
    if (COMPARISON_TAIL_RE.test(out)) {
      const substitution = map.get(identifier);
      out += substitution ? comparisonValue(substitution, identifier, expression, context) : identifier;
      index += identifier.length;
      continue;
    }
    const fold = foldableComparison(expression, index, identifier, map, context);
    if (fold) {
      out += foldComparison(fold.left, fold.operator, fold.right, expression, context);
      index = fold.end;
      continue;
    }
    out += renameHead(identifier, map) ?? identifier;
    index += identifier.length;
  }
  return out;
}

/** Rewrite a structured condition's variable references, at any nesting depth. */
function substituteCondition(condition: Condition, map: SubstitutionMap): Condition {
  if (condition.type === 'simple') {
    const variable = renameHead(condition.variable, map);
    return { ...condition, variable: variable ?? condition.variable };
  }
  if (condition.type === 'not') {
    return { ...condition, condition: substituteCondition(condition.condition, map) };
  }
  return { ...condition, conditions: condition.conditions.map((nested) => substituteCondition(nested, map)) };
}

/**
 * Rewrite a binding value — a technique step input, a `with` argument, an action value.
 *
 * A value that is exactly one token is the whole binding, so a literal argument contributes its
 * characters unbraced; a longer string keeps its shape and only its tokens move. A value whose whole
 * binding resolves to a dropped output removes the binding, which is what `undefined` reports.
 */
function substituteBindingValue(
  value: string | number | boolean,
  map: SubstitutionMap,
): string | number | boolean | undefined {
  if (typeof value !== 'string') return value;
  const whole = /^\{([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)*)\}$/.exec(value);
  if (whole) {
    const substitution = map.get(head(whole[1]!));
    if (!substitution) return value;
    if (substitution.kind === 'drop') return undefined;
    if (substitution.kind === 'literal') return substitution.value;
    return `{${[substitution.name, ...whole[1]!.split('.').slice(1)].join('.')}}`;
  }
  // A bare value naming a declared name is a rename of that name; anything else is a literal.
  const bare = map.get(value);
  if (bare && !value.includes('{')) {
    if (bare.kind === 'drop') return undefined;
    return substitutedName(bare)!;
  }
  return substituteTokens(value, map);
}

/**
 * Put the site's technique in the technique position where the step binds a parameter.
 *
 * A parameter stands in the position a technique reference occupies, and a routine declares every
 * name in its own scope, so a reference equal to a declared parameter is that parameter and nothing
 * else. Substitution happens here, before the contract derives, so the derivation reads a concrete
 * technique and never a placeholder.
 */
function substituteOperation(step: Step & { kind: 'technique' }, techniques: OperationMap): void {
  const reference = typeof step.technique === 'string' ? step.technique : step.technique.name;
  const supplied = techniques.get(reference);
  if (supplied === undefined) return;
  if (typeof step.technique === 'string') (step as { technique: string }).technique = supplied;
  else (step.technique as TechniqueBinding).name = supplied;
}

/** Rewrite every field of one step that can name a value in the routine's scope. */
function substituteStep(step: Step, siteBinding: SiteBinding, context: string): Step {
  const { names: map, techniques } = siteBinding;
  const out = step as Record<string, unknown>;

  if (typeof out['when'] === 'string') out['when'] = substituteExpression(out['when'], map, context);
  if (out['condition']) out['condition'] = substituteCondition(out['condition'] as Condition, map);

  if (step.kind === 'loop') {
    if (step.continueWhile) out['continueWhile'] = substituteCondition(step.continueWhile, map);
    if (step.breakCondition) out['breakCondition'] = substituteCondition(step.breakCondition, map);
    if (step.over) {
      const over = renameHead(step.over, map);
      if (over === undefined) throw new RoutineResolutionError(`${context}: loop '${step.id}' iterates a dropped output.`);
      out['over'] = over;
    }
    if (step.variable) {
      const variable = renameHead(step.variable, map);
      if (variable === undefined) throw new RoutineResolutionError(`${context}: loop '${step.id}' binds its item to a dropped output.`);
      out['variable'] = variable;
    }
    out['steps'] = (step.steps as Step[]).map((nested) => substituteStep(nested, siteBinding, context));
  }

  if (step.kind === 'technique') {
    substituteOperation(step, techniques);
    if (typeof step.technique === 'object') {
      const binding = step.technique as TechniqueBinding;
      if (binding.inputs) binding.inputs = substituteValueMap(binding.inputs, map) as Record<string, string | number | boolean>;
      // An output remap's KEY is the technique's own output id and its VALUE is the variable the
      // value lands under, so only the value moves.
      if (binding.outputs) binding.outputs = substituteTargetMap(binding.outputs, map);
    }
  }

  if (step.kind === 'checkpoint') {
    out['id'] = substituteTokens(step.id, map);
    if (step.message) out['message'] = substituteTokens(step.message, map);
    for (const option of step.options ?? []) {
      const effect = option.effect;
      if (!effect?.setVariable) continue;
      const rewritten: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(effect.setVariable)) {
        const target = renameHead(name, map);
        if (target === undefined) continue; // a dropped output writes nothing
        rewritten[target] = typeof value === 'string' ? substituteTokens(value, map) : value;
      }
      effect.setVariable = rewritten;
    }
  }

  if (step.kind === 'technique' || step.kind === 'action') {
    for (const action of step.actions ?? []) {
      if (action.condition) action.condition = substituteCondition(action.condition, map);
      if (action.action === 'validate' && action.target) action.target = substituteExpression(action.target, map, context);
      else if (action.target) {
        const target = renameHead(action.target, map);
        if (target === undefined) throw new RoutineResolutionError(`${context}: action on step '${step.id}' targets a dropped output.`);
        action.target = target;
      }
      if (action.message) action.message = substituteTokens(action.message, map);
      if (typeof action.value === 'string') action.value = substituteTokens(action.value, map);
    }
  }

  // A nested reference's own maps: left unsubstituted, the inner routine's declarations would be
  // collected under names local to the outer one and leak into the host activity.
  if (step.kind === 'routine') {
    if (step.with) out['with'] = substituteValueMap(step.with, map) as Record<string, string | number | boolean>;
    if (step.outputs) out['outputs'] = substituteTargetMap(step.outputs, map);
  }

  return step;
}

/** Rewrite the values of a binding map, dropping an entry whose value resolves to a dropped output. */
function substituteValueMap(
  values: Record<string, string | number | boolean>,
  map: SubstitutionMap,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(values)) {
    const substituted = substituteBindingValue(value, map);
    if (substituted !== undefined) out[key] = substituted;
  }
  return out;
}

/** Rewrite the target names of an output map, dropping an entry naming a dropped output. */
function substituteTargetMap(targets: Record<string, string>, map: SubstitutionMap): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, target] of Object.entries(targets)) {
    const renamed = renameHead(target, map);
    if (renamed !== undefined) out[key] = renamed;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Materialisation
// ---------------------------------------------------------------------------

/**
 * An internal's materialised name: the host activity and the whole composed reference path.
 *
 * A step identifier only has to be unique within its scope, but a variable name shares one flat
 * namespace across the whole workflow — so the path has to name the reference SITE, not just the
 * reference. Taking the innermost id alone puts one internal name on two sites whenever two paths
 * reach one routine and spell their innermost reference the same way: two loops in one activity may
 * each hold a step called `run`, which is legal, their ids being scoped per loop body.
 */
function internalName(activityId: string, sitePath: string, internalId: string): string {
  const flatten = (part: string): string => part.replace(/[-.]/g, '_');
  return `${flatten(activityId)}_${flatten(sitePath)}_${internalId}`;
}

/**
 * Extend a site path by one container or reference id.
 *
 * A step inside a materialised routine body already carries its own reference's prefix in its id, so
 * a segment that already spells the whole path is taken as the path rather than appended to it —
 * which is what keeps the ordinary nested case from naming its reference twice.
 *
 * The collapse is a prefix test, so it misses the case where a host container sits above the routine
 * that prefixed the id: `first-pass` + `run` + `run.cycle` keeps both spellings of `run`. The
 * property this exists to provide is UNIQUENESS per reference site, which that result has; brevity
 * is not one, and nothing in the server or the schemas bounds an identifier's length.
 */
function extendSitePath(path: string, id: string): string {
  if (path === '') return id;
  return id.startsWith(`${path}.`) ? id : `${path}.${id}`;
}

/**
 * A step's resolved id. Only a technique step may omit one in a definition file, and `populateStepIds`
 * fills it when the file is read — so an id missing here is a step that reached materialisation
 * without passing through that, which is a defect rather than an authoring error.
 */
function stepId(step: Step, context: string): string {
  if (step.id) return step.id;
  throw new RoutineResolutionError(`${context}: a kind:${step.kind} step reached materialisation with no resolved id.`);
}

/** Prefix every identifier in a run of steps, recursing into loop bodies. */
function prefixStepIds(steps: Step[], prefix: string, context: string): void {
  for (const step of steps) {
    step.id = `${prefix}${PREFIX_SEPARATOR}${stepId(step, context)}`;
    if (step.kind === 'loop') prefixStepIds(step.steps as Step[], step.id, context);
  }
}

/**
 * The substitution one reference site puts over one routine's body, and the refusals that reading
 * the site against the signature produces.
 */
function bindReference(
  step: RoutineStep,
  routine: Routine,
  activityId: string,
  referencePath: string,
  context: string,
): SiteBinding {
  const scope = routineScope(routine);
  const map = new Map<string, Substitution>();
  const techniques = new Map<string, string>();

  // Overbound: an argument naming no declared input. The declared list is the author's fix site.
  for (const argument of Object.keys(step.with ?? {})) {
    if (scope.inputs.has(argument)) continue;
    throw new RoutineResolutionError(
      `${context}: argument '${argument}' names no input of routine '${routine.id}' — it declares `
      + `${scope.inputs.size === 0 ? 'none' : [...scope.inputs.keys()].map((i) => `'${i}'`).join(', ')}.`,
    );
  }
  // Overbound: an output binding naming no declared output.
  for (const bound of Object.keys(step.outputs ?? {})) {
    if (scope.outputs.has(bound)) continue;
    throw new RoutineResolutionError(
      `${context}: output binding '${bound}' names no output of routine '${routine.id}' — it declares `
      + `${scope.outputs.size === 0 ? 'none' : [...scope.outputs.keys()].map((o) => `'${o}'`).join(', ')}.`,
    );
  }

  for (const [id, input] of scope.inputs) {
    const argument = step.with?.[id];
    if (isOperationInput(input)) {
      techniques.set(id, operationArgument(argument ?? input.default, id, routine.id, context));
      continue;
    }
    if (argument !== undefined) {
      const braced = typeof argument === 'string' && /^\{[^{}]+\}$/.test(argument);
      map.set(id, braced
        ? { kind: 'name', name: head((argument as string).slice(1, -1)) }
        : { kind: 'literal', value: argument });
      continue;
    }
    if (input.default !== undefined) { map.set(id, { kind: 'literal', value: input.default }); continue; }
    // Unbound and undefaulted: no entry, so the name substitutes to itself and takes the host's
    // value under the same spelling.
  }

  for (const [id, output] of scope.outputs) {
    const bound = step.outputs?.[id];
    if (bound !== undefined) { map.set(id, { kind: 'name', name: bound }); continue; }
    if (output.optional) { map.set(id, { kind: 'drop' }); continue; }
    throw new RoutineResolutionError(
      `${context}: output '${id}' of routine '${routine.id}' is left unbound — bind it under `
      + `'outputs', or declare 'optional: true' on the output to say a site may leave it out.`,
    );
  }

  for (const id of scope.internals.keys()) {
    map.set(id, { kind: 'name', name: internalName(activityId, referencePath, id) });
  }

  return { names: map, techniques };
}

/**
 * The technique reference a site supplies for one parameter.
 *
 * A technique parameter takes neither the host's fall-through nor a runtime value. A host bag holds
 * values and never techniques, so an unbound parameter has nothing to fall through to; and
 * substitution runs when the definitions load, so a braced argument names something with no value
 * yet and would leave the technique position spelling a token.
 */
function operationArgument(
  argument: string | number | boolean | undefined,
  id: string,
  routineId: string,
  context: string,
): string {
  if (argument === undefined) {
    throw new RoutineResolutionError(
      `${context}: input '${id}' of routine '${routineId}' declares 'kind: technique' and this site binds no argument — `
      + 'bind it to a technique reference under \'with\', or give the declaration a default. A technique parameter takes '
      + 'no value from the host, a bag holding values rather tha techniques.',
    );
  }
  if (typeof argument !== 'string' || argument.includes('{')) {
    throw new RoutineResolutionError(
      `${context}: input '${id}' of routine '${routineId}' declares 'kind: technique' and this site binds '${String(argument)}' — `
      + 'a technique parameter takes a literal reference, because substitution happens when the definitions load and a token has no value then.',
    );
  }
  return argument;
}

/**
 * Expand one reference into the steps it stands for.
 *
 * `chain` carries the routine ids on the path to this reference, so a cycle fails naming the chain
 * rather than exhausting the stack. Depth is bounded by cycle detection rather than by a limit.
 */
function expandReference(
  step: RoutineStep,
  scope: ExpansionScope,
  chain: string[],
  sitePath: string,
): Step[] {
  const { lookup, sourceWorkflowId, activityId, context } = scope;
  const routine = resolveRoutine(lookup, sourceWorkflowId, step.routine, context);
  if (chain.includes(routine.id)) {
    throw new RoutineResolutionError(
      `${context}: routine reference cycle ${[...chain, routine.id].join(' -> ')} — nesting is allowed, recursion is not.`,
    );
  }

  // The site this reference occupies, containers included — what an internal is named from. The
  // step-id prefix stays the reference's own id, so a materialised id is scoped the way a
  // hand-written one in the same body is.
  const site = extendSitePath(sitePath, step.id);
  const binding = bindReference(step, routine, activityId, site, context);
  const body = structuredClone(routine.steps) as Step[];
  const substituted = body.map((bodyStep) => substituteStep(bodyStep, binding, context));
  prefixStepIds(substituted, step.id, context);

  const expanded = expandStepList(substituted, scope, [...chain, routine.id], site);

  // The reference site's own gates apply to every step it stands for: the site decided whether the
  // run happens at all, and the run is no longer a single step that could carry that decision.
  //
  // A body step with a gate of its own takes BOTH, conjoined — the site gate says whether the run
  // happens and the body gate says whether that step happens within it, and a step that took only
  // its own would run in a host that never asked for the run. Each side is parenthesised because the
  // dialect requires it wherever `&&` and `||` meet at one nesting depth, and either side may be a
  // disjunction.
  for (const produced of expanded) {
    if (step.when !== undefined) {
      produced.when = produced.when === undefined ? step.when : `(${step.when}) && (${produced.when})`;
    }
    if (step.required === false) produced.required = false;
  }
  return expanded;
}

/**
 * Expand one reference into the steps it stands for, for a caller holding a single step rather than
 * an activity — the raw-text delivery path, which splices block by block.
 */
export function materializeRoutineStep(
  step: RoutineStep,
  lookup: RoutineLookup,
  sourceWorkflowId: string,
  activityId: string,
  /** The containers the reference sits inside, which an internal's name carries. */
  sitePath = '',
): Step[] {
  return expandReference(
    step,
    { lookup, sourceWorkflowId, activityId, context: `Activity '${activityId}'` },
    [],
    sitePath,
  );
}

/** What every expansion in one activity shares: where names resolve, and what a failure is called. */
interface ExpansionScope {
  lookup: RoutineLookup;
  /** The workflow the activity file was authored in — what a bare reference resolves against. */
  sourceWorkflowId: string;
  /** The host activity, which an internal's materialised name carries. */
  activityId: string;
  /** The prefix every refusal message opens with. */
  context: string;
}

/** Expand every reference in a step list, recursing into loop bodies. */
function expandStepList(
  steps: Step[],
  scope: ExpansionScope,
  chain: string[],
  sitePath: string,
): Step[] {
  const out: Step[] = [];
  for (const step of steps) {
    if (step.kind === 'routine') {
      out.push(...expandReference(step, scope, chain, sitePath));
      continue;
    }
    if (step.kind === 'loop') {
      // A loop is a container the site path runs through: two loops in one activity may each hold a
      // reference spelled the same way, their step ids being scoped per body.
      step.steps = expandStepList(step.steps as Step[], scope, chain, extendSitePath(sitePath, step.id));
    }
    out.push(step);
  }
  return out;
}

/**
 * Materialise every routine reference in an activity (top-level and loop bodies), scoped to the
 * workflow the activity file belongs to — a borrowed cross-workflow activity resolves its bare
 * references against its SOURCE workflow, not the borrower.
 */
export function materializeActivityRoutines(
  activity: Activity,
  lookup: RoutineLookup,
  sourceWorkflowId: string,
): void {
  if (!activity.steps) return;
  activity.steps = expandStepList(
    activity.steps,
    { lookup, sourceWorkflowId, activityId: activity.id, context: `Activity '${activity.id}'` },
    [],
    '',
  );
  assertUniqueStepIds(activity);
}

/**
 * Re-check identifier uniqueness in the merged scope.
 *
 * Prefixing makes the merged scope safe by construction, which is exactly why this has to be
 * checked rather than assumed: the two containers that would otherwise notice a clash both collapse
 * it silently — the step-manifest's id set is a `Set` and the declaration index is a `Map` keyed by
 * id — so a collision loses an order constraint as well as a manifest entry, with no error anywhere.
 */
function assertUniqueStepIds(activity: Activity): void {
  const check = (steps: Step[] | undefined, scopeLabel: string): void => {
    const seen = new Set<string>();
    for (const step of steps ?? []) {
      // Every id is populated by now: `populateStepIds` runs over an activity when its file loads
      // and over a routine when its file is read, so a spliced step arrives carrying one.
      const id = stepId(step, `${scopeLabel} of activity '${activity.id}'`);
      if (seen.has(id)) {
        throw new RoutineResolutionError(
          `Activity '${activity.id}': ${scopeLabel} has duplicate step id '${id}' after materialising a routine `
          + '— give the colliding reference step a different id.',
        );
      }
      seen.add(id);
      if (step.kind === 'loop') check(step.steps as Step[], `loop '${id}' steps`);
    }
  };
  check(activity.steps, 'top-level steps');
}

// ---------------------------------------------------------------------------
// The raw-text delivery path
// ---------------------------------------------------------------------------

/**
 * Materialise routine references in RAW activity YAML, for the delivery path that hands the worker
 * the original file text (`get_activity`).
 *
 * Each `kind: routine` step block is replaced, at its own indentation, by the steps it stands for,
 * serialised to YAML. The surrounding lines stay byte-identical, so an activity carrying no routine
 * is returned unchanged.
 *
 * Every spliced step carries an explicit prefixed `id:`, because the object graph and this text are
 * two implementations of one substitution and a worker acting on a step the server does not believe
 * exists is what a disagreement between them looks like. The ids are explicit by construction: the
 * steps serialised here are the materialised objects, whose ids were resolved and prefixed before
 * they got here, so `injectResolvedStepIds` has nothing left to derive inside a materialised body.
 *
 * The same reason is why the splice tracks the loop blocks it is inside: an internal is named from
 * the SITE a reference occupies, containers included, so a splicer blind to them would name one
 * thing two ways between the two representations.
 */
export function injectRoutineSteps(
  rawDefinition: string,
  materialise: (step: RoutineStep, sitePath: string) => Step[],
): string {
  const lines = rawDefinition.split('\n');
  const out: string[] = [];
  /** The loop blocks currently open, innermost last — the container path of whatever comes next. */
  const containers: Array<{ indent: number; id: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const opener = /^(\s*)- /.exec(lines[i]!);
    if (!opener) { out.push(lines[i]!); continue; }

    const indent = opener[1]!;
    // A list item at or left of an open container closes it: its body has ended.
    while (containers.length > 0 && containers[containers.length - 1]!.indent >= indent.length) containers.pop();
    const end = blockEnd(lines, i, indent.length);
    // Blank lines trailing the block belong to the file's own shape, not to the step: a block that
    // swallowed them would drop the file's final newline when the last step is a reference.
    let last = end - 1;
    while (last > i && lines[last]!.trim() === '') last -= 1;
    const block = parseStepBlock(lines.slice(i, last + 1), indent.length);
    const kind = (block as { kind?: unknown } | null)?.kind;
    if (kind === 'loop') {
      const id = (block as { id?: unknown }).id;
      if (typeof id === 'string') containers.push({ indent: indent.length, id });
    }
    if (block === null || kind !== 'routine') {
      out.push(lines[i]!);
      continue;
    }
    const reference = RoutineStepSchema.safeParse(block);
    if (!reference.success) {
      throw new RoutineResolutionError(
        `Routine reference step '${String((block as { id?: unknown }).id ?? '(no id)')}' is not a valid reference: `
        + reference.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
      );
    }

    for (const step of materialise(reference.data, containers.map((c) => c.id).join('.'))) {
      for (const line of stringifyForResponse([step]).trimEnd().split('\n')) out.push(indent + line);
    }
    for (let blank = last + 1; blank < end; blank++) out.push(lines[blank]!);
    i = end - 1;
  }
  return out.join('\n');
}

/** The line after the last one belonging to the list item opening at `start`. */
function blockEnd(lines: string[], start: number, indent: number): number {
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim() === '') continue;
    const at = line.length - line.trimStart().length;
    if (at <= indent) return i;
  }
  return lines.length;
}

/** Parse one list item's lines as an object, or null where they are not one. */
function parseStepBlock(blockLines: string[], indent: number): unknown {
  const body = blockLines
    .map((line, index) => (index === 0 ? ' '.repeat(indent + 2) + line.slice(indent + 2) : line))
    .map((line) => (line.trim() === '' ? line : line.slice(indent + 2)))
    .join('\n');
  try {
    const parsed = parseDefinition(body);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Cheap textual pre-scan for a routine reference in raw activity YAML — the delivery path's fast
 * gate, keeping routine-free activities (every corpus activity today) off the splice path entirely
 * and their delivery byte-identical.
 */
export function hasRoutineStepLine(rawDefinition: string): boolean {
  return /^\s*(?:- )?kind:[ \t]*["']?routine\b/m.test(rawDefinition);
}

/**
 * The routine names raw activity YAML references, for pre-loading the lookup the splice needs. May
 * over-match a `routine:` key outside a reference step; an extra workflow read is the whole cost,
 * and the splice's own parse is what decides which blocks are references.
 */
export function collectRoutineRefLines(rawDefinition: string): string[] {
  const refs: string[] = [];
  // A trailing `#` comment is admitted, because a line the scan misses is a workflow left unread
  // and a reference that then fails to resolve at the splice.
  const re = /^\s*routine:[ \t]*(["']?)([^"'#\n]+?)\1[ \t]*(?:#.*)?$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rawDefinition))) refs.push(match[2]!.trim());
  return refs;
}

/** Every routine reference step an activity's steps carry, at any depth. */
export function collectRoutineSteps(activity: { steps?: Step[] | undefined }): RoutineStep[] {
  const sites: RoutineStep[] = [];
  const walk = (steps: Step[] | undefined): void => {
    for (const step of steps ?? []) {
      if (step.kind === 'routine') sites.push(step);
      else if (step.kind === 'loop') walk(step.steps as Step[]);
    }
  };
  walk(activity.steps);
  return sites;
}

/** Every routine reference an activity's steps make, for lookup pre-loading. */
export function collectRoutineRefs(activity: { steps?: Step[] | undefined }): string[] {
  return collectRoutineSteps(activity).map((step) => step.routine);
}

/**
 * A routine's body with one site's technique arguments standing in its technique positions.
 *
 * What a caller derives a contract from, for a routine whose body binds a technique by argument:
 * such a body has no signature of its own, so the derivation runs against a site rather than against
 * the declaration.
 */
export function bodyWithOperations(steps: readonly Step[], techniques: OperationMap): Step[] {
  const body = structuredClone(steps) as Step[];
  const visit = (list: Step[]): void => {
    for (const step of list) {
      if (step.kind === 'technique') substituteOperation(step, techniques);
      else if (step.kind === 'loop') visit(step.steps as Step[]);
    }
  };
  visit(body);
  return body;
}

/** Every routine reference a routine's own body makes, for transitive lookup pre-loading. */
export function collectNestedRoutineRefs(routine: Routine): string[] {
  return collectRoutineRefs({ steps: routine.steps as Step[] });
}
