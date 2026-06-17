import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';
import { SemanticVersionSchema } from './common.js';

// Techniques reference (activity-level — optional when steps declare their own techniques).
// A flat list of activity-wide technique references (`::` paths): the strategy/capability
// techniques (e.g. `variable-binding`, `scatter-gather`) whose protocols apply across the
// activity's steps. Per-step operations are bound at the step via `step.technique`, not here.
export const TechniquesReferenceSchema = z.array(z.string()).describe('Activity-wide technique references (`::` paths); bundled into get_activity.');
export type TechniquesReference = z.infer<typeof TechniquesReferenceSchema>;

// Action schema
export const ActionSchema = z.object({
  action: z.enum(['log', 'validate', 'set', 'emit', 'message']),
  target: z.string().optional(),
  message: z.string().optional(),
  value: z.unknown().optional(),
  description: z.string().optional().describe('Human-readable description of what this action does'),
  condition: ConditionSchema.optional().describe('Condition that must be true for this action to execute'),
});
export type Action = z.infer<typeof ActionSchema>;

// Forward-declare step and loop schemas for circular references
// StepSchema references LoopSchema (via loops) and WorkflowTriggerSchema (via triggers)
// LoopSchema references StepSchema (via steps)

// Workflow trigger schema - allows an activity or step to trigger another workflow
export const WorkflowTriggerSchema = z.object({
  workflow: z.string().describe('ID of the workflow to trigger'),
  description: z.string().optional().describe('Description of when/why this workflow is triggered'),
  passContext: z.array(z.string()).optional().describe('Context variables to pass to the triggered workflow'),
});
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;

// Checkpoint option schema — defined before StepSchema so a kind:checkpoint step can carry its options inline.
export const CheckpointOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  effect: z.object({
    setVariable: z.record(z.unknown()).optional(),
    transitionTo: z.string().optional().describe('Activity ID to transition to'),
    skipActivities: z.array(z.string()).optional().describe('Activity IDs to skip'),
  }).optional(),
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

/**
 * A step in an activity's ordered execution list — a `kind`-tagged unit in the unified model:
 * `technique` (binds an operation), `action` (control-only), `checkpoint` (an inline user decision
 * point at its concrete position in the sequence), or `loop` (a compound step whose body is the
 * recursive `steps`). Per-kind required fields are enforced in the superRefine below.
 */
export const StepSchema = z.object({
  id: z.string().optional().describe('Identifier for this step within the activity. Optional only for a kind:technique step (the loader derives it from the last `::` segment of the technique name); every other kind must declare an explicit id.'),
  description: z.string().optional().describe('Detailed guidance for executing this step. May carry a deprecated inline operation invocation of the form `technique-id::operation-name(arg: {var}, ...)`; the canonical binding is the `technique` field.'),
  technique: z.union([z.string(), TechniqueBindingSchema]).optional().describe('Canonical per-step binding: a `group::operation` reference (string) for a step with no deviations, or `{ name, inputs?, outputs? }` when the step supplies input deviations or output remaps.'),
  required: z.boolean().default(true),
  when: z.string().optional().describe('Inline boolean expression that gates this step. Examples: "has_saved_state == true", "is_monorepo == true", "client_workflow_completed == false". Evaluated against current variable state at runtime.'),
  condition: ConditionSchema.optional().describe('LEGACY: Structured condition that must be true for this step to execute. Prefer the `when` inline expression for simple comparisons.'),
  actions: z.array(ActionSchema).optional(),
  triggers: z.array(WorkflowTriggerSchema).optional().describe('Workflows to trigger from this step'),
  // --- unified step-kinds ---
  kind: z.enum(['technique', 'action', 'checkpoint', 'loop']).describe('Step-kind discriminator for the unified ordered-steps model. Required on every step.'),
  // kind:checkpoint — the checkpoint definition carried inline, at its concrete position in the sequence.
  message: z.string().optional().describe('kind:checkpoint — message presented to the user.'),
  options: z.array(CheckpointOptionSchema).optional().describe('kind:checkpoint — decision options with effects.'),
  defaultOption: z.string().optional().describe('kind:checkpoint — option auto-selected when autoAdvanceMs elapses.'),
  autoAdvanceMs: z.number().int().positive().optional().describe('kind:checkpoint — ms before auto-selecting defaultOption.'),
  blocking: z.boolean().optional().describe('kind:checkpoint — true requires explicit user selection (no auto-advance).'),
  // kind:loop — a compound step whose body is a nested ordered steps[] (renamed `type`→`loopType` to avoid clashing with Condition.type).
  loopType: z.enum(['forEach', 'while', 'doWhile']).optional().describe('kind:loop — iteration type.'),
  variable: z.string().optional().describe('kind:loop — current-item variable bound each iteration.'),
  over: z.string().optional().describe('kind:loop — collection expression iterated by a forEach loop.'),
  breakCondition: ConditionSchema.optional().describe('kind:loop — early-exit condition evaluated each iteration.'),
  maxIterations: z.number().int().positive().optional().describe('kind:loop — safety bound on iteration count.'),
  steps: z.array(z.lazy((): z.ZodTypeAny => StepSchema)).optional().describe('kind:loop — the loop body, a nested ordered list of steps.'),
}).superRefine((step, ctx) => {
  const issue = (message: string, path: string[] = []) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, message, path });
  // Every step needs a resolvable id: explicit, or derivable from a kind:technique ref.
  if (!step.id && !(step.kind === 'technique' && step.technique)) {
    issue('a step without a derivable technique id must declare an explicit id', ['id']);
  }
  // Per-kind required-field contract for the unified model.
  switch (step.kind) {
    case 'technique':
      if (step.technique === undefined) issue('a kind:technique step must declare `technique`', ['technique']);
      break;
    case 'checkpoint':
      if (!step.message) issue('a kind:checkpoint step must declare `message`', ['message']);
      if (!step.options || step.options.length === 0) issue('a kind:checkpoint step must declare at least one option', ['options']);
      break;
    case 'loop':
      if (!step.loopType) issue('a kind:loop step must declare `loopType`', ['loopType']);
      if (!step.steps) issue('a kind:loop step must declare a `steps` body', ['steps']);
      break;
    // 'action' carries no additional required field (its actions[] may be empty for marker steps).
  }
});
export type Step = z.infer<typeof StepSchema>;

/** The operation reference of a step's technique binding, whether bare-string or structured. */
export function techniqueName(technique: Step['technique']): string | undefined {
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
        if (!step.technique) {
          throw new Error(
            `Activity '${activity.id}': ${scopeLabel} has a step with neither an id nor a technique; control/action steps must declare an explicit id.`,
          );
        }
        step.id = defaultStepId(techniqueName(step.technique)!);
      }
      if (seen.has(step.id)) {
        throw new Error(
          `Activity '${activity.id}': ${scopeLabel} has duplicate resolved step id '${step.id}'` +
            (step.technique ? ` (from technique '${techniqueName(step.technique)}')` : '') +
            '; give the colliding step an explicit unique id.',
        );
      }
      seen.add(step.id);
      // A loop-kind step carries a nested body; validate it as its own independent scope.
      if (step.steps && step.steps.length > 0) {
        fillScope(step.steps, `loop '${step.id}' steps`);
      }
    }
  };

  // Top-level steps; fillScope recurses into each loop-kind step's nested body as its own scope.
  fillScope(activity.steps, 'top-level steps');
}

/**
 * Surface each step's resolved id in raw activity TOON before it is handed to a
 * worker. A step whose id was derived from its technique begins with the
 * `- technique:` field (the id line is absent); this inserts the derived
 * `id:` line (the technique's last `::` segment) ahead of it, preserving the
 * step's indentation, so a worker reading the activity sees the same id the
 * server resolves for `get_technique` and step-manifest validation.
 */
export function injectResolvedStepIds(rawToon: string): string {
  return rawToon.replace(
    /^(\s*)- technique:[ \t]*(.+)$/gm,
    (_match, indent: string, techniqueValue: string) => {
      const unquoted = techniqueValue.trim().replace(/^["']|["']$/g, '');
      const resolvedId = defaultStepId(unquoted);
      return `${indent}- id: ${resolvedId}\n${indent}  technique: ${techniqueValue}`;
    },
  );
}

// Checkpoint schema
export const CheckpointSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string().describe('Message to present to user at checkpoint'),
  condition: ConditionSchema.optional().describe('Condition that must be true before presenting this checkpoint. If false, the checkpoint is skipped.'),
  options: z.array(CheckpointOptionSchema).min(1),
  defaultOption: z.string().optional().describe('Option ID to auto-select when autoAdvanceMs elapses without user intervention'),
  autoAdvanceMs: z.number().int().positive().optional().describe('Milliseconds to wait before auto-selecting defaultOption'),
});
export type Checkpoint = z.infer<typeof CheckpointSchema>;

// Decision branch schema
export const DecisionBranchSchema = z.object({
  id: z.string(),
  label: z.string(),
  condition: ConditionSchema.optional(),
  transitionTo: z.string().optional().describe('Activity ID to transition to. Omit for terminal branches (workflow ends)'),
  isDefault: z.boolean().default(false),
});
export type DecisionBranch = z.infer<typeof DecisionBranchSchema>;

// Decision schema
export const DecisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  branches: z.array(DecisionBranchSchema).min(2),
});
export type Decision = z.infer<typeof DecisionSchema>;

// Loop schema
export const LoopSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['forEach', 'while', 'doWhile']),
  variable: z.string().optional(),
  over: z.string().optional(),
  condition: ConditionSchema.optional(),
  maxIterations: z.number().int().positive().default(100),
  description: z.string().optional().describe('Human-readable description of what this loop does'),
  breakCondition: ConditionSchema.optional(),
  steps: z.array(StepSchema).optional(),
  activities: z.array(z.string()).optional().describe('Activity IDs to execute in loop'),
});
export type Loop = z.infer<typeof LoopSchema>;

// Transition schema
export const TransitionSchema = z.object({
  to: z.string().describe('Activity ID to transition to'),
  condition: ConditionSchema.optional(),
  isDefault: z.boolean().default(false),
});
export type Transition = z.infer<typeof TransitionSchema>;

// Artifact schema — a SERVER-COMPUTED entry in the activity's synthesized artifact contract.
// Activities do NOT author artifacts[]; `get_activity` composes this list from the `## Outputs` of
// the techniques the activity's steps bind (each output's `#### artifact` filename). Hence just the
// id (the producing output's id) and name (the filename).
export const ArtifactSchema = z.object({
  id: z.string().describe('Identifier of the artifact (the producing technique output id).'),
  name: z.string().describe('Filename or template (supports {variable} substitution), from the technique output.'),
});
export type Artifact = z.infer<typeof ArtifactSchema>;

// Unified Activity schema
export const ActivitySchema = z.object({
  // Identity (required)
  id: z.string().describe('Unique identifier for the activity'),
  version: SemanticVersionSchema.describe('Semantic version of the activity'),
  name: z.string().describe('Human-readable activity name'),
  
  // Description (optional)
  description: z.string().optional().describe('Detailed description of the activity'),

  // Activity-wide techniques, referenced by `::` path. The server bundles them into get_activity.
  techniques: TechniquesReferenceSchema.optional(),

  // Execution — the single ordered list of kind-tagged steps (technique | action | checkpoint | loop).
  // Checkpoints are inline kind:checkpoint steps and loops are compound kind:loop steps: there are no
  // separate checkpoints[]/loops[] arrays in the unified model.
  steps: z.array(StepSchema).optional().describe('Ordered, kind-tagged execution steps for this activity'),

  // Activity-level routing (read by the orchestrator at the activity boundary, not part of the worker step sequence).
  decisions: z.array(DecisionSchema).optional().describe('Conditional branching points'),
  transitions: z.array(TransitionSchema).optional().describe('Navigation to other activities'),
  triggers: z.array(WorkflowTriggerSchema).optional().describe('Workflows to trigger from this activity'),

  // Metadata (optional)
  outcome: z.array(z.string()).optional().describe('Expected outcomes when activity completes successfully'),
  required: z.boolean().default(true).describe('Whether this activity is required in the workflow'),
  rules: z.array(z.string()).optional().describe('Activity-level rules and constraints that agents must follow'),
  artifactPrefix: z.string().optional().describe('Numeric prefix for artifact filenames, inferred from the activity filename (e.g., "02" from 02-design-philosophy.toon). Server-computed — do not set in TOON files.'),
  artifacts: z.array(ArtifactSchema).optional().describe('SERVER-COMPUTED — do NOT author. The activity\'s artifact contract, synthesized by get_activity from the `## Outputs` of the techniques its steps bind (the technique outputs own artifact identity, AP-43). Bare filenames are prefixed with artifactPrefix at write time.'),
});

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
      if (s.steps && s.steps.length) rec(s.steps as Step[]);
    }
  };
  rec(activity.steps);
  return out;
}

/**
 * The activity's checkpoint definitions: the inline kind:checkpoint steps, in document order. A
 * kind:checkpoint step carries its message/options/effects inline, so it maps directly to a
 * checkpoint definition (its id is the stable key used for checkpoint yield/respond/replay).
 */
export function activityCheckpoints(activity: Activity): Checkpoint[] {
  return flattenActivitySteps(activity)
    .filter((s) => s.kind === 'checkpoint' && !!s.id)
    .map((s) => ({
      id: s.id!,
      name: s.id!,
      message: s.message ?? '',
      options: s.options ?? [],
      defaultOption: s.defaultOption,
      autoAdvanceMs: s.autoAdvanceMs,
      condition: s.condition,
    }));
}
