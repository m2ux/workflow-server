import { z } from 'zod';
import { SemanticVersionSchema } from './common.js';
import { enforcement } from './enforcement.js';

export const ComponentEntrySchema = z.object({
  description: z.string().optional().describe('Component description above its first `#####` field heading.'),
  entry: z.record(z.string()).describe('Field identifiers mapped to descriptions for each list entry, authored as `#####` headings.'),
});
export type ComponentEntry = z.infer<typeof ComponentEntrySchema>;

export const OutputComponentsDefinitionSchema = z.record(z.union([
  z.string().describe('Component specification or description.'),
  ComponentEntrySchema,
])).describe('Component identifiers mapped to descriptions or list-entry field definitions.');
export type OutputComponentsDefinition = z.infer<typeof OutputComponentsDefinitionSchema>;

export const InputItemDefinitionSchema = z.object({
  id: enforcement(z.string().describe('Stable input identifier with words separated by hyphens.'), { owner: 'Engine', strictness: 'enforced' }),
  description: z.string().optional().describe('Input description, beginning with `(optional)` when the input is optional.'),
  default: enforcement(z.unknown().optional().describe('Default value when not supplied'), { owner: 'Engine', strictness: 'advisory' }),
  components: OutputComponentsDefinitionSchema.optional().describe('Named parts of a composite input, authored as `####` headings.'),
  source: z.string().optional().describe('Input value source annotation; omitted from authored technique files.'),
});
export type InputItemDefinition = z.infer<typeof InputItemDefinitionSchema>;

export const ProtocolStepSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});
export type ProtocolStep = z.infer<typeof ProtocolStepSchema>;

export const InputsDefinitionSchema = z.array(InputItemDefinitionSchema).describe('Named inputs accepted by the technique.');
export type InputsDefinition = z.infer<typeof InputsDefinitionSchema>;

export const ProtocolBlockSchema = z.object({
  title: z.string().optional().describe('Block label, authored as a `###` heading.'),
  steps: z.array(z.string()).describe('Ordered imperative step bullets for this block.'),
});
export type ProtocolBlock = z.infer<typeof ProtocolBlockSchema>;

export const ProtocolDefinitionSchema = z.array(ProtocolBlockSchema);
export type ProtocolDefinition = z.infer<typeof ProtocolDefinitionSchema>;

export const RulesDefinitionSchema = z.record(z.union([
  z.string().describe('Single rule text.'),
  z.array(z.string()).describe('Array of related rules grouped under this key.'),
]));
export type RulesDefinition = z.infer<typeof RulesDefinitionSchema>;

/** Filename grammar shared by schema validation and artifact checks. */
export const ARTIFACT_NAME_PATTERN = /^(?:[A-Za-z0-9._-]|\{[A-Za-z0-9._$-]+\})+\.[A-Za-z0-9]+$/;

/** Rejection message for {@link ARTIFACT_NAME_PATTERN}: cause, then the conforming forms. */
const ARTIFACT_NAME_MESSAGE =
  'an artifact name is a single filename — one path segment ending in an extension, `{token}` placeholders allowed (`01-audit-report.md`, `{package_name}-plan.md`). Declare one output per artifact when a technique writes several files';

export const OutputArtifactSchema = z.object({
  name: enforcement(z.string().regex(ARTIFACT_NAME_PATTERN, ARTIFACT_NAME_MESSAGE).describe('Single artifact filename with an extension and optional `{variable}` placeholders; declare one output per artifact.'), { owner: 'Engine', strictness: 'enforced' }),
  action: z.enum(['create', 'update']).default('create').optional().describe('Whether this output creates a new artifact or updates an existing one'),
});
export type OutputArtifact = z.infer<typeof OutputArtifactSchema>;

export const OutputItemDefinitionSchema = z.object({
  id: enforcement(z.string().describe('Stable output identifier with words separated by hyphens, distinct from its artifact filename.'), { owner: 'Engine', strictness: 'enforced' }),
  description: z.string().optional().describe('Human-readable description of this output'),
  components: OutputComponentsDefinitionSchema.optional(),
  entry: z.record(z.string()).optional().describe('List-entry fields under `#### entry` with `#####` field headings; mutually exclusive with `components`.'),
  artifact: OutputArtifactSchema.optional().describe('Filename and create-or-update action for a persisted output.'),
  audience: z.enum(['human', 'agent']).optional().describe('Intended reader of this output or artifact: `human` by default, or `agent`.'),
  values: z.array(z.string()).min(1).optional().describe('Complete set of allowed output values, authored under `#### values`.'),
  fieldValues: z.record(z.array(z.string()).min(1)).optional().describe('Field names mapped to allowed value sets, authored as `#####` headings under `#### values`.'),
  destination: z.string().optional().describe('Output variable name annotation when different from its identifier; omitted from authored technique files.'),
});
export type OutputItemDefinition = z.infer<typeof OutputItemDefinitionSchema>;

export const OutputsDefinitionSchema = z.array(
  OutputItemDefinitionSchema.refine(
    (output) => output.entry === undefined || output.components === undefined,
    { message: 'an output declares `components` (its parts) or `entry` (what one element carries), never both' },
  ),
).describe('Named outputs with optional descriptions and either components or list-entry fields.');
export type OutputsDefinition = z.infer<typeof OutputsDefinitionSchema>;

export const InheritedInputsSchema = z.object({
  note: z.string().describe('Brief explanation of the shared input scope.'),
  items: InputsDefinitionSchema,
}).describe('Shared inputs from the workflow or group contract; omitted from authored technique files.');
export type InheritedInputs = z.infer<typeof InheritedInputsSchema>;

export const InheritedOutputsSchema = z.object({
  note: z.string().describe('Brief explanation of the shared output obligations.'),
  items: OutputsDefinitionSchema,
}).describe('Shared outputs from the workflow or group contract; omitted from authored technique files.');
export type InheritedOutputs = z.infer<typeof InheritedOutputsSchema>;

export const TechniqueSchema = z.object({
  id: enforcement(z.string(), { owner: 'Engine', strictness: 'enforced' }),
  version: enforcement(SemanticVersionSchema, { owner: 'Engine', strictness: 'advisory' }),
  capability: enforcement(z.string(), { owner: 'Engine', strictness: 'advisory' }),
  provenance_note: z.string().optional().describe('Input and output provenance annotation; omitted from authored technique files.'),
  rules: RulesDefinitionSchema.optional(),
  inputs: InputsDefinitionSchema.optional(),
  inherited_inputs: InheritedInputsSchema.optional(),
  protocol: enforcement(ProtocolDefinitionSchema.optional(), { owner: 'Engine', strictness: 'advisory' }),
  outputs: OutputsDefinitionSchema.optional(),
  inherited_outputs: InheritedOutputsSchema.optional(),
}).strict();
export type Technique = z.infer<typeof TechniqueSchema>;

export function validateTechnique(data: unknown): Technique { return TechniqueSchema.parse(data); }
export function safeValidateTechnique(data: unknown) { return TechniqueSchema.safeParse(data); }
