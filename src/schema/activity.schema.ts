import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';
import { SemanticVersionSchema } from './common.js';
import { enforcement } from './enforcement.js';
import { ActivityVariablesSchema } from './variable.schema.js';
import { WhenExpressionSchema } from './when-expression.js';

export const TechniquesReferenceSchema = enforcement(z.array(z.string().describe('Technique reference using a `::`-separated path.')).describe('Activity-wide technique references, using `::`-separated paths.'), { owner: 'Engine', strictness: 'enforced' });
export type TechniquesReference = z.infer<typeof TechniquesReferenceSchema>;

export const BundleTechniquesSchema = enforcement(z.object({
  maxChars: z.number().int().nonnegative().describe('Maximum characters per step technique included with the activity; zero excludes all step techniques.'),
}).strict().describe('Character limits for step techniques included with an activity.'), { owner: 'Engine', strictness: 'enforced' });
export type BundleTechniques = z.infer<typeof BundleTechniquesSchema>;

export const ActionSchema = z.object({
  action: z.enum(['log', 'validate', 'set', 'emit', 'message']).describe('Action for the executing agent to perform; a `set` value reaches the session when the agent reports it.'),
  target: z.string().optional().describe('Variable name or other target of the action.'),
  message: z.string().optional().describe('Message associated with the action.'),
  value: z.unknown().optional().describe('Value assigned or supplied by the action.'),
  description: z.string().optional().describe('Human-readable description of what this action does'),
  condition: ConditionSchema.optional().describe('Condition that must be true for this action to execute'),
}).describe('Action with an optional target, value, message, and condition.');
export type Action = z.infer<typeof ActionSchema>;

export const WorkflowTriggerSchema = z.object({
  workflow: z.string().describe('ID of the workflow to trigger'),
  description: z.string().optional().describe('When and why to trigger this workflow.'),
  passContext: enforcement(z.array(z.string().describe('Name of a context variable to pass to the child workflow.')).optional().describe('Context variable names to pass to the child workflow.'), { owner: 'Agent', strictness: 'advisory' }),
}).describe('Child workflow reference and context to pass to it.');
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;

export const CheckpointOptionSchema = z.object({
  id: z.string().describe('Option identifier within the checkpoint.'),
  label: z.string().describe('Short label for the choice.'),
  description: z.string().optional().describe('Explanation of the choice.'),
  effect: z.object({
    setVariable: enforcement(z.record(z.unknown().describe('Value assigned to the named variable.')).optional().describe('Variable assignments applied when this option is selected. Each value is checked against the variable\'s declared type and value set, and a mismatch is stored as written with a warning; a `{name}` template value passes through unchecked.'), { owner: 'Engine', strictness: 'enforced' }),
    exit: enforcement(z.string().optional().describe('Exit of the owning activity this option selects: a name from its `exits`, never an activity identifier. An option naming an exit its activity does not declare fails the load. Omitted for an ad hoc checkpoint, which has no declared exits.'), { owner: 'Engine', strictness: 'advisory' }),
  }).strict().optional().describe('Variable assignments and activity exit associated with the choice.'),
}).describe('Checkpoint choice and its associated effects.');
export type CheckpointOption = z.infer<typeof CheckpointOptionSchema>;

export const TechniqueBindingSchema = z.object({
  name: z.string().describe('Technique reference: `group::technique`, a bare technique name, or `workflow::group::technique`.'),
  inputs: enforcement(z.record(z.union([z.string().describe('Variable name, text literal, or template expression.'), z.number().describe('Numeric input value.'), z.boolean().describe('Boolean input value.')]).describe('Variable name, literal value, or template expression for an input.')).optional().describe('Input identifiers mapped to a source: the name of a session variable to read under that input, a literal, or a `{template}` expression. Declared only for inputs whose source differs from the same-name variable or the declared default.'), { owner: 'Agent', strictness: 'advisory' }),
  outputs: enforcement(z.record(z.string().describe('Workflow variable name for the output.')).optional().describe('Output identifiers mapped to the workflow variable each value is written to. Declared only where that name differs from the output identifier.'), { owner: 'Agent', strictness: 'advisory' }),
}).describe('Technique reference with input and output bindings.');
export type TechniqueBinding = z.infer<typeof TechniqueBindingSchema>;

const stepCommonFields = {
  when: enforcement(WhenExpressionSchema.optional().describe('Entry gate: the step runs only when this expression holds. On a checkpoint step, `condition`, not `when`, makes the checkpoint dismissible.'), { owner: 'Agent', strictness: 'advisory' }),
  required: enforcement(z.literal(false).optional().describe('Declare `false` for an optional step; omission means the step is required, and `true` is rejected.'), { owner: 'Agent', strictness: 'advisory' }),
};

const stepEntryCondition = {
  condition: enforcement(ConditionSchema.optional().describe('Structured entry condition. Prefer `when` for a step gate. On a checkpoint step, `condition` is the only gate that makes the checkpoint dismissible: when it is false, the checkpoint may be dismissed as not met, selecting no option and no exit.'), { owner: 'Agent', strictness: 'advisory' }),
};

export const TechniqueStepSchema = z.object({
  kind: enforcement(z.literal('technique').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().optional().describe('Step identifier, unique within its step list (the top-level steps, or one loop body); a duplicate fails the load. Defaults to the last `::` segment of the technique reference; the one step kind whose id may be omitted.'), { owner: 'Engine', strictness: 'enforced' }),
  technique: z.union([z.string().describe('Technique reference using a `::`-separated path.'), TechniqueBindingSchema]).describe('Technique reference, or an object with `name` and optional `inputs` and `outputs` bindings.'),
  actions: enforcement(z.array(ActionSchema).optional().describe('Actions associated with the technique step.'), { owner: 'Agent', strictness: 'advisory' }),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict().describe('Step that invokes a technique with optional actions and entry conditions.');
export type TechniqueStep = z.infer<typeof TechniqueStepSchema>;

export const ActionStepSchema = z.object({
  kind: enforcement(z.literal('action').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Step identifier, unique within its step list (the top-level steps, or one loop body); a duplicate fails the load.'), { owner: 'Engine', strictness: 'enforced' }),
  actions: enforcement(z.array(ActionSchema).optional().describe('Control actions; may be empty for marker steps.'), { owner: 'Agent', strictness: 'advisory' }),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict().describe('Control step with optional actions and entry conditions.');
export type ActionStep = z.infer<typeof ActionStepSchema>;

export const CheckpointStepSchema = z.object({
  kind: enforcement(z.literal('checkpoint').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Checkpoint identifier, unique within its step list (the top-level steps, or one loop body); a duplicate fails the load, and the key its recorded responses replay under on resume.'), { owner: 'Engine', strictness: 'enforced' }),
  message: z.string().describe('Message presented to the user.'),
  options: enforcement(z.array(CheckpointOptionSchema).min(1).describe('Decision options with effects.'), { owner: 'Engine', strictness: 'enforced' }),
  defaultOption: enforcement(z.string().optional().describe('Identifier of one of this checkpoint\'s options, taken when no person answers. Declared together with `autoAdvanceMs`: the pair makes the checkpoint soft, and a hard checkpoint declares neither.'), { owner: 'Engine', strictness: 'enforced' }),
  autoAdvanceMs: enforcement(z.number().int().positive().optional().describe('Positive waiting interval in milliseconds before `defaultOption` may be selected automatically; declared together with `defaultOption`.'), { owner: 'Engine', strictness: 'enforced' }),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict().describe('User decision at a defined position in the activity steps.');
export type CheckpointStep = z.infer<typeof CheckpointStepSchema>;

// Recursion is on the steps field: discriminatedUnion requires object members, so the union cannot be lazy.
export const LoopStepSchema = z.object({
  kind: enforcement(z.literal('loop').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Step identifier, unique within its step list (the top-level steps, or one loop body); a duplicate fails the load.'), { owner: 'Engine', strictness: 'enforced' }),
  name: z.string().optional().describe('Human-readable label for the iteration.'),
  loopType: enforcement(z.enum(['forEach', 'while', 'doWhile']).describe('Iteration over a collection (`forEach`), with a pre-test (`while`), or with a post-test (`doWhile`).'), { owner: 'Agent', strictness: 'advisory' }),
  continueWhile: enforcement(ConditionSchema.optional().describe('Continuation condition required for `while` and `doWhile` loops and absent for `forEach` loops.'), { owner: 'Agent', strictness: 'advisory' }),
  variable: enforcement(z.string().optional().describe('Current-item variable bound each iteration of a `forEach` loop; absent for `while` and `doWhile` loops.'), { owner: 'Agent', strictness: 'advisory' }),
  over: enforcement(z.string().optional().describe('Collection a `forEach` loop iterates: a variable name or a dotted path into one; absent for `while` and `doWhile` loops.'), { owner: 'Agent', strictness: 'advisory' }),
  breakCondition: enforcement(ConditionSchema.optional().describe('Condition that ends a `forEach` loop before the next item; absent for `while` and `doWhile` loops.'), { owner: 'Agent', strictness: 'advisory' }),
  maxIterations: enforcement(z.number().int().positive().optional().describe('Maximum number of iterations.'), { owner: 'Agent', strictness: 'advisory' }),
  steps: enforcement(z.array(z.lazy((): z.ZodTypeAny => StepSchema).describe('Step within the loop body.')).describe('The loop body, a nested ordered list of steps.'), { owner: 'Engine', strictness: 'enforced' }),
  ...stepCommonFields,
}).strict().describe('Loop over a collection or until a continuation test fails, entered when its `when` expression holds.');
export type LoopStep = z.infer<typeof LoopStepSchema>;

// A routine step's gate is `when` alone: a `condition` reaching the body would make every checkpoint in it dismissible.
export const RoutineStepSchema = z.object({
  kind: enforcement(z.literal('routine').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Step identifier, unique within its step list (the top-level steps, or one loop body); a duplicate fails the load, and the prefix every identifier in the routine body carries once spliced in.'), { owner: 'Engine', strictness: 'enforced' }),
  routine: z.string().describe('Routine reference in `[namespace::]name` form. The namespace is a directory name, or the path from the corpus root reaching it. A qualified name resolves in that namespace only; a bare name resolves against the referring activity\'s source workflow, then `meta`. The last segment is the routine and every segment before it is the namespace, since a routine name has no group grammar.'),
  with: z.record(z.union([z.string().describe('Text literal or braced host-variable reference.'), z.number().describe('Numeric routine argument.'), z.boolean().describe('Boolean routine argument.')]).describe('Literal argument or braced host-variable reference.')).optional().describe('Routine input identifiers mapped to arguments: a braced value (`{host_variable}`) references a host variable, and any other value is a literal. An input left unbound takes its declared default, then the host variable of the same name; a `kind: technique` input left unbound with no default fails the load, as does an argument naming no declared input.'),
  outputs: z.record(z.string().describe('Session variable name for the routine output.')).optional().describe('Routine output identifiers mapped to session variable names. An output left unbound produces no write; only an output declared `optional: true` may be left unbound, and any other unbound output fails the load, as does a binding naming no declared output.'),
  ...stepCommonFields,
}).strict().describe('Routine invocation with argument and output bindings, entered when its `when` expression holds.');
export type RoutineStep = z.infer<typeof RoutineStepSchema>;

export const StepSchema = z.discriminatedUnion('kind', [
  TechniqueStepSchema,
  ActionStepSchema,
  CheckpointStepSchema,
  LoopStepSchema,
  RoutineStepSchema,
]).describe('Step selected by `kind`; its guidance lives in the bound technique.');
export type Step = z.infer<typeof StepSchema>;

/** Every step kind the union admits, as one closed list. */
export const STEP_KINDS = ['technique', 'action', 'checkpoint', 'loop', 'routine'] as const;
export type StepKind = (typeof STEP_KINDS)[number];

/**
 * Exhaustiveness over the step kinds, checked when this module compiles.
 *
 * The corpus's step kinds are tested in dozens of places, every one a positive comparison, with no
 * exhaustive switch anywhere — so a kind added to the union compiles clean everywhere and is handled
 * nowhere. This assignment is the one place that fails instead: adding a member to `StepSchema`
 * without adding it to `STEP_KINDS` is a compile error, which is what sends the author looking for
 * the consumers.
 */
const _stepKindsAreExhaustive: StepKind extends Step['kind'] ? (Step['kind'] extends StepKind ? true : never) : never = true;
void _stepKindsAreExhaustive;

/**
 * The structured entry gate a step carries, or undefined for the kinds that carry none.
 *
 * Two kinds answer entry with `when` alone: a loop, because whether its body runs at all is a
 * different question from whether it runs again, and a routine reference, because a condition would
 * have to reach the run's steps to mean anything. Asking each caller to narrow the union itself put
 * the same `kind === 'loop' ? … : step.condition` in three places, each of which had to be found
 * again when a second such kind arrived.
 */
export function entryCondition(step: Step): z.infer<typeof ConditionSchema> | undefined {
  return step.kind === 'loop' || step.kind === 'routine' ? undefined : step.condition;
}

/** The technique reference of a step's technique binding, whether bare-string or structured. */
export function techniqueName(technique: TechniqueStep['technique'] | undefined): string | undefined {
  return typeof technique === 'string' ? technique : technique?.name;
}

/** Derive the default step id from a technique ref: the last `::` segment of its name. */
export function defaultStepId(technique: string): string {
  const segments = technique.split('::');
  return segments[segments.length - 1] ?? technique;
}

/**
 * Fill each step's `id` from its `technique` when absent (the last `::` segment),
 * mutating the steps in place so all downstream readers see a populated id.
 * Scopes are validated independently: the activity's top-level `steps`, and each
 * loop's `steps`. A duplicate resolved id within a scope is an error. A step with
 * neither `id` nor `technique` is unresolvable and is an error.
 */
export function populateStepIds(activity: Activity): void {
  const fillScope = (steps: Step[] | undefined, scopeLabel: string): void => {
    if (!steps) return;
    const seen = new Set<string>();
    for (const step of steps) {
      if (!step.id) {
        // Only a kind:technique step may omit its id (every other kind declares one structurally).
        if (step.kind !== 'technique') {
          throw new Error(
            `Activity '${activity.id}': ${scopeLabel} has a kind:${step.kind} step without an id; only a technique step's id is derivable.`,
          );
        }
        step.id = defaultStepId(techniqueName(step.technique)!);
      }
      if (seen.has(step.id)) {
        throw new Error(
          `Activity '${activity.id}': ${scopeLabel} has duplicate resolved step id '${step.id}'` +
            (step.kind === 'technique' ? ` (from technique '${techniqueName(step.technique)}')` : '') +
            '; give the colliding step an explicit unique id.',
        );
      }
      seen.add(step.id);
      // A loop-kind step carries a nested body; validate it as its own independent scope.
      if (step.kind === 'loop' && step.steps.length > 0) {
        fillScope(step.steps as Step[], `loop '${step.id}' steps`);
      }
    }
  };

  // Top-level steps; fillScope recurses into each loop-kind step's nested body as its own scope.
  fillScope(activity.steps, 'top-level steps');
}

/**
 * Surface each step's resolved id in raw activity YAML before it is handed to a
 * worker. A step whose id was derived from its technique begins with the
 * `- technique:` field (the id line is absent); this inserts the derived
 * `id:` line (the technique's last `::` segment) ahead of it, preserving the
 * step's indentation, so a worker reading the activity sees the same id the
 * server resolves for `get_technique` and step-manifest validation.
 */
export function injectResolvedStepIds(rawDefinition: string): string {
  return rawDefinition.replace(
    /^(\s*)- technique:[ \t]*(.+)$/gm,
    (_match, indent: string, techniqueValue: string) => {
      const unquoted = techniqueValue.trim().replace(/^["']|["']$/g, '');
      const resolvedId = defaultStepId(unquoted);
      return `${indent}- id: ${resolvedId}\n${indent}  technique: ${techniqueValue}`;
    },
  );
}

// Checkpoint definition. There is no standalone checkpoint Zod object — checkpoints are inline
// kind:checkpoint steps on StepSchema. This is the shape activityCheckpoints() synthesizes from
// them (its `id` is the stable checkpoint-response replay key).
export interface Checkpoint {
  id: string;
  name: string;
  message: string;
  condition?: z.infer<typeof ConditionSchema> | undefined;
  options: CheckpointOption[];
  defaultOption?: string | undefined;
  autoAdvanceMs?: number | undefined;
}

export const ExitSchema = z.object({
  id: z.string().describe('Kebab-case outcome name, unique within the activity and distinct from a destination activity identifier.'),
  label: z.string().optional().describe('Human-readable statement of the outcome.'),
  when: WhenExpressionSchema.optional().describe('Expression selecting this exit, in the same dialect as a step `when`. Omitted on the default exit and on an exit only a checkpoint option selects.'),
  isDefault: z.literal(true).optional().describe('Declare `true` for the exit taken when no `when` matches and no checkpoint option selects an exit, including when a checkpoint is dismissed because its condition was not met. Required on exactly one exit of an activity with two or more exits; `false` is rejected.'),
  immediate: z.literal(true).optional().describe('Declare `true` so that selecting this exit at a checkpoint ends the step sequence there, and the remaining steps do not run. Omission records the exit when chosen and takes it when the steps finish; `false` is rejected.'),
}).strict().describe('Named activity outcome with optional selection and completion conditions.');
export type Exit = z.infer<typeof ExitSchema>;

export const ActivitySchema = z.object({
  id: enforcement(z.string().describe('Unique identifier for the activity'), { owner: 'Engine', strictness: 'enforced' }),
  version: SemanticVersionSchema.describe('Semantic version of the activity'),
  name: enforcement(z.string().describe('Human-readable activity name'), { owner: 'Engine', strictness: 'advisory' }),
  
  description: enforcement(z.string().optional().describe('Detailed description of the activity'), { owner: 'Engine', strictness: 'advisory' }),

  variables: ActivityVariablesSchema.optional().describe('Session variable names required by this activity and declarations for the variables it writes.'),

  techniques: TechniquesReferenceSchema.optional(),

  bundleTechniques: BundleTechniquesSchema.optional().describe('Optional character limit for inline step techniques.'),

  steps: z.array(StepSchema).optional().describe('Ordered steps, with checkpoints and loops at their positions in the sequence.'),

  exits: enforcement(z.array(ExitSchema).optional().describe('Named outcomes, one of which the activity takes when its steps end. Every exit is bound to a destination in the workflow `graph`, and an unbound exit fails the workflow load. An activity with two or more exits declares exactly one `isDefault`. Omission makes the activity terminal.'), { owner: 'Engine', strictness: 'advisory' }),
  triggers: enforcement(z.array(WorkflowTriggerSchema).optional().describe('Child workflows to start from this activity.'), { owner: 'Agent', strictness: 'advisory' }),

  outcome: enforcement(z.array(z.string().describe('Expected result of successful activity completion.')).optional().describe('Expected outcomes of successful activity completion.'), { owner: 'Agent', strictness: 'advisory' }),
  required: enforcement(z.boolean().default(true).describe('Whether this activity is required in the workflow'), { owner: 'Engine', strictness: 'advisory' }),
  rules: enforcement(z.array(z.string().describe('Rule or constraint for this activity.')).optional().describe('Activity-level rules and constraints that agents must follow'), { owner: 'Engine', strictness: 'advisory' }),
  artifactPrefix: enforcement(z.string().optional().describe('Numeric artifact filename prefix, taken from the activity filename (`02` from `02-design-philosophy.yaml`); omitted from authored activity definitions.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict().describe('Activity with ordered steps; its artifacts are declared by the techniques its steps bind.');

export type Activity = z.infer<typeof ActivitySchema>;

export function validateActivity(data: unknown): Activity { return ActivitySchema.parse(data); }
export function safeValidateActivity(data: unknown) { return ActivitySchema.safeParse(data); }

/**
 * Walk every step of an activity in document order: top-level steps and each loop-kind body
 * (recursively). The single traversal all step/checkpoint consumers route through.
 */
export function flattenActivitySteps(activity: Activity): Step[] {
  const out: Step[] = [];
  const rec = (steps?: Step[]): void => {
    for (const s of steps ?? []) {
      out.push(s);
      if (s.kind === 'loop' && s.steps.length) rec(s.steps as Step[]);
    }
  };
  rec(activity.steps);
  return out;
}

/**
 * The index in the activity's top-level `steps` of the step with this id, or of the top-level step
 * whose loop body contains it. A nested step belongs to its top-level ancestor because that is the
 * unit the sequence advances through: an immediate exit selected inside a loop body ends the whole
 * sequence, not the iteration. Returns -1 when no step carries the id.
 */
export function topLevelStepIndex(activity: Activity, stepId: string): number {
  const contains = (steps: Step[] | undefined): boolean =>
    (steps ?? []).some(s => s.id === stepId || (s.kind === 'loop' && contains(s.steps as Step[])));
  return (activity.steps ?? []).findIndex(s => s.id === stepId || (s.kind === 'loop' && contains(s.steps as Step[])));
}

/**
 * The activity's checkpoint definitions: its kind:checkpoint steps, in document order. A checkpoint
 * step carries its message/options/effects, so it maps directly to a definition, and its id is the
 * stable key used for checkpoint yield/respond/replay. A step a routine contributed is already
 * materialised by the time anything reads this, under the identifier its reference site prefixes.
 */
export function activityCheckpoints(activity: Activity): Checkpoint[] {
  return flattenActivitySteps(activity)
    .filter((s): s is CheckpointStep => s.kind === 'checkpoint')
    .map((s) => {
      return {
        id: s.id,
        name: s.id,
        message: s.message,
        options: s.options,
        defaultOption: s.defaultOption,
        autoAdvanceMs: s.autoAdvanceMs,
        condition: s.condition,
      };
    });
}
