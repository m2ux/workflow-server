import { z } from 'zod';
import { ActivitySchema } from './activity.schema.js';
import { SemanticVersionSchema } from './common.js';
import { EXEMPT_DATA_IDS, QUALIFIED_DATA_ID_PATTERN } from './identifiers.js';

// A variable name is a qualified snake_case noun phrase (AP-60: >=2 words, e.g.
// `analysis_target`, never bare `target`), or one of the enumerated bare-word exemptions.
export const VariableNameSchema = z.union([
  z.string().regex(QUALIFIED_DATA_ID_PATTERN, 'a variable name is a qualified snake_case noun phrase (>=2 words, AP-60), e.g. `analysis_target`'),
  z.enum(EXEMPT_DATA_IDS),
]).describe('Qualified snake_case noun phrase (>=2 words, AP-60), or an enumerated bare-word exemption.');

export const VariableDefinitionSchema = z.object({
  name: VariableNameSchema,
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']).describe('Declared type. The server validates checkpoint setVariable values against it, warn-only: a mismatch is stored as written and surfaced in _meta.validation and on the variable_set history event. Agents honor it for their own writes.'),
  description: z.string().optional(),
  defaultValue: z.unknown().optional().describe('Initial value the server seeds into the session variable bag at session creation (start_session fresh sessions and dispatch_child children), recorded as one variables_seeded history event. Do not gate a defaulted variable with exists/notExists — seeding makes the gate constant (check:variable-model enforces this).'),
  required: z.boolean().default(false).describe('Authoring metadata; the server does not check that the variable is ever set.'),
});
export type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;

// Workflow techniques, partitioned by AUDIENCE (mirrors WorkflowRulesSchema). `workflow` techniques
// are the orchestrator's, bundled into get_workflow alongside the core orchestrator techniques.
// `activity` techniques are inherited by EVERY activity: the server injects them into every
// get_activity technique bundle, so a technique common to all activities (e.g. variable-binding) is
// declared once here instead of duplicated on each activity's own `techniques[]`.
export const WorkflowTechniquesSchema = z.object({
  workflow: z.array(z.string()).optional().describe('Orchestrator-level technique references (`::` paths); bundled into get_workflow alongside the core orchestrator techniques.'),
  activity: z.array(z.string()).optional().describe('Technique references inherited by every activity; injected into every get_activity technique bundle.'),
});
export type WorkflowTechniquesReference = z.infer<typeof WorkflowTechniquesSchema>;

// Workflow rules, partitioned by AUDIENCE. `workflow` rules govern orchestration (dispatch,
// transitions, output forwarding) and are surfaced only to the orchestrator via get_workflow.
// `activity` rules are worker-facing and inherited by EVERY activity: the server injects them into
// every get_activity response so a worker dispatched for a single activity always receives them.
// `universal` rules are dual-audience — the same directive both roles must follow — and reach BOTH
// contexts (surfaced in get_workflow AND injected into every get_activity).
export const WorkflowRulesSchema = z.object({
  workflow: z.array(z.string()).optional().describe('Orchestrator-only rules governing workflow execution; surfaced in get_workflow.'),
  activity: z.array(z.string()).optional().describe('Worker-facing rules inherited by every activity; injected into every get_activity response.'),
  universal: z.array(z.string()).optional().describe('Dual-audience rules both roles must follow; surfaced in get_workflow AND injected into every get_activity.'),
});
export type WorkflowRules = z.infer<typeof WorkflowRulesSchema>;

export const WorkflowSchema = z.object({
  $schema: z.string().optional(),
  id: z.string().describe('Unique workflow identifier'),
  version: SemanticVersionSchema.describe('Semantic version'),
  title: z.string().describe('Human-readable workflow title'),
  description: z.string().optional().describe('Detailed workflow description'),
  author: z.string().optional().describe('Author metadata; not read by the server.'),
  tags: z.array(z.string()).optional(),
  rules: WorkflowRulesSchema.optional().describe('Workflow rules partitioned by audience: `workflow` (orchestrator-only) and `activity` (inherited by every activity, injected into get_activity).'),
  variables: z.array(VariableDefinitionSchema).optional().describe('Workflow-level variable declarations, rendered in get_workflow for agents. The session variable bag is seeded from each declaration\'s defaultValue at session creation; thereafter the server writes it only through checkpoint setVariable effects.'),
  techniques: WorkflowTechniquesSchema.optional().describe('Workflow techniques partitioned by audience: `workflow` (orchestrator, bundled into get_workflow) and `activity` (inherited by every activity, injected into get_activity).'),
  initialActivity: z.string().optional().describe('ID of the first activity to execute. Required for sequential workflows, optional when all activities are independent entry points.'),
  // JSON Schema validates individual definition files where activities are separate files.
  // Zod validates the full assembled runtime workflow object, so activities are included here.
  // The shorthand string references are resolved into fully typed Activity objects during load,
  // but we allow strings in the intermediate raw schema before transformation.
  // However, the final Workflow type expects Activity[] to avoid type errors across the codebase.
  activities: z.array(ActivitySchema).min(1).optional().describe('Activities that comprise this workflow. Activities with transitions form sequences; activities without transitions are independent entry points. Omitted in definition files where activities are separate files.'),
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
  type Transition,
  type Action,
  type TechniquesReference,
} from './activity.schema.js';
