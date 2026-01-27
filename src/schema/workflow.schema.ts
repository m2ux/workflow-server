import { z } from 'zod';
import { ActivitySchema } from './activity.schema.js';

const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

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
  id: z.string().describe('Unique workflow identifier'),
  version: SemanticVersionSchema.describe('Semantic version'),
  title: z.string().describe('Human-readable workflow title'),
  description: z.string().optional().describe('Detailed workflow description'),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional().describe('Rules that govern workflow execution'),
  variables: z.array(VariableDefinitionSchema).optional().describe('Workflow-level variables'),
  initialActivity: z.string().optional().describe('ID of the first activity to execute. Required for sequential workflows, optional when all activities are independent entry points.'),
  activities: z.array(ActivitySchema).min(1).describe('Activities that comprise this workflow. Activities with transitions form sequences; activities without transitions are independent entry points.'),
});
export type Workflow = z.infer<typeof WorkflowSchema>;

export function validateWorkflow(data: unknown): Workflow { return WorkflowSchema.parse(data); }
export function safeValidateWorkflow(data: unknown) { return WorkflowSchema.safeParse(data); }

// Re-export activity types for convenience
export { 
  type Activity,
  type Step,
  type Checkpoint,
  type CheckpointOption,
  type Decision,
  type DecisionBranch,
  type Loop,
  type Transition,
  type Action,
  type SkillsReference,
} from './activity.schema.js';
