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

// Artifact location - accepts string shorthand (path only) or full object
const ArtifactLocationObjectSchema = z.object({
  path: z.string().describe('Path pattern for this location. Supports workflow variable interpolation (e.g., \'{planning_folder_path}\')'),
  description: z.string().optional().describe('Description of what artifacts this location stores'),
  gitignored: z.boolean().default(false).describe('Whether artifacts in this location are gitignored from the host project'),
});

const ArtifactLocationValueSchema = z.union([
  z.string().transform((path) => ({ path, gitignored: false as boolean, description: undefined as string | undefined })),
  ArtifactLocationObjectSchema,
]).describe('Artifact location: path string or { path, description?, gitignored? } object');

export type ArtifactLocation = z.infer<typeof ArtifactLocationObjectSchema>;

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
  artifactLocations: z.record(ArtifactLocationValueSchema).optional().describe('Named artifact storage locations. Keys are location identifiers referenced by activity artifact definitions.'),
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
  type ModeOverride,
} from './activity.schema.js';
