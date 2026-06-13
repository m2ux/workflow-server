import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';
import { SemanticVersionSchema } from './common.js';

// Techniques reference (activity-level — optional when steps declare their own techniques)
export const TechniquesReferenceSchema = z.object({
  primary: z.string().optional().describe('Primary technique ID for this activity. Optional when steps declare individual techniques.'),
  supporting: z.array(z.string()).optional().describe('Supporting technique IDs'),
});
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

// Step schema
export const StepSchema = z.object({
  id: z.string().optional().describe('Identifier for this step within the activity. Optional when `technique` is present — the loader derives it from the last `::` segment of the technique. A step with no technique must declare an explicit id.'),
  description: z.string().optional().describe('Detailed guidance for executing this step. May carry a deprecated inline operation invocation of the form `technique-id::operation-name(arg: {var}, ...)`; the canonical binding is the `technique` field.'),
  technique: z.string().optional().describe('Canonical per-step binding: the `group::operation` technique reference this step invokes.'),
  checkpoint: z.string().optional().describe('Optional checkpoint ID. If present, the worker MUST yield this checkpoint to the orchestrator before executing the step.'),
  required: z.boolean().default(true),
  when: z.string().optional().describe('Inline boolean expression that gates this step. Examples: "has_saved_state == true", "is_monorepo == true", "client_workflow_completed == false". Evaluated against current variable state at runtime.'),
  condition: ConditionSchema.optional().describe('LEGACY: Structured condition that must be true for this step to execute. Prefer the `when` inline expression for simple comparisons.'),
  actions: z.array(ActionSchema).optional(),
  triggers: z.array(WorkflowTriggerSchema).optional().describe('Workflows to trigger from this step'),
  technique_args: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().describe('Canonical per-step deviation map: arguments passed to the bound technique.'),
}).superRefine((step, ctx) => {
  if (!step.id && !step.technique) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'a step without a technique must declare an explicit id',
      path: ['id'],
    });
  }
});
export type Step = z.infer<typeof StepSchema>;

/** Derive the default step id from a technique ref: the last `::` segment. */
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
        step.id = defaultStepId(step.technique);
      }
      if (seen.has(step.id)) {
        throw new Error(
          `Activity '${activity.id}': ${scopeLabel} has duplicate resolved step id '${step.id}'` +
            (step.technique ? ` (from technique '${step.technique}')` : '') +
            '; give the colliding step an explicit unique id.',
        );
      }
      seen.add(step.id);
    }
  };

  fillScope(activity.steps, 'top-level steps');
  if (activity.loops) {
    for (const loop of activity.loops) {
      fillScope(loop.steps, `loop '${loop.id}' steps`);
    }
  }
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

// Checkpoint option schema
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

// Artifact schema - defines outputs produced by an activity
export const ArtifactSchema = z.object({
  id: z.string().describe('Unique identifier for the artifact'),
  name: z.string().describe('Filename or template (supports {variable} substitution)'),
  location: z.string().optional().describe('Location category (e.g., planning, docs)'),
  description: z.string().optional().describe('Purpose of the artifact'),
  action: z.enum(['create', 'update']).default('create').optional().describe('Whether this activity creates a new artifact or updates an existing one'),
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
  
  // Intent matching (optional - for entry-point activities)
  problem: z.string().optional().describe('Description of the user problem this activity addresses'),

  // Techniques the activity uses: a primary technique and supporting techniques, referenced by
  // `::` path. The server bundles them into get_activity.
  techniques: TechniquesReferenceSchema.optional(),

  // Execution
  steps: z.array(StepSchema).optional().describe('Ordered execution steps for this activity'),
  
  // Control flow (optional)
  checkpoints: z.array(CheckpointSchema).optional().describe('User decision points'),
  decisions: z.array(DecisionSchema).optional().describe('Conditional branching points'),
  loops: z.array(LoopSchema).optional().describe('Iteration constructs'),
  transitions: z.array(TransitionSchema).optional().describe('Navigation to other activities'),
  triggers: z.array(WorkflowTriggerSchema).optional().describe('Workflows to trigger from this activity'),
  
  // Lifecycle (optional)
  entryActions: z.array(ActionSchema).optional().describe('Actions to execute when entering activity'),
  exitActions: z.array(ActionSchema).optional().describe('Actions to execute when exiting activity'),
  
  // Metadata (optional)
  outcome: z.array(z.string()).optional().describe('Expected outcomes when activity completes successfully'),
  context_to_preserve: z.array(z.string()).optional().describe('Context items to preserve across the activity'),
  required: z.boolean().default(true).describe('Whether this activity is required in the workflow'),
  rules: z.array(z.string()).optional().describe('Activity-level rules and constraints that agents must follow'),
  artifactPrefix: z.string().optional().describe('Numeric prefix for artifact filenames, inferred from the activity filename (e.g., "02" from 02-design-philosophy.toon). Server-computed — do not set in TOON files.'),
  artifacts: z.array(ArtifactSchema).optional().describe('Output artifacts produced by this activity. Bare filenames are prefixed with artifactPrefix at write time (e.g., design-philosophy.md → 02-design-philosophy.md).'),
});

export type Activity = z.infer<typeof ActivitySchema>;

export function validateActivity(data: unknown): Activity { return ActivitySchema.parse(data); }
export function safeValidateActivity(data: unknown) { return ActivitySchema.safeParse(data); }
