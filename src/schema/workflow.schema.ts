import { z } from 'zod';
import { ActivitySchema } from './activity.schema.js';
import { SemanticVersionSchema } from './common.js';

export const VariableDefinitionSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
  required: z.boolean().default(false),
});
export type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;

// Artifact location - accepts string shorthand (path only) or full object
// Mode schema - defines workflow execution modes that modify standard behavior
export const ModeSchema = z.object({
  id: z.string().describe('Unique identifier for this mode'),
  name: z.string().describe('Human-readable mode name'),
  description: z.string().optional().describe('Detailed description of mode behavior'),
  activationVariable: z.string().describe('Variable name that activates this mode when true'),
  recognition: z.array(z.string()).optional().describe('Patterns to detect mode activation from user intent'),
  skipActivities: z.array(z.string()).optional().describe('Activity IDs to skip entirely in this mode'),
  defaults: z.record(z.unknown()).optional().describe('Default variable values when mode is active'),
  resource: z.string().optional().describe('Path to resource file with detailed mode guidance'),
});
export type Mode = z.infer<typeof ModeSchema>;

export const WorkflowTechniquesSchema = z.object({
  primary: z.string().optional().describe('Primary technique ID for this workflow.'),
  supporting: z.array(z.string()).optional().describe('Supporting technique references (`::` paths) the workflow uses at the orchestrator level; bundled into get_workflow alongside the core orchestrator techniques.'),
});
export type WorkflowTechniquesReference = z.infer<typeof WorkflowTechniquesSchema>;

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
  modes: z.array(ModeSchema).optional().describe('Execution modes that modify standard workflow behavior'),
  techniques: WorkflowTechniquesSchema.optional().describe('Workflow-level techniques (primary + supporting) the orchestrator uses; bundled into get_workflow.'),
  initialActivity: z.string().optional().describe('ID of the first activity to execute. Required for sequential workflows, optional when all activities are independent entry points.'),
  // JSON Schema validates individual TOON files where activities are separate files.
  // Zod validates the full assembled runtime workflow object, so activities are included here.
  // The shorthand string references are resolved into fully typed Activity objects during load,
  // but we allow strings in the intermediate raw schema before transformation.
  // However, the final Workflow type expects Activity[] to avoid type errors across the codebase.
  activities: z.array(ActivitySchema).min(1).optional().describe('Activities that comprise this workflow. Activities with transitions form sequences; activities without transitions are independent entry points. Omitted in TOON files where activities are separate files.'),
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
  type TechniquesReference,
} from './activity.schema.js';
