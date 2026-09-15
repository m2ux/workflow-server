/**
 * Routine resolution and materialisation (#704 W02).
 *
 * A `kind: routine` step names a routine, binds its inputs under `with` and its outputs under
 * `outputs`. This module resolves the name, substitutes the reference site's arguments through the
 * routine's body, prefixes every identifier inside it, and splices the result in place of the
 * reference — so everything downstream of the loaders sees ordinary steps and none of them learns
 * the construct.
 *
 * Reference addressing carries NO group grammar:
 *   - `workflow::name` — resolved ONLY in that workflow's routines (no fallback).
 *   - `name` — the declaring workflow's routines first, then meta's.
 *   - a second separator fails, because a routine lives one file deep in a flat `routines/`
 *     directory and has no group level to name.
 *
 * Every terminal state of a reference but `Checked` fails: a malformed name, a name nothing
 * declares, a cycle, an input with no argument and no default and no host fall-through, an argument
 * naming no declared input, and an output left unbound whose declaration does not permit it. None is
 * a warning — a routine that half-resolves would hand a worker a step nobody declared.
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
import { type Routine, routineScope } from '../schema/routine.schema.js';
import { parseDefinition, stringifyForResponse } from '../utils/serialization.js';
import { META_WORKFLOW_ID } from './fragment-resolver.js';

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
 * Split `[workflow::]name`. A routine name carries one separator at most: a routine lives one file
 * deep in a flat `routines/` directory, so there is no group level for a second segment to address.
 */
export function parseRoutineRef(ref: string, context: string): { workflowId?: string; name: string } {
  const segments = ref.split(SEPARATOR);
  if (segments.length === 1 && segments[0]) return { name: segments[0] };
  if (segments.length === 2 && segments[0] && segments[1]) {
    return { workflowId: segments[0], name: segments[1] };
  }
  throw new RoutineResolutionError(
    `${context}: routine reference '${ref}' carries ${segments.length - 1} separators — a routine name is `
    + `'name' or 'workflow::name' and carries no group grammar, because a routine lives one file deep in a flat routines/ directory.`,
  );
}

/** The workflows a reference may resolve in, in order. */
function candidateWorkflows(ref: string, currentWorkflowId: string, context: string): { workflowIds: string[]; name: string } {
  const { workflowId, name } = parseRoutineRef(ref, context);
  if (workflowId) return { workflowIds: [workflowId], name };
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
 * Rewrite the bag paths a `when` expression reads, in one pass.
 *
 * An expression names its variables bare, so the rewrite has to tell a bag path from the two things
 * that look exactly like one:
 *
 *   - A right-hand operand. `analysis_type == completion` reads `analysis_type` alone, so an
 *     identifier directly following a comparison operator is a value and is left as written.
 *   - The contents of a quoted string. `chosen_mode == "current_assumption"` compares against the
 *     characters `current_assumption`, and renaming them would change what the gate tests — silently,
 *     because the result is still a well-formed expression.
 */
function substituteExpression(expression: string, map: SubstitutionMap): string {
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
    out += COMPARISON_TAIL_RE.test(out) ? identifier : renameHead(identifier, map) ?? identifier;
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

/** Rewrite every field of one step that can name a value in the routine's scope. */
function substituteStep(step: Step, map: SubstitutionMap, context: string): Step {
  const out = step as Record<string, unknown>;

  if (typeof out['when'] === 'string') out['when'] = substituteExpression(out['when'], map);
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
    out['steps'] = (step.steps as Step[]).map((nested) => substituteStep(nested, map, context));
  }

  if (step.kind === 'technique') {
    if (typeof step.technique === 'object') {
      const binding = step.technique as TechniqueBinding;
      if (binding.inputs) binding.inputs = substituteValueMap(binding.inputs, map) as Record<string, string | number | boolean>;
      // An output remap's KEY is the operation's own output id and its VALUE is the variable the
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
      if (action.action === 'validate' && action.target) action.target = substituteExpression(action.target, map);
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

/** An internal's materialised name: the host activity and the whole composed reference path. */
function internalName(activityId: string, referencePath: string, internalId: string): string {
  const flatten = (part: string): string => part.replace(/[-.]/g, '_');
  return `${flatten(activityId)}_${flatten(referencePath)}_${internalId}`;
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
): SubstitutionMap {
  const scope = routineScope(routine);
  const map = new Map<string, Substitution>();

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

  return map;
}

/**
 * Expand one reference into the steps it stands for.
 *
 * `chain` carries the routine ids on the path to this reference, so a cycle fails naming the chain
 * rather than exhausting the stack. Depth is bounded by cycle detection rather than by a limit.
 */
function expandReference(
  step: RoutineStep,
  lookup: RoutineLookup,
  sourceWorkflowId: string,
  activityId: string,
  chain: string[],
  context: string,
): Step[] {
  const routine = resolveRoutine(lookup, sourceWorkflowId, step.routine, context);
  if (chain.includes(routine.id)) {
    throw new RoutineResolutionError(
      `${context}: routine reference cycle ${[...chain, routine.id].join(' -> ')} — nesting is allowed, recursion is not.`,
    );
  }

  const map = bindReference(step, routine, activityId, step.id, context);
  const body = structuredClone(routine.steps) as Step[];
  const substituted = body.map((bodyStep) => substituteStep(bodyStep, map, context));
  prefixStepIds(substituted, step.id, context);

  const expanded = expandStepList(substituted, lookup, sourceWorkflowId, activityId, [...chain, routine.id], context);

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
): Step[] {
  return expandReference(step, lookup, sourceWorkflowId, activityId, [], `Activity '${activityId}'`);
}

/** Expand every reference in a step list, recursing into loop bodies. */
function expandStepList(
  steps: Step[],
  lookup: RoutineLookup,
  sourceWorkflowId: string,
  activityId: string,
  chain: string[],
  context: string,
): Step[] {
  const out: Step[] = [];
  for (const step of steps) {
    if (step.kind === 'routine') {
      out.push(...expandReference(step, lookup, sourceWorkflowId, activityId, chain, context));
      continue;
    }
    if (step.kind === 'loop') {
      step.steps = expandStepList(step.steps as Step[], lookup, sourceWorkflowId, activityId, chain, context);
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
    lookup,
    sourceWorkflowId,
    activity.id,
    [],
    `Activity '${activity.id}'`,
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
 */
export function injectRoutineSteps(
  rawDefinition: string,
  materialise: (step: RoutineStep) => Step[],
): string {
  const lines = rawDefinition.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const opener = /^(\s*)- /.exec(lines[i]!);
    if (!opener) { out.push(lines[i]!); continue; }

    const indent = opener[1]!;
    const end = blockEnd(lines, i, indent.length);
    // Blank lines trailing the block belong to the file's own shape, not to the step: a block that
    // swallowed them would drop the file's final newline when the last step is a reference.
    let last = end - 1;
    while (last > i && lines[last]!.trim() === '') last -= 1;
    const block = parseStepBlock(lines.slice(i, last + 1), indent.length);
    if (block === null || (block as { kind?: unknown }).kind !== 'routine') {
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

    for (const step of materialise(reference.data)) {
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

/** Every routine reference an activity's steps make, for lookup pre-loading. */
export function collectRoutineRefs(activity: { steps?: Step[] | undefined }): string[] {
  const refs: string[] = [];
  const walk = (steps: Step[] | undefined): void => {
    for (const step of steps ?? []) {
      if (step.kind === 'routine') refs.push(step.routine);
      else if (step.kind === 'loop') walk(step.steps as Step[]);
    }
  };
  walk(activity.steps);
  return refs;
}

/** Every routine reference a routine's own body makes, for transitive lookup pre-loading. */
export function collectNestedRoutineRefs(routine: Routine): string[] {
  return collectRoutineRefs({ steps: routine.steps as Step[] });
}
