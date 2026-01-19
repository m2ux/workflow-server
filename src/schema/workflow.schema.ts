import { z } from 'zod';
import { ConditionSchema } from './condition.schema.js';

const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
const TimeEstimateSchema = z.string().regex(/^\d+(-\d+)?\s*(m|min|h|hr|hours?|d|days?)?$/i).optional();

export const ActionSchema = z.object({
  action: z.enum(['log', 'validate', 'set', 'emit']),
  target: z.string().optional(),
  message: z.string().optional(),
  value: z.unknown().optional(),
});
export type Action = z.infer<typeof ActionSchema>;

export const GuideReferenceSchema = z.object({
  path: z.string(),
  section: z.string().optional(),
  title: z.string().optional(),
});
export type GuideReference = z.infer<typeof GuideReferenceSchema>;

export const StepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  guide: GuideReferenceSchema.optional(),
  required: z.boolean().default(true),
  actions: z.array(ActionSchema).optional(),
});
export type Step = z.infer<typeof StepSchema>;

export const CheckpointOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  effect: z.object({
    setVariable: z.record(z.unknown()).optional(),
    transitionTo: z.string().optional(),
    skipPhases: z.array(z.string()).optional(),
  }).optional(),
});
export type CheckpointOption = z.infer<typeof CheckpointOptionSchema>;

export const CheckpointSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),
  guide: GuideReferenceSchema.optional(),
  options: z.array(CheckpointOptionSchema).min(1),
  required: z.boolean().default(true),
  blocking: z.literal(true).default(true),
});
export type Checkpoint = z.infer<typeof CheckpointSchema>;

export const DecisionBranchSchema = z.object({
  id: z.string(),
  label: z.string(),
  condition: ConditionSchema.optional(),
  transitionTo: z.string(),
  isDefault: z.boolean().default(false),
});
export type DecisionBranch = z.infer<typeof DecisionBranchSchema>;

export const DecisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  guide: GuideReferenceSchema.optional(),
  branches: z.array(DecisionBranchSchema).min(2),
});
export type Decision = z.infer<typeof DecisionSchema>;

export const TransitionSchema = z.object({
  to: z.string(),
  condition: ConditionSchema.optional(),
  isDefault: z.boolean().default(false),
});
export type Transition = z.infer<typeof TransitionSchema>;

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
  phases: z.array(z.string()).optional(),
});
export type Loop = z.infer<typeof LoopSchema>;

export const PhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(true),
  estimatedTime: TimeEstimateSchema,
  guide: GuideReferenceSchema.optional(),
  entryActions: z.array(ActionSchema).optional(),
  exitActions: z.array(ActionSchema).optional(),
  steps: z.array(StepSchema).optional(),
  checkpoints: z.array(CheckpointSchema).optional(),
  decisions: z.array(DecisionSchema).optional(),
  loops: z.array(LoopSchema).optional(),
  transitions: z.array(TransitionSchema).optional(),
});
export type Phase = z.infer<typeof PhaseSchema>;

export const VariableDefinitionSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
  required: z.boolean().default(false),
});
export type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;

export const WorkflowSchema = z.object({
  $schema: z.string().optional(),
  id: z.string(),
  version: SemanticVersionSchema,
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  variables: z.array(VariableDefinitionSchema).optional(),
  initialPhase: z.string(),
  phases: z.array(PhaseSchema).min(1),
});
export type Workflow = z.infer<typeof WorkflowSchema>;

export function validateWorkflow(data: unknown): Workflow { return WorkflowSchema.parse(data); }
export function safeValidateWorkflow(data: unknown) { return WorkflowSchema.safeParse(data); }
