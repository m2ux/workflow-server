import { z } from 'zod';

const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const ToolDefinitionSchema = z.object({
  when: z.string().optional(),
  params: z.string().optional(),
  returns: z.string().optional(),
  next: z.string().optional(),
  action: z.string().optional(),
  usage: z.string().optional(),
  preserve: z.array(z.string()).optional(),
}).passthrough();
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

export const ErrorDefinitionSchema = z.object({
  cause: z.string().optional(),
  recovery: z.string().optional(),
  detection: z.string().optional(),
  resolution: z.array(z.string()).optional(),
  note: z.string().optional(),
}).passthrough();
export type ErrorDefinition = z.infer<typeof ErrorDefinitionSchema>;

export const ExecutionPatternSchema = z.object({
  start: z.array(z.string()).optional(),
  bootstrap: z.array(z.string()).optional(),
  per_activity: z.array(z.string()).optional(),
  skill_loading: z.array(z.string()).optional(),
  discovery: z.array(z.string()).optional(),
  transitions: z.array(z.string()).optional(),
  artifacts: z.array(z.string()).optional(),
}).passthrough();
export type ExecutionPattern = z.infer<typeof ExecutionPatternSchema>;

export const ArchitectureSchema = z.object({
  principle: z.string().optional(),
  layers: z.array(z.string()).optional(),
  gap_detection: z.string().optional(),
}).passthrough();
export type Architecture = z.infer<typeof ArchitectureSchema>;

export const MatchingSchema = z.object({
  quick_match: z.string().optional(),
  fallback: z.string().optional(),
  ambiguous: z.string().optional(),
  never: z.string().optional(),
}).passthrough();
export type Matching = z.infer<typeof MatchingSchema>;

export const StateStructureSchema = z.record(z.string());
export type StateStructure = z.infer<typeof StateStructureSchema>;

export const StateDefinitionSchema = z.object({
  format: z.string().optional(),
  structure: StateStructureSchema.optional(),
  initialize: z.string().optional(),
  update_on: z.record(z.string()).optional(),
  checkpoint_response_format: z.object({}).passthrough().optional(),
  decision_outcome_format: z.object({}).passthrough().optional(),
}).passthrough();
export type StateDefinition = z.infer<typeof StateDefinitionSchema>;

export const InterpretationSchema = z.object({
  transitions: z.string().optional(),
  checkpoints: z.string().optional(),
  decisions: z.string().optional(),
  loops: z.string().optional(),
  resources: z.string().optional(),
  templates: z.string().optional(),
}).passthrough();
export type Interpretation = z.infer<typeof InterpretationSchema>;

export const NumericFormatSchema = z.object({
  description: z.string().optional(),
  examples: z.record(z.string()).optional(),
}).passthrough();
export type NumericFormat = z.infer<typeof NumericFormatSchema>;

export const InitializationSchema = z.object({
  trigger: z.string().optional(),
  state: z.object({}).passthrough().optional(),
}).passthrough();
export type Initialization = z.infer<typeof InitializationSchema>;

export const UpdatePatternSchema = z.object({
  trigger: z.string().optional(),
  actions: z.array(z.string()).optional(),
}).passthrough();
export type UpdatePattern = z.infer<typeof UpdatePatternSchema>;

export const ResumptionSchema = z.object({
  description: z.string().optional(),
  steps: z.array(z.string()).optional(),
  note: z.string().optional(),
}).passthrough();
export type Resumption = z.infer<typeof ResumptionSchema>;

export const InputItemDefinitionSchema = z.object({
  id: z.string().describe('Stable identifier for this input (hyphen-delimited, matching protocol step id style). Used to bind to an output or supply from context when chaining skills.'),
  description: z.string().optional().describe('Human-readable description of this input'),
  required: z.boolean().optional().describe('Whether this input must be supplied'),
  default: z.unknown().optional().describe('Default value when not supplied'),
}).passthrough();
export type InputItemDefinition = z.infer<typeof InputItemDefinitionSchema>;

export const ProtocolStepSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
}).passthrough();
export type ProtocolStep = z.infer<typeof ProtocolStepSchema>;

export const InputsDefinitionSchema = z.array(InputItemDefinitionSchema).describe('Inputs the skill expects from context: array of named items (mirrors output structure for deterministic binding)');
export type InputsDefinition = z.infer<typeof InputsDefinitionSchema>;

/** Phase- or step-keyed procedure: each key is the step/phase name; each value is an ordered array of imperative bullets. No description in protocol — use the skill-level description. */
export const ProtocolDefinitionSchema = z.object({}).catchall(z.array(z.string()).describe('Ordered list of imperative bullets for this step or phase.'));
export type ProtocolDefinition = z.infer<typeof ProtocolDefinitionSchema>;

/** Flat name-value rules: each key is a rule name; each value is a single rule string. */
export const RulesDefinitionSchema = z.record(z.string().describe('Rule text for this rule name.'));
export type RulesDefinition = z.infer<typeof RulesDefinitionSchema>;

export const OutputComponentsDefinitionSchema = z.record(z.string()).describe('Named output components: each key is a component id, value is the spec or description for that component');
export type OutputComponentsDefinition = z.infer<typeof OutputComponentsDefinitionSchema>;

export const OutputArtifactSchema = z.object({
  name: z.string().describe('Artifact filename when this output is persisted (e.g. 01-audit-report.md).'),
}).passthrough();
export type OutputArtifact = z.infer<typeof OutputArtifactSchema>;

export const OutputItemDefinitionSchema = z.object({
  id: z.string().describe('Stable generic identifier for this output (hyphen-delimited, matching protocol step id style). Used when referencing as an input or elsewhere. Not a filename.'),
  description: z.string().optional().describe('Human-readable description of this output'),
  components: OutputComponentsDefinitionSchema.optional(),
  artifact: OutputArtifactSchema.optional().describe('Optional. When populated, specifies the artifact name to create when persisting this output.'),
}).passthrough();
export type OutputItemDefinition = z.infer<typeof OutputItemDefinitionSchema>;

export const OutputDefinitionSchema = z.array(OutputItemDefinitionSchema).describe('What the skill produces: one or more outputs, each with required id (hyphen-delimited) and optional description and components');
export type OutputDefinition = z.infer<typeof OutputDefinitionSchema>;

export const SkillSchema = z.object({
  id: z.string(),
  version: SemanticVersionSchema,
  capability: z.string(),
  description: z.string().optional(),
  architecture: ArchitectureSchema.optional(),
  tools: z.record(ToolDefinitionSchema).optional(),
  flow: z.array(z.string()).optional(),
  matching: MatchingSchema.optional(),
  state: StateDefinitionSchema.optional(),
  state_structure: StateStructureSchema.optional(),
  numeric_format: NumericFormatSchema.optional(),
  initialization: InitializationSchema.optional(),
  update_patterns: z.record(UpdatePatternSchema).optional(),
  checkpoint_response_format: z.object({}).passthrough().optional(),
  decision_outcome_format: z.object({}).passthrough().optional(),
  history_event_types: z.object({}).passthrough().optional(),
  history_entry_format: z.object({}).passthrough().optional(),
  status_values: z.record(z.string()).optional(),
  interpretation: InterpretationSchema.optional(),
  resumption: ResumptionSchema.optional(),
  rules: RulesDefinitionSchema.optional(),
  errors: z.record(ErrorDefinitionSchema).optional(),
  inputs: InputsDefinitionSchema.optional(),
  protocol: ProtocolDefinitionSchema.optional(),
  output: OutputDefinitionSchema.optional(),
  resources: z.array(z.string()).optional().describe('Resource indices or IDs this skill depends on (e.g. 02, 04, 08)'),
}).passthrough();
export type Skill = z.infer<typeof SkillSchema>;

export function validateSkill(data: unknown): Skill { return SkillSchema.parse(data); }
export function safeValidateSkill(data: unknown) { return SkillSchema.safeParse(data); }
