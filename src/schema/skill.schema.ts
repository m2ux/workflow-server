import { z } from 'zod';
import { SemanticVersionSchema } from './common.js';

export const ToolDefinitionSchema = z.object({
  when: z.string().optional(),
  params: z.string().optional(),
  returns: z.string().optional(),
  next: z.string().optional(),
  action: z.string().optional(),
  usage: z.string().optional(),
  preserve: z.array(z.string()).optional(),
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

export const ErrorDefinitionSchema = z.object({
  cause: z.string().optional(),
  recovery: z.string().optional(),
  detection: z.string().optional(),
  resolution: z.array(z.string()).optional(),
  note: z.string().optional(),
});
export type ErrorDefinition = z.infer<typeof ErrorDefinitionSchema>;

export const ArchitectureSchema = z.object({
  principle: z.string().optional(),
  layers: z.array(z.string()).optional(),
  gap_detection: z.string().optional(),
});
export type Architecture = z.infer<typeof ArchitectureSchema>;

export const MatchingSchema = z.object({
  quick_match: z.string().optional(),
  fallback: z.string().optional(),
  ambiguous: z.string().optional(),
  never: z.string().optional(),
});
export type Matching = z.infer<typeof MatchingSchema>;

export const StateStructureSchema = z.record(z.string());
export type StateStructure = z.infer<typeof StateStructureSchema>;

export const StateDefinitionSchema = z.object({
  format: z.string().optional(),
  structure: StateStructureSchema.optional(),
  initialize: z.string().optional(),
  update_on: z.record(z.string()).optional(),
  checkpoint_response_format: z.record(z.unknown()).optional(),
  decision_outcome_format: z.record(z.unknown()).optional(),
});
export type StateDefinition = z.infer<typeof StateDefinitionSchema>;

export const InterpretationSchema = z.object({
  transitions: z.string().optional(),
  checkpoints: z.string().optional(),
  decisions: z.string().optional(),
  loops: z.string().optional(),
  resources: z.string().optional(),
  templates: z.string().optional(),
});
export type Interpretation = z.infer<typeof InterpretationSchema>;

export const NumericFormatSchema = z.object({
  description: z.string().optional(),
  examples: z.record(z.string()).optional(),
});
export type NumericFormat = z.infer<typeof NumericFormatSchema>;

export const InitializationSchema = z.object({
  trigger: z.string().optional(),
  state: z.record(z.unknown()).optional(),
});
export type Initialization = z.infer<typeof InitializationSchema>;

export const UpdatePatternSchema = z.object({
  trigger: z.string().optional(),
  actions: z.array(z.string()).optional(),
});
export type UpdatePattern = z.infer<typeof UpdatePatternSchema>;

export const ResumptionSchema = z.object({
  description: z.string().optional(),
  steps: z.array(z.string()).optional(),
  note: z.string().optional(),
});
export type Resumption = z.infer<typeof ResumptionSchema>;

export const InputItemDefinitionSchema = z.object({
  id: z.string().describe('Stable identifier for this input (hyphen-delimited, matching protocol step id style). Used to bind to an output or supply from context when chaining skills.'),
  description: z.string().optional().describe('Human-readable description of this input'),
  required: z.boolean().default(true).describe('Whether this input must be supplied. Defaults to true — only set to false for optional inputs.'),
  default: z.unknown().optional().describe('Default value when not supplied'),
});
export type InputItemDefinition = z.infer<typeof InputItemDefinitionSchema>;

export const ProtocolStepSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});
export type ProtocolStep = z.infer<typeof ProtocolStepSchema>;

export const InputsDefinitionSchema = z.array(InputItemDefinitionSchema).describe('Inputs the skill expects from context: array of named items (mirrors output structure for deterministic binding)');
export type InputsDefinition = z.infer<typeof InputsDefinitionSchema>;

/** Phase- or step-keyed procedure: each key is the step/phase name; each value is an ordered array of imperative bullets. No description in protocol — use the skill-level description. */
export const ProtocolDefinitionSchema = z.object({}).catchall(z.array(z.string()).describe('Ordered list of imperative bullets for this step or phase.'));
export type ProtocolDefinition = z.infer<typeof ProtocolDefinitionSchema>;

/** Named rules: each key is a rule name or group; each value is a single rule string or an array of related rules. */
export const RulesDefinitionSchema = z.record(z.union([
  z.string().describe('Single rule text.'),
  z.array(z.string()).describe('Array of related rules grouped under this key.'),
]));
export type RulesDefinition = z.infer<typeof RulesDefinitionSchema>;

export const OutputComponentsDefinitionSchema = z.record(z.string()).describe('Named output components: each key is a component id, value is the spec or description for that component');
export type OutputComponentsDefinition = z.infer<typeof OutputComponentsDefinitionSchema>;

export const OutputArtifactSchema = z.object({
  name: z.string().describe('Artifact filename when this output is persisted (e.g. 01-audit-report.md).'),
  action: z.enum(['create', 'update']).default('create').optional().describe('Whether this output creates a new artifact or updates an existing one'),
});
export type OutputArtifact = z.infer<typeof OutputArtifactSchema>;

export const OutputItemDefinitionSchema = z.object({
  id: z.string().describe('Stable generic identifier for this output (hyphen-delimited, matching protocol step id style). Used when referencing as an input or elsewhere. Not a filename.'),
  description: z.string().optional().describe('Human-readable description of this output'),
  components: OutputComponentsDefinitionSchema.optional(),
  artifact: OutputArtifactSchema.optional().describe('Optional. When populated, specifies the artifact name to create when persisting this output.'),
});
export type OutputItemDefinition = z.infer<typeof OutputItemDefinitionSchema>;

export const OutputDefinitionSchema = z.array(OutputItemDefinitionSchema).describe('What the skill produces: one or more outputs, each with required id (hyphen-delimited) and optional description and components');
export type OutputDefinition = z.infer<typeof OutputDefinitionSchema>;

/** Operation definition: a named operation with description, inputs, output, procedure, tools, and optional harness-specific implementations and freeform prose. */
export const OperationInputSchema = z.object({
}).catchall(z.string().describe('Input name → description'));

export const OperationOutputSchema = z.object({
}).catchall(z.string().describe('Output name → description'));

export const OperationHarnessSchema = z.record(z.string().describe('Harness name → implementation instruction'));

export const OperationDefinitionSchema = z.object({
  description: z.string().describe('What this operation does'),
  inputs: z.array(OperationInputSchema).optional().describe('Positional input entries — each item is a single-key object mapping input name to its description'),
  output: z.array(OperationOutputSchema).optional().describe('Output entries produced by this operation — same shape as inputs'),
  procedure: z.array(z.string()).optional().describe('Ordered imperative bullets describing how to perform the operation'),
  tools: z.record(z.array(z.string())).optional().describe('Map of source → array of tool names. Source is an MCP server name (workflow-server, atlassian, gitnexus, concept-rag, ...), or one of the reserved keys "shell" (regular shell programs) and "harness" (agent built-ins like Read, Write, AskQuestion). Provenance hint only — tool specs come from the tool descriptions themselves.'),
  prose: z.string().optional().describe('Freeform markdown content for tables, examples, and reference material specific to this operation'),
  harness: OperationHarnessSchema.optional().describe('Harness-specific implementations keyed by harness name (cursor, cline, generic, ...)'),
  note: z.string().optional().describe('Additional notes about the operation'),
});

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
  checkpoint_response_format: z.record(z.unknown()).optional(),
  decision_outcome_format: z.record(z.unknown()).optional(),
  history_event_types: z.record(z.unknown()).optional(),
  history_entry_format: z.record(z.unknown()).optional(),
  status_values: z.record(z.string()).optional(),
  interpretation: InterpretationSchema.optional(),
  resumption: ResumptionSchema.optional(),
  rules: RulesDefinitionSchema.optional(),
  errors: z.record(ErrorDefinitionSchema).optional(),
  inputs: InputsDefinitionSchema.optional(),
  protocol: ProtocolDefinitionSchema.optional(),
  output: OutputDefinitionSchema.optional(),
  resources: z.array(z.string()).optional().describe('Resource indices or IDs this skill depends on (e.g. 02, 04, 08)'),
  operations: z.record(OperationDefinitionSchema).optional().describe('Named operations this skill defines (e.g. spawn-agent, continue-agent)'),
}).strict();
export type Skill = z.infer<typeof SkillSchema>;

export function validateSkill(data: unknown): Skill { return SkillSchema.parse(data); }
export function safeValidateSkill(data: unknown) { return SkillSchema.safeParse(data); }
