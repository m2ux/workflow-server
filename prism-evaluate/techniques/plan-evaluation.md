---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 0
  legacy_id: 0
---

## Capability

Classify an evaluation target, derive or validate evaluation dimensions, survey the target's structure, and map each dimension to prism analytical lens and pipeline-mode configurations, producing both a machine-readable dimension plan and a human-readable evaluation plan document.

## Inputs

### dimensions

*(optional)* Evaluation dimensions supplied by the user, each an object `{ name, description, focus_areas }`. Absent when the user provides none.

### lens_overrides

*(optional)* User-specified lens overrides per dimension. Keys are dimension names, values are `{ pipeline_mode, lenses }`.

## Protocol

### 1. Classify Target

- Examine `{target_path}` to determine `{target_type}` from these cases:
  - `document` — `{target_path}` is a single file (markdown, PDF, text).
  - `document-set` — `{target_path}` is a directory of documents without build infrastructure.
  - `codebase` — `{target_path}` is a directory of source code with build files (`Cargo.toml`, `package.json`, `go.mod`, `pyproject.toml`).
  - `mixed` — `{target_path}` contains both code and substantive documentation.

### 2. Derive Dimensions

- When `{dimensions}` is supplied, validate that each entry has a `name` and a `description`.
- When `{dimensions}` is absent, select the dimension set matching `{target_type}` from [default-dimensions](../resources/default-dimensions.md); each entry is `{ name, description, focus_areas }`.  
  > For a `{target_type}` not covered by the resource defaults, infer dimensions from `{evaluation_description}`, each an independent analytical axis.
- When no meaningful dimensions can be derived from `{evaluation_description}` and `{target_path}`, request explicit dimensions or a refined `{evaluation_description}`.

### 3. Survey Target

- List the files and directories at the top level of `{target_path}`.  
  > When `{target_path}` holds no analysable files, confirm the path is correct and check whether the target lives elsewhere before continuing.
- For `document` / `document-set` targets, inventory the documents, their topics, structure, and cross-references, and note total word or section count.
- For `codebase` targets, identify the build system, enumerate modules and packages, count lines of code per module, and locate test directories.
- For `mixed` targets, apply both the document and the code survey.
- For `codebase` targets when GitNexus has indexed the target ([gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md)), discover functional areas and community clusters via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) for module classification.
- Read enough of the target to understand its scope, key topics, claims, and structure; for proposal documents, identify the major sections, stated goals, key claims, architectural decisions, resource assumptions, and timeline commitments.
- Capture `{$target_summary}`, `{$structure_inventory}` (sections or modules with sizes), and `{$key_topics}`.

### 4. Map Dimensions To Lenses

- For each dimension, match against the standard table in [dimension-lens-mapping](../resources/dimension-lens-mapping.md#standard-mappings); when no standard mapping matches, use the [custom dimension mappings](../resources/dimension-lens-mapping.md#custom-dimension-mappings) table.
- When `{lens_overrides}` holds an entry for a dimension name, use the override values in place of the matched mapping.  
  > When a user-supplied dimension maps to no known prism lens pattern, suggest the closest lens match from the [custom dimension mappings](../resources/dimension-lens-mapping.md#custom-dimension-mappings) and request confirmation or a `{lens_overrides}` entry for that dimension.
- For each dimension, compose a substantive `analysis_focus` string describing what to examine within the dimension, drawing on `{structure_inventory}` and `{key_topics}`.
- Assign each dimension an `output_subdir` per the [output subdirectory convention](../resources/dimension-lens-mapping.md#output-subdirectory-convention).
- Record `{dimension_plan}`: an array of `{ dimension, pipeline_mode, lenses, analysis_focus, output_subdir }`.

### 5. Group For Execution

- Group dimensions sharing a `pipeline_mode` into execution groups.
- Place each `full-prism` dimension in its own group (the 3-pass pipeline cannot be combined).
- Combine `portfolio` dimensions into a single group with `pipeline_mode` `portfolio` and the union of their lens indices; each lens writes its own artifact within the group's `output_subdir`.
- Record `{execution_groups}`: an array of `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`, ordered `full-prism` groups first, then `portfolio` groups.

### 6. Write Evaluation Plan

- Compose `{evaluation_plan}` into `{output_path}` using the [evaluation plan template](../resources/evaluation-plan-template.md#evaluation-plan-template):
  - Target Overview — `{target_type}`, `{target_summary}`, `{structure_inventory}`, `{key_topics}`.
  - Dimension Plan — a table mapping each dimension to its `pipeline_mode`, `lenses`, focus areas, and `output_subdir`.
  - Execution Groups — how dimensions are grouped, execution order, and estimated sub-agent dispatch count.

## Outputs

### target_type

Classification of the target: `document`, `document-set`, `codebase`, or `mixed`.

### dimensions

The validated or derived evaluation dimensions, each `{ name, description, focus_areas }`.

### dimension_plan

Machine-readable dimension-to-lens mapping: an array of `{ dimension, pipeline_mode, lenses, analysis_focus, output_subdir }`.

### execution_groups

Dimensions grouped by `pipeline_mode` for prism triggering: an array of `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`.

### evaluation_plan

The composed [evaluation plan](../resources/evaluation-plan-template.md#evaluation-plan-template) document.

#### artifact

`evaluation-plan.md`

#### target_overview

Target classification and structure summary.

#### dimension_plan_section

Per-dimension lens mapping and analysis focus.

## Rules

### evidence-based-focus

Every `analysis_focus` references specific target content discovered during the survey, never a generic description; a proposal's specific claims (e.g. market-size assertions) are named in the relevant dimension's `analysis_focus`.

### trigger-isolation

No `analysis_focus` contains the strings `security audit`, `security review`, or the bare word `audit` as its primary descriptor; descriptive evaluation language is used instead (`evaluate consistency of…`, `assess veracity of claims regarding…`, `analyse feasibility constraints for…`).

### lens-override-respect

When `{lens_overrides}` provides a mapping for a dimension, it is used without modification — the user's explicit lens choice takes precedence over the matched mapping.
