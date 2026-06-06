---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Classify an evaluation target, derive or validate evaluation dimensions, and map each dimension to prism analytical lens and pipeline-mode configurations

## Inputs

### target_path

Path to the document, proposal, codebase, or artifact set to evaluate

### evaluation_description

User's description of what to evaluate, evaluation goals, focus areas, and concerns

### lens_overrides

*(optional)* Optional user-specified lens overrides per dimension. Keys are dimension names, values are { pipeline_mode, lenses }

## Protocol

### 1. Classify Target

- Examine {target_path} to determine the target type
- 'document' — {target_path} is a single file (markdown, PDF, text)
- 'document-set' — {target_path} is a directory containing documents without build infrastructure
- 'codebase' — {target_path} is a directory containing source code with build files (Cargo.toml, package.json, go.mod, pyproject.toml)
- 'mixed' — {target_path} contains both code and substantive documentation

### 2. Derive Dimensions

- If the user supplied dimensions, validate them: each must have a name and description. Proceed to survey-target.
- If no dimensions supplied, use attached [default-dimensions](../resources/default-dimensions.md) (default-dimensions) and select the dimension set matching the target_type. Each dimension object has: { name, description, focus_areas (array of specific aspects to examine) }.
- For target types not covered by the resource defaults, infer dimensions from the {evaluation_description}. Each dimension should represent an independent analytical axis.
- If no meaningful evaluation dimensions can be derived from the description and target, ask the user to provide explicit dimensions or to refine the {evaluation_description}.
- Present derived dimensions for user confirmation during the scope-definition checkpoint

### 3. Survey Target

- List files and directories at the top level of {target_path}
- If {target_path} contains no analysable files, verify the path is correct and check whether the target lives in a different location before proceeding
- For document/document-set targets: inventory all documents, identify their topics, structure, and cross-references between documents. Note total word count or section count.
- For codebase targets: identify the build system, enumerate modules/packages, count lines of code per module. Identify test directories.
- For mixed targets: apply both document and code surveys
- If GitNexus is available (check via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md)) and target is a codebase: use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) to discover functional areas and community clusters for better module classification
- Read enough of the target content to understand its scope, key topics, claims, and structure — this informs dimension-specific analysis_focus values
- For proposal documents: identify the major sections, stated goals, key claims, architectural decisions, resource assumptions, and timeline commitments
- Record: target_type, {\$target_summary}, {\$structure_inventory} (sections or modules with sizes), {\$key_topics}

### 4. Map Dimensions To Lenses

- Use attached [dimension-lens-mapping](../resources/dimension-lens-mapping.md) (dimension-lens-mapping) for the standard and custom mapping tables, output subdirectory conventions, and pipeline mode selection guidance.
- For each dimension, match against the standard mappings table first. If no standard mapping matches, use the custom dimension mappings table.
- If {lens_overrides} contains an entry for a dimension name, use the override values instead of the derived mapping
- If a user-supplied dimension does not map to any known prism lens pattern, suggest the closest lens match from the goal-mapping matrix and ask the user to confirm it or provide a lens_override for that dimension
- For each dimension, compose a dimension-specific analysis_focus string: a focused description of what to examine within this dimension, referencing specific target content discovered during survey-target. This MUST NOT be a bare label like 'security audit' or 'audit' — it must be substantive guidance.
- Assign each dimension an output_subdir per the conventions in [dimension-lens-mapping](../resources/dimension-lens-mapping.md).
- Record {dimension_plan}: array of { dimension (name), pipeline_mode, lenses (array of resource indices), analysis_focus, output_subdir }

### 5. Group For Execution

- Group dimensions that share the same pipeline mode into execution groups
- Full-prism dimensions each get their own group (full-prism runs the 3-pass pipeline and cannot be combined)
- Portfolio dimensions can be combined: all portfolio lenses run in a single prism trigger with pipeline_mode 'portfolio' and selected_lenses merging all lens indices. Each lens writes to its own artifact file within the output_subdir.
- Record {execution_groups}: array of { pipeline_mode, lenses, dimensions (array of names), analysis_focus (combined), output_subdir }

### 6. Write Evaluation Plan

- Compose the human-readable {evaluation_plan} document and write it into {output_path}
- Section 1: Target Overview — target type, {\$target_summary}, {\$structure_inventory}, {\$key_topics}
- Section 2: Dimension Plan — table mapping each dimension to pipeline mode, lenses, focus areas, and output location
- Section 3: Execution Groups — how dimensions are grouped for prism triggering, execution order, estimated sub-agent dispatches
- Return the written {evaluation_plan} as the artifact for downstream activities

## Outputs

### evaluation_plan

The composed [evaluation plan](../resources/evaluation-plan-template.md#evaluation-plan-template) document

#### artifact

`evaluation-plan.md`

#### target_overview

Target classification and structure summary

#### dimension_plan

Per-dimension lens mapping and analysis focus

#### execution_groups

Grouped execution strategy

### dimension_plan

Machine-readable dimension-to-lens mapping

#### plan

Array of { dimension, pipeline_mode, lenses, analysis_focus, output_subdir }
