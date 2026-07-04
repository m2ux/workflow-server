import { z } from 'zod';
import { SemanticVersionSchema } from './common.js';

export const InputItemDefinitionSchema = z.object({
  id: z.string().describe('Stable identifier for this input (hyphen-delimited, matching protocol step id style). Used to bind to an output or supply from context when chaining techniques.'),
  description: z.string().optional().describe('Human-readable description of this input. Optional inputs say so in prose (a leading "(optional)"); necessity is otherwise implied by protocol use — there is no engine-enforced required flag.'),
  default: z.unknown().optional().describe('Default value when not supplied'),
  components: z.record(z.string()).optional().describe('Named sub-members of a composite input (authored as `####` sub-sections under the input). Mirrors output components.'),
});
export type InputItemDefinition = z.infer<typeof InputItemDefinitionSchema>;

export const ProtocolStepSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});
export type ProtocolStep = z.infer<typeof ProtocolStepSchema>;

export const InputsDefinitionSchema = z.array(InputItemDefinitionSchema).describe('Inputs the technique expects from context: array of named items (mirrors output structure for deterministic binding)');
export type InputsDefinition = z.infer<typeof InputsDefinitionSchema>;

/** A single protocol block: an optional label and an ordered list of imperative step bullets. */
export const ProtocolBlockSchema = z.object({
  title: z.string().optional().describe('Optional label for this block (the authored `### Title`, ordinal prefix stripped).'),
  steps: z.array(z.string()).describe('Ordered imperative step bullets for this block.'),
});
export type ProtocolBlock = z.infer<typeof ProtocolBlockSchema>;

/** Protocol: a single ordered list of step blocks (no "phase" construct). Blocks are positional;
 *  an ancestor's Initial blocks are placed before, and its Final blocks after, a nested technique's
 *  own blocks, and the server renumbers the combined sequence for display. */
export const ProtocolDefinitionSchema = z.array(ProtocolBlockSchema);
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
  name: z.string().describe('Artifact filename when this output is persisted. A literal (e.g. 01-audit-report.md) or a token-template with {variable} placeholders the worker interpolates from in-scope inputs/variables at runtime (e.g. {package-name}-plan.md). Declare the name here, never hardcode it in Protocol prose.'),
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

export const OutputsDefinitionSchema = z.array(OutputItemDefinitionSchema).describe('What the technique produces: one or more outputs, each with required id (hyphen-delimited) and optional description and components');
export type OutputsDefinition = z.infer<typeof OutputsDefinitionSchema>;

// Delivery-only blocks, populated by the server at composition time: entries whose winning
// definition comes from an ancestor contract (workflow-root or group TECHNIQUE.md) are delivered
// here, partitioned out of `inputs`/`outputs`. Never authored — the markdown loader maps only the
// canonical `## Inputs`/`## Outputs` headings, so these cannot originate from a technique file.

export const InheritedInputsSchema = z.object({
  note: z.string().describe('One-line scope note: why these inputs are shared contract context rather than specific to this technique.'),
  items: InputsDefinitionSchema,
}).describe('Inputs inherited from the workflow-root/group contract, delivered under a marked block distinct from the technique\'s own inputs.');
export type InheritedInputs = z.infer<typeof InheritedInputsSchema>;

export const InheritedOutputsSchema = z.object({
  note: z.string().describe('One-line scope note: why these outputs are shared contract obligations rather than specific to this technique.'),
  items: OutputsDefinitionSchema,
}).describe('Outputs inherited from the workflow-root/group contract, delivered under a marked block distinct from the technique\'s own outputs.');
export type InheritedOutputs = z.infer<typeof InheritedOutputsSchema>;

// A nested technique (`<sub>.md`) validates against the same TechniqueSchema below: the markdown
// loader parses it into the technique shape and the server delivers it like any technique.

export const TechniqueSchema = z.object({
  id: z.string(),
  version: SemanticVersionSchema,
  capability: z.string(),
  rules: RulesDefinitionSchema.optional(),
  inputs: InputsDefinitionSchema.optional(),
  inherited_inputs: InheritedInputsSchema.optional(),
  protocol: ProtocolDefinitionSchema.optional(),
  outputs: OutputsDefinitionSchema.optional(),
  inherited_outputs: InheritedOutputsSchema.optional(),
}).strict();
export type Technique = z.infer<typeof TechniqueSchema>;

export function validateTechnique(data: unknown): Technique { return TechniqueSchema.parse(data); }
export function safeValidateTechnique(data: unknown) { return TechniqueSchema.safeParse(data); }
