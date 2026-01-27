import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';

const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
const TimeEstimateSchema = z.string().regex(/^\d+(-\d+)?\s*(m|min|h|hr|hours?|d|days?)?$/i).optional();

// Skills reference
export const SkillsReferenceSchema = z.object({
  primary: z.string().describe('Primary skill ID for this activity'),
  supporting: z.array(z.string()).optional().describe('Supporting skill IDs'),
});
export type SkillsReference = z.infer<typeof SkillsReferenceSchema>;

// Action schema
export const ActionSchema = z.object({
  action: z.enum(['log', 'validate', 'set', 'emit']),
  target: z.string().optional(),
  message: z.string().optional(),
  value: z.unknown().optional(),
});
export type Action = z.infer<typeof ActionSchema>;

// Step schema
export const StepSchema = z.object({
  id: z.string().describe('Unique identifier for this step'),
  name: z.string().describe('Human-readable step name'),
  description: z.string().optional().describe('Detailed guidance for executing this step'),
  skill: z.string().optional().describe('Skill ID to apply for this step'),
  required: z.boolean().default(true),
  actions: z.array(ActionSchema).optional(),
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
  prerequisite: z.string().optional().describe('Action to complete before presenting checkpoint'),
  options: z.array(CheckpointOptionSchema).min(1),
  required: z.boolean().default(true),
  blocking: z.literal(true).default(true),
});
export type Checkpoint = z.infer<typeof CheckpointSchema>;

// Decision branch schema
export const DecisionBranchSchema = z.object({
  id: z.string(),
  label: z.string(),
  condition: ConditionSchema.optional(),
  transitionTo: z.string().describe('Activity ID to transition to'),
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

// Workflow trigger schema - allows an activity to trigger another workflow
export const WorkflowTriggerSchema = z.object({
  workflow: z.string().describe('ID of the workflow to trigger'),
  description: z.string().optional().describe('Description of when/why this workflow is triggered'),
  passContext: z.array(z.string()).optional().describe('Context variables to pass to the triggered workflow'),
});
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;

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
  
  // Skills (required)
  skills: SkillsReferenceSchema,
  
  // Execution
  steps: z.array(StepSchema).optional().describe('Ordered execution steps for this activity'),
  
  // Control flow (optional)
  checkpoints: z.array(CheckpointSchema).optional().describe('Blocking user decision points'),
  decisions: z.array(DecisionSchema).optional().describe('Conditional branching points'),
  loops: z.array(LoopSchema).optional().describe('Iteration constructs'),
  transitions: z.array(TransitionSchema).optional().describe('Navigation to other activities'),
  triggers: WorkflowTriggerSchema.optional().describe('Workflow to trigger from this activity'),
  
  // Lifecycle (optional)
  entryActions: z.array(ActionSchema).optional().describe('Actions to execute when entering activity'),
  exitActions: z.array(ActionSchema).optional().describe('Actions to execute when exiting activity'),
  
  // Metadata (optional)
  outcome: z.array(z.string()).optional().describe('Expected outcomes when activity completes successfully'),
  context_to_preserve: z.array(z.string()).optional().describe('Context items to preserve across the activity'),
  required: z.boolean().default(true).describe('Whether this activity is required in the workflow'),
  estimatedTime: TimeEstimateSchema.describe('Estimated time to complete'),
  notes: z.array(z.string()).optional().describe('Additional notes or caveats'),
}).passthrough();

export type Activity = z.infer<typeof ActivitySchema>;

export function validateActivity(data: unknown): Activity { return ActivitySchema.parse(data); }
export function safeValidateActivity(data: unknown) { return ActivitySchema.safeParse(data); }
