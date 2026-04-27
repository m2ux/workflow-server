import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';
import { SemanticVersionSchema } from './common.js';

const TimeEstimateSchema = z.string().regex(/^\d+(-\d+)?\s*(m|min|h|hr|hours?|d|days?)?$/i).optional();

// Skills reference (activity-level — optional when steps declare their own skills)
export const SkillsReferenceSchema = z.object({
  primary: z.string().optional().describe('Primary skill ID for this activity. Optional when steps declare individual skills.'),
  supporting: z.array(z.string()).optional().describe('Supporting skill IDs'),
});
export type SkillsReference = z.infer<typeof SkillsReferenceSchema>;

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
  id: z.string().describe('Unique identifier for this step'),
  name: z.string().describe('Human-readable step name'),
  description: z.string().optional().describe('Detailed guidance for executing this step'),
  skill: z.string().optional().describe('LEGACY: Skill ID to apply for this step. Prefer the operation field.'),
  operation: z.string().optional().describe('Operation reference in skill-id::operation-name form (e.g., workflow-orchestrator::evaluate-transition). Operations are loaded via resolve_operations.'),
  checkpoint: z.string().optional().describe('Optional checkpoint ID. If present, the worker MUST yield this checkpoint to the orchestrator before executing the step.'),
  required: z.boolean().default(true),
  condition: ConditionSchema.optional().describe('Condition that must be true for this step to execute'),
  actions: z.array(ActionSchema).optional(),
  triggers: z.array(WorkflowTriggerSchema).optional().describe('Workflows to trigger from this step'),
  skill_args: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().describe('LEGACY: Arguments to pass to the skill. Prefer args.'),
  args: z.record(z.unknown()).optional().describe('Arguments to pass to the operation when executing this step'),
});
export type Step = z.infer<typeof StepSchema>;

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
  recognition: z.array(z.string()).optional().describe('Patterns to match user intent to this activity'),
  
  // Skills (LEGACY — primary/supporting model). Optional. Prefer skill_operations.
  skills: SkillsReferenceSchema.optional(),

  // Skill operations (NEW — flat array of skill-id::operation-name refs the activity uses)
  skill_operations: z.array(z.string()).optional().describe('Flat array of skill-id::operation-name (or skill-id::rule-name) references the activity uses. Resolved via resolve_operations.'),

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
  estimatedTime: TimeEstimateSchema.describe('Estimated time to complete'),
  rules: z.array(z.string()).optional().describe('Activity-level rules and constraints that agents must follow'),
  artifactPrefix: z.string().optional().describe('Numeric prefix for artifact filenames, inferred from the activity filename (e.g., "02" from 02-design-philosophy.toon). Server-computed — do not set in TOON files.'),
  artifacts: z.array(ArtifactSchema).optional().describe('Output artifacts produced by this activity. Bare filenames are prefixed with artifactPrefix at write time (e.g., design-philosophy.md → 02-design-philosophy.md).'),
});

export type Activity = z.infer<typeof ActivitySchema>;

export function validateActivity(data: unknown): Activity { return ActivitySchema.parse(data); }
export function safeValidateActivity(data: unknown) { return ActivitySchema.safeParse(data); }
