import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';
import { SemanticVersionSchema } from './common.js';
import { enforcement } from './enforcement.js';
import { ActivityVariablesSchema } from './variable.schema.js';

export const TechniquesReferenceSchema = enforcement(z.array(z.string()).describe('Activity-wide technique references, using `::`-separated paths.'), { owner: 'Engine', strictness: 'enforced' });
export type TechniquesReference = z.infer<typeof TechniquesReferenceSchema>;

export const BundleTechniquesSchema = enforcement(z.object({
  maxChars: z.number().int().nonnegative().describe('Maximum characters per step technique included with the activity; zero excludes all step techniques.'),
}).strict(), { owner: 'Engine', strictness: 'enforced' });
export type BundleTechniques = z.infer<typeof BundleTechniquesSchema>;

export const ActionSchema = z.object({
  action: z.enum(['log', 'validate', 'set', 'emit', 'message']).describe('Action to perform.'),
  target: z.string().optional(),
  message: z.string().optional(),
  value: z.unknown().optional(),
  description: z.string().optional().describe('Human-readable description of what this action does'),
  condition: ConditionSchema.optional().describe('Condition that must be true for this action to execute'),
});
export type Action = z.infer<typeof ActionSchema>;

export const WorkflowTriggerSchema = z.object({
  workflow: z.string().describe('ID of the workflow to trigger'),
  description: z.string().optional().describe('When and why to trigger this workflow.'),
  passContext: enforcement(z.array(z.string()).optional().describe('Context variable names to pass to the child workflow.'), { owner: 'Agent', strictness: 'advisory' }),
});
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;

export const CheckpointOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  effect: z.object({
    setVariable: enforcement(z.record(z.unknown()).optional().describe('Variable assignments associated with selecting this option.'), { owner: 'Engine', strictness: 'enforced' }),
    exit: enforcement(z.string().optional().describe('Name from the owning activity\'s `exits`, omitted for an ad hoc checkpoint.'), { owner: 'Engine', strictness: 'advisory' }),
  }).strict().optional(),
});
export type CheckpointOption = z.infer<typeof CheckpointOptionSchema>;

export const TechniqueBindingSchema = z.object({
  name: z.string().describe('Technique reference, such as `group::technique` or `workflow::group::technique`.'),
  inputs: enforcement(z.record(z.union([z.string(), z.number(), z.boolean()])).optional().describe('Input identifiers mapped to variable names, literals, or `{template}` expressions where the binding differs from the input name or default.'), { owner: 'Agent', strictness: 'advisory' }),
  outputs: enforcement(z.record(z.string()).optional().describe('Output identifiers mapped to workflow variable names where the names differ.'), { owner: 'Agent', strictness: 'advisory' }),
});
export type TechniqueBinding = z.infer<typeof TechniqueBindingSchema>;

const stepCommonFields = {
  when: enforcement(z.string().optional().describe('Boolean expression required to enter this step; mixed `&&` and `||` expressions require parentheses.'), { owner: 'Agent', strictness: 'advisory' }),
  required: enforcement(z.literal(false).optional().describe('Declare `false` for an optional step; omission means the step is required.'), { owner: 'Agent', strictness: 'advisory' }),
};

const stepEntryCondition = {
  condition: enforcement(ConditionSchema.optional().describe('Structured entry condition; a checkpoint may be dismissed when this condition is false.'), { owner: 'Agent', strictness: 'advisory' }),
};

export const TechniqueStepSchema = z.object({
  kind: enforcement(z.literal('technique').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().optional().describe('Step identifier, defaulting to the last `::` segment of its technique reference.'), { owner: 'Engine', strictness: 'enforced' }),
  technique: z.union([z.string(), TechniqueBindingSchema]).describe('Technique reference, or an object with `name` and optional `inputs` and `outputs` bindings.'),
  actions: enforcement(z.array(ActionSchema).optional(), { owner: 'Agent', strictness: 'advisory' }),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict();
export type TechniqueStep = z.infer<typeof TechniqueStepSchema>;

export const ActionStepSchema = z.object({
  kind: enforcement(z.literal('action').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Identifier for this step within the activity.'), { owner: 'Engine', strictness: 'enforced' }),
  actions: enforcement(z.array(ActionSchema).optional().describe('Control actions; may be empty for marker steps.'), { owner: 'Agent', strictness: 'advisory' }),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict();
export type ActionStep = z.infer<typeof ActionStepSchema>;

export const CheckpointStepSchema = z.object({
  kind: enforcement(z.literal('checkpoint').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Identifier for this checkpoint within the activity.'), { owner: 'Engine', strictness: 'enforced' }),
  message: z.string().describe('Message presented to the user.'),
  options: enforcement(z.array(CheckpointOptionSchema).min(1).describe('Decision options with effects.'), { owner: 'Engine', strictness: 'enforced' }),
  defaultOption: enforcement(z.string().optional().describe('Option identifier to use when no person answers the checkpoint.'), { owner: 'Engine', strictness: 'enforced' }),
  autoAdvanceMs: enforcement(z.number().int().positive().optional().describe('Positive waiting interval in milliseconds before the default option may be selected automatically.'), { owner: 'Engine', strictness: 'enforced' }),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict();
export type CheckpointStep = z.infer<typeof CheckpointStepSchema>;

// Recursion is on the steps field: discriminatedUnion requires object members, so the union cannot be lazy.
export const LoopStepSchema = z.object({
  kind: enforcement(z.literal('loop').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Identifier for this step within the activity.'), { owner: 'Engine', strictness: 'enforced' }),
  name: z.string().optional().describe('Human-readable label for the iteration.'),
  loopType: enforcement(z.enum(['forEach', 'while', 'doWhile']).describe('Iteration over a collection (`forEach`), with a pre-test (`while`), or with a post-test (`doWhile`).'), { owner: 'Agent', strictness: 'advisory' }),
  continueWhile: enforcement(ConditionSchema.optional().describe('Continuation condition required for `while` and `doWhile` loops and absent for `forEach` loops.'), { owner: 'Agent', strictness: 'advisory' }),
  variable: enforcement(z.string().optional().describe('Current-item variable bound each iteration.'), { owner: 'Agent', strictness: 'advisory' }),
  over: enforcement(z.string().optional().describe('Collection expression iterated by a forEach loop.'), { owner: 'Agent', strictness: 'advisory' }),
  breakCondition: enforcement(ConditionSchema.optional().describe('Condition that ends a `forEach` loop before the next item; absent for `while` and `doWhile` loops.'), { owner: 'Agent', strictness: 'advisory' }),
  maxIterations: enforcement(z.number().int().positive().optional().describe('Maximum number of iterations.'), { owner: 'Agent', strictness: 'advisory' }),
  steps: enforcement(z.array(z.lazy((): z.ZodTypeAny => StepSchema)).describe('The loop body, a nested ordered list of steps.'), { owner: 'Engine', strictness: 'enforced' }),
  ...stepCommonFields,
}).strict().describe('Loop with a `when` entry expression and a separate continuation test, without a `condition` field.');
export type LoopStep = z.infer<typeof LoopStepSchema>;

export const RoutineStepSchema = z.object({
  kind: enforcement(z.literal('routine').describe('Step-kind discriminator.'), { owner: 'Engine', strictness: 'enforced' }),
  id: enforcement(z.string().describe('Routine step identifier and prefix for identifiers within its body.'), { owner: 'Engine', strictness: 'enforced' }),
  routine: z.string().describe('Routine reference in `[namespace::]name` form, with a directory name or corpus-relative path as the namespace.'),
  with: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().describe('Routine input identifiers mapped to literal values or `{host_variable}` references; omitted arguments use declared defaults, then same-name host variables.'),
  outputs: z.record(z.string()).optional().describe('Routine output identifiers mapped to session variable names; only outputs declared optional may be left unbound.'),
  ...stepCommonFields,
}).strict().describe('Routine invocation with an optional `when` entry expression and no `condition` field.');
export type RoutineStep = z.infer<typeof RoutineStepSchema>;

export const StepSchema = z.discriminatedUnion('kind', [
  TechniqueStepSchema,
  ActionStepSchema,
  CheckpointStepSchema,
  LoopStepSchema,
  RoutineStepSchema,
]).describe('Step selected by `kind`, with guidance in its technique and no step-level `description` field.');
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
  when: z.string().optional().describe('Boolean expression selecting this exit; omitted for default exits and exits selected only by checkpoint options.'),
  isDefault: z.literal(true).optional().describe('Declare `true` for the fallback when no condition or checkpoint selects an exit; required on exactly one exit when several exist.'),
  immediate: z.literal(true).optional().describe('Declare `true` to end the remaining steps when a checkpoint selects this exit; omission defers the exit until the steps finish.'),
}).strict();
export type Exit = z.infer<typeof ExitSchema>;

export const ActivitySchema = z.object({
  id: enforcement(z.string().describe('Unique identifier for the activity'), { owner: 'Engine', strictness: 'enforced' }),
  version: SemanticVersionSchema.describe('Semantic version of the activity'),
  name: enforcement(z.string().describe('Human-readable activity name'), { owner: 'Engine', strictness: 'advisory' }),
  
  description: enforcement(z.string().optional().describe('Detailed description of the activity'), { owner: 'Engine', strictness: 'advisory' }),

  variables: ActivityVariablesSchema.optional().describe('Session variable names required by this activity and declarations for the variables it writes.'),

  techniques: TechniquesReferenceSchema.optional(),

  bundleTechniques: BundleTechniquesSchema.optional().describe('Optional character limit for inline step techniques.'),

  steps: z.array(StepSchema).optional().describe('Ordered steps, including checkpoints and loops inline; separate `checkpoints[]` and `loops[]` fields are not accepted.'),

  exits: enforcement(z.array(ExitSchema).optional().describe('Named outcomes, each bound to a destination in the workflow graph; omission makes the activity terminal.'), { owner: 'Engine', strictness: 'advisory' }),
  triggers: enforcement(z.array(WorkflowTriggerSchema).optional().describe('Child workflows to start from this activity.'), { owner: 'Agent', strictness: 'advisory' }),

  outcome: enforcement(z.array(z.string()).optional().describe('Expected outcomes of successful activity completion.'), { owner: 'Agent', strictness: 'advisory' }),
  required: enforcement(z.boolean().default(true).describe('Whether this activity is required in the workflow'), { owner: 'Engine', strictness: 'advisory' }),
  rules: enforcement(z.array(z.string()).optional().describe('Activity-level rules and constraints that agents must follow'), { owner: 'Engine', strictness: 'advisory' }),
  artifactPrefix: enforcement(z.string().optional().describe('Numeric artifact filename prefix, such as `02`; omitted from authored activity definitions.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict().describe('Activity with ordered steps; artifact contracts belong to the bound techniques, with no activity-level artifact-contract field.');

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
