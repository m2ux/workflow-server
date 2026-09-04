import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';
import { SemanticVersionSchema } from './common.js';
import { ActivityVariablesSchema } from './variable.schema.js';

// Techniques reference (activity-level — optional when steps declare their own techniques).
// A flat list of activity-wide technique references (`::` paths): the strategy/capability
// techniques (e.g. `variable-binding`, `scatter-gather`) whose protocols apply across the
// activity's steps. Per-step operations are bound at the step via `step.technique`, not here.
export const TechniquesReferenceSchema = z.array(z.string()).describe('Activity-wide technique references (`::` paths); bundled into get_activity.');
export type TechniquesReference = z.infer<typeof TechniquesReferenceSchema>;

// Hybrid technique bundling (#189 C1c) — optional per-activity override on the automatic,
// context-derived eager bundling get_activity performs for EVERY activity. get_activity inlines
// the composed content of the activity's small step-bound techniques under a `step_techniques` map,
// sized to a cumulative budget derived from the caller's `context_tokens`. `maxChars` is an explicit
// per-technique size cap layered on that budget; `maxChars: 0` opts the activity out of eager
// bundling entirely. A step whose gate has no fixed answer at delivery time — it reads a variable
// this activity produces, or one absent from the bag — stays lazy via get_technique.
export const BundleTechniquesSchema = z.object({
  maxChars: z.number().int().nonnegative().describe('Per-technique character cap layered on the server-derived per-activity eager-delivery budget: a step technique whose composed wire form exceeds this is not inlined and is fetched with get_technique { step_id }. Set to 0 to opt this activity out of eager step-technique bundling entirely.'),
}).strict();
export type BundleTechniques = z.infer<typeof BundleTechniquesSchema>;

// Action schema
export const ActionSchema = z.object({
  action: z.enum(['log', 'validate', 'set', 'emit', 'message']).describe('Action verb, interpreted by the executing agent. The server has no action interpreter: executing `set` is the worker\'s job, and its value reaches the session variable bag when the worker reports it in the `variables_changed` its orchestrator relays on next_activity. `set` is slated for removal at the next workflow-schema major (#166 B7/B12).'),
  target: z.string().optional(),
  message: z.string().optional(),
  value: z.unknown().optional(),
  description: z.string().optional().describe('Human-readable description of what this action does'),
  condition: ConditionSchema.optional().describe('Condition that must be true for this action to execute'),
});
export type Action = z.infer<typeof ActionSchema>;

// Workflow trigger schema - allows an activity or step to trigger another workflow
export const WorkflowTriggerSchema = z.object({
  workflow: z.string().describe('ID of the workflow to trigger'),
  description: z.string().optional().describe('Description of when/why this workflow is triggered'),
  passContext: z.array(z.string()).optional().describe('Context variable names the dispatching agent relays to the child workflow. The server does not copy them — a child session\'s bag starts from the child workflow\'s own declared defaults, nothing more.'),
});
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;

// Checkpoint option schema — defined before StepSchema so a kind:checkpoint step can carry its options inline.
export const CheckpointOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  effect: z.object({
    setVariable: z.record(z.unknown()).optional().describe('Variable assignments the server applies to the session variable bag when the option is selected — the one engine-applied checkpoint effect. Values are validated against the declared variable type, warn-only: mismatches are stored as written and surfaced in _meta.validation; `{name}` template passthroughs are exempt.'),
    exit: z.string().optional().describe('Exit of the owning activity this option selects — a name from the activity\'s `exits[]`, never an activity id. The destination is the workflow\'s to state: `present_checkpoint` reads it from the workflow graph so the option\'s consequence is stated before the user chooses. An adhoc checkpoint has no declared exits, so its options carry setVariable only.'),
  }).strict().optional(),
});
export type CheckpointOption = z.infer<typeof CheckpointOptionSchema>;

// Step schema
/**
 * Structured per-step technique binding. `name` is the operation reference; `inputs` carries input
 * deviations (op input id → source expression: rename / literal / `{template}`) and `outputs`
 * carries output remaps (op output id → the workflow variable name its value lands under). A step
 * with no deviations uses the bare-string form instead of this object.
 */
export const TechniqueBindingSchema = z.object({
  name: z.string().describe('The `group::operation` (or bare op / `workflow::group::op`) technique reference this step invokes.'),
  inputs: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().describe('Input deviations: op input id → source expression (rename of a bag variable, literal, or `{template}`). Only what differs from same-name binding or a declared default.'),
  outputs: z.record(z.string()).optional().describe('Output remaps: op output id → the workflow variable name its produced value lands under, when it differs from the output id.'),
});
export type TechniqueBinding = z.infer<typeof TechniqueBindingSchema>;

// Fields carried by every step kind. A step is a bound unit of work, not a prose slot: guidance
// lives in the bound technique's protocol (AP-64), so no step kind carries a `description`.
// `required` is declared only when false — omitting it means the step is required (the default).
const stepCommonFields = {
  when: z.string().optional().describe(
    'Inline boolean expression that gates this step. Operators: ==, !=, >, <, >=, <=, bare identifier truthiness, unary !, &&, ||, and parentheses. Precedence (C-style, tightest first): () > ! > comparisons > && > ||. Mixing && and || at the same nesting depth requires parentheses. Examples: "has_saved_state == true", "remediation_round > 0", "a == true && b != false", "(a && b) || c", "is_review_mode != true && (problem_complexity == \\"moderate\\" || problem_complexity == \\"complex\\")". Evaluated by the executing agent against current variable state; the server never evaluates gates. Mechanical nets (e2e walker, guards) use the shared reference evaluator and treat invalid expressions as false (step does not run). On a checkpoint step, only `condition` (not `when`) enables condition_not_met dismissal.',
  ),
  required: z.literal(false).optional().describe('Declared only when false (an optional step). An omitted `required` means the step is required; `required: true` is redundant and rejected (AP-64). A worker hint — the server does not check it.'),
};

// The structured entry gate, carried by the step kinds whose only gate is an entry gate. A loop
// step is the exception: `when` alone decides whether it is entered, and `continueWhile` decides
// whether it goes round again. One field per question, so neither reader has to ask which kind of
// step it is holding.
const stepEntryCondition = {
  condition: ConditionSchema.optional().describe('LEGACY: Structured condition that must be true for this step to execute, evaluated by the executing agent. Prefer the `when` inline expression for simple comparisons — except on a checkpoint step, where the `condition` field is what makes the checkpoint dismissible via respond_checkpoint condition_not_met.'),
};

/**
 * A step in an activity's ordered execution list — a `kind`-tagged unit in the unified model:
 * `technique` (binds an operation), `action` (control-only), `checkpoint` (an inline user decision
 * point at its concrete position in the sequence), or `loop` (a compound step whose body is the
 * recursive `steps`). Each kind is a closed object: a field outside its declared set is a schema
 * error (AP-64 bound-step purity).
 */
export const TechniqueStepSchema = z.object({
  kind: z.literal('technique').describe('Step-kind discriminator.'),
  id: z.string().optional().describe('Identifier for this step within the activity. Optional: the loader derives it from the last `::` segment of the technique name.'),
  technique: z.union([z.string(), TechniqueBindingSchema]).describe('Canonical per-step binding: a `group::operation` reference (string) for a step with no deviations, or `{ name, inputs?, outputs? }` when the step supplies input deviations or output remaps.'),
  actions: z.array(ActionSchema).optional(),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict();
export type TechniqueStep = z.infer<typeof TechniqueStepSchema>;

export const ActionStepSchema = z.object({
  kind: z.literal('action').describe('Step-kind discriminator.'),
  id: z.string().describe('Identifier for this step within the activity.'),
  actions: z.array(ActionSchema).optional().describe('Control actions; may be empty for marker steps.'),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict();
export type ActionStep = z.infer<typeof ActionStepSchema>;

// The body of a checkpoint — everything but the step identity (`kind`, `id`) and the site-specific
// gates (`when`, `required`). This is the shape a workflow-level checkpoint fragment declares once
// under `fragments.checkpoints.<name>`; a `ref` step imports it (#166 B10).
export const CheckpointFragmentBodySchema = z.object({
  message: z.string().describe('Message presented to the user.'),
  options: z.array(CheckpointOptionSchema).min(1).describe('Decision options with effects.'),
  defaultOption: z.string().optional().describe('The answer a soft gate takes when no person is reached.'),
  autoAdvanceMs: z.number().int().positive().optional().describe('The interval the server spends before applying a soft gate\'s default on respond_checkpoint { auto_advance: true }.'),
  condition: ConditionSchema.optional().describe('Condition shared by every use site. A referencing step may declare its own `condition` only when the fragment declares none.'),
}).strict();
export type CheckpointFragmentBody = z.infer<typeof CheckpointFragmentBodySchema>;

// A checkpoint step is authored in exactly one of two forms (enforced at load, not by the union —
// the discriminated union needs a plain object per kind): inline (message + options present, no
// `ref`) or by reference (`ref` names a `fragments.checkpoints` entry; the body fields are
// forbidden locally so the fragment stays the single home for the checkpoint's content). The
// loader materializes ref steps before anything downstream reads them.
export const CheckpointStepSchema = z.object({
  kind: z.literal('checkpoint').describe('Step-kind discriminator.'),
  id: z.string().describe('Identifier for this step within the activity; the stable checkpoint-response replay key.'),
  ref: z.string().optional().describe('Checkpoint-fragment reference: `[workflow::]name`, resolved against the declaring workflow\'s `fragments.checkpoints` (bare name: declaring workflow, then meta). Mutually exclusive with the body fields — a ref step carries only its id and, when the fragment declares none, a condition.'),
  message: z.string().optional().describe('Message presented to the user. Required on an inline checkpoint; forbidden alongside `ref`.'),
  options: z.array(CheckpointOptionSchema).min(1).optional().describe('Decision options with effects. Required on an inline checkpoint; forbidden alongside `ref`.'),
  defaultOption: z.string().optional().describe('The answer a soft gate takes when no person is reached.'),
  autoAdvanceMs: z.number().int().positive().optional().describe('The interval the server spends before applying a soft gate\'s default on respond_checkpoint { auto_advance: true }.'),
  ...stepCommonFields,
  ...stepEntryCondition,
}).strict();
export type CheckpointStep = z.infer<typeof CheckpointStepSchema>;

// kind:loop — a compound step whose body is a nested ordered steps[] (named `loopType` to avoid
// clashing with Condition.type). The recursion lives on the `steps` FIELD via z.lazy:
// discriminatedUnion requires plain object members, so the union itself cannot be lazy.
//
// Five fields decide whether and how often the body runs, one question each: `when` whether the
// loop is entered at all, `loopType` when the continuation test is taken, `continueWhile` what
// that test is, `over`/`variable` the collection and the item, `maxIterations` the ceiling. A loop
// carries no `condition`, so its entry gate is `when` — uniformly with every other step kind.
export const LoopStepSchema = z.object({
  kind: z.literal('loop').describe('Step-kind discriminator.'),
  id: z.string().describe('Identifier for this step within the activity.'),
  name: z.string().optional().describe('Structural label for the iteration (the one step kind that carries a name).'),
  loopType: z.enum(['forEach', 'while', 'doWhile']).describe('Iteration type. `forEach` walks a collection; `while` takes its continuation test before the first pass; `doWhile` takes it after.'),
  continueWhile: ConditionSchema.optional().describe('The continuation test of a while/doWhile loop: the body runs again while this holds. Declared by every repeat-until loop and by no forEach, whose iteration is bounded by its collection. Evaluated by the executing agent; `loopType` says when it is taken.'),
  variable: z.string().optional().describe('Current-item variable bound each iteration.'),
  over: z.string().optional().describe('Collection expression iterated by a forEach loop.'),
  breakCondition: ConditionSchema.optional().describe('Early exit from item iteration, evaluated by the executing agent before each item: iteration stops when it holds. A repeat-until loop states its stopping condition in `continueWhile` instead.'),
  maxIterations: z.number().int().positive().optional().describe('Safety bound on iteration count, enforced by the executing agent.'),
  steps: z.array(z.lazy((): z.ZodTypeAny => StepSchema)).describe('The loop body, a nested ordered list of steps.'),
  ...stepCommonFields,
}).strict();
export type LoopStep = z.infer<typeof LoopStepSchema>;

export const StepSchema = z.discriminatedUnion('kind', [
  TechniqueStepSchema,
  ActionStepSchema,
  CheckpointStepSchema,
  LoopStepSchema,
]);
export type Step = z.infer<typeof StepSchema>;

/** The operation reference of a step's technique binding, whether bare-string or structured. */
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

/**
 * A named outcome of the activity, in the activity's own vocabulary (`converged`,
 * `revision-needed`, `aborted`; `done` for an activity that simply finishes). An exit says what
 * happened, never what runs next: the destination is bound per exit in the workflow's `graph`, so
 * two workflows can run one borrowed activity in different orders without editing its file.
 * An activity with no exits is terminal by omission.
 */
export const ExitSchema = z.object({
  id: z.string().describe('Outcome name, unique within the activity. Kebab-case, in the activity\'s vocabulary — never an activity id.'),
  label: z.string().optional().describe('Human-readable statement of the outcome.'),
  when: z.string().optional().describe('Inline boolean expression selecting this exit, evaluated agent-side against the variable bag in the `when` dialect the step gates use. Omitted on an exit only a checkpoint option selects, and on the default exit.'),
  isDefault: z.literal(true).optional().describe('The outcome when no `when` matched and no checkpoint option selected an exit — including a checkpoint dismissed because its condition was not met. Declared exactly once on an activity with two or more exits; `isDefault: false` is redundant and rejected.'),
  immediate: z.literal(true).optional().describe('Selecting this exit at a checkpoint ends the step sequence there: the remaining steps do not run and the step-manifest check accounts for them. Declared for the aborts, where the tail would otherwise run against the user\'s decision. Without it an exit is recorded when chosen and taken when the sequence ends. `immediate: false` is redundant and rejected.'),
}).strict();
export type Exit = z.infer<typeof ExitSchema>;

// Unified Activity schema. Closed object: a field outside the declared set is a schema error.
// The activity's artifact contract is not a schema field at all — `get_activity` synthesizes it
// from the `## Outputs` of the techniques the activity's steps bind (AP-65, AP-43).
export const ActivitySchema = z.object({
  // Identity (required)
  id: z.string().describe('Unique identifier for the activity'),
  version: SemanticVersionSchema.describe('Semantic version of the activity'),
  name: z.string().describe('Human-readable activity name'),
  
  // Description (optional)
  description: z.string().optional().describe('Detailed description of the activity'),

  // The activity's variable contract (#493): what it reads, and what it writes. Its writes are
  // contributed to the variable set of every workflow whose graph includes it.
  variables: ActivityVariablesSchema.optional().describe('The session variables this activity reads and writes. Its writes are declarations contributed to the including workflow\'s variable set; its reads are the names it needs that workflow to supply.'),

  // Activity-wide techniques, referenced by `::` path. The server bundles them into get_activity.
  techniques: TechniquesReferenceSchema.optional(),

  // Opt-in hybrid bundling of step-bound techniques into get_activity (#166 B11).
  bundleTechniques: BundleTechniquesSchema.optional().describe('Opt-in hybrid bundling: get_activity inlines each step technique whose composed wire form is at most maxChars and whose gate answers true at activity open; larger ones, and those whose gate has no answer yet, remain lazy-fetched via get_technique. Bundled deliveries are recorded as technique_bundled history events and satisfy the manifest fidelity check.'),

  // Execution — the single ordered list of kind-tagged steps (technique | action | checkpoint | loop).
  // Checkpoints are inline kind:checkpoint steps and loops are compound kind:loop steps: there are no
  // separate checkpoints[]/loops[] arrays in the unified model.
  steps: z.array(StepSchema).optional().describe('Ordered, kind-tagged execution steps for this activity'),

  // The activity's named outcomes (read at the activity boundary, not part of the worker step
  // sequence). Where each leads is the workflow's `graph` to bind — the activity names no other activity.
  exits: z.array(ExitSchema).optional().describe('Named outcomes of this activity, one of which it takes when its steps end. Each is bound to a destination in the workflow\'s `graph`; an unbound exit fails the workflow load. Omitted on an activity that is terminal by omission.'),
  triggers: z.array(WorkflowTriggerSchema).optional().describe('Workflows the orchestrator dispatches from this activity (via dispatch_child with an explicit workflow_id); the server does not act on trigger declarations.'),

  // Metadata (optional)
  outcome: z.array(z.string()).optional().describe('Expected outcomes when activity completes successfully. Advisory — the server does not reconcile them against activity_manifest outcomes.'),
  required: z.boolean().default(true).describe('Whether this activity is required in the workflow'),
  rules: z.array(z.string()).optional().describe('Activity-level rules and constraints that agents must follow'),
  artifactPrefix: z.string().optional().describe('Numeric prefix for artifact filenames, inferred from the activity filename (e.g., "02" from 02-design-philosophy.yaml). Server-computed — do not set in definition files.'),
}).strict();

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
 * The activity's checkpoint definitions: the inline kind:checkpoint steps, in document order. A
 * kind:checkpoint step carries its message/options/effects inline, so it maps directly to a
 * checkpoint definition (its id is the stable key used for checkpoint yield/respond/replay).
 * Ref-form steps must be materialized first (the loader does this); an unmaterialized ref step
 * has no body to synthesize a definition from.
 */
export function activityCheckpoints(activity: Activity): Checkpoint[] {
  return flattenActivitySteps(activity)
    .filter((s): s is CheckpointStep => s.kind === 'checkpoint')
    .map((s) => {
      if (s.message === undefined || s.options === undefined) {
        throw new Error(
          `Activity '${activity.id}': checkpoint '${s.id}' has no message/options` +
            (s.ref ? ` — fragment ref '${s.ref}' was not materialized before use.` : '.'),
        );
      }
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
