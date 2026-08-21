---
metadata:
  version: 1.0.0
---

## Capability

Map each evaluation dimension to its prism pipeline mode, lenses, analysis focus, and output subdirectory, producing the machine-readable dimension-to-lens plan.

## Inputs

### structure_inventory

Sections or modules with their sizes, drawn on when composing each dimension's analysis focus.

### key_topics

The target's key topics and claims, drawn on when composing each dimension's analysis focus.

## Outputs

### dimension_plan

Machine-readable dimension-to-lens mapping: an array of `{ dimension, pipeline_mode, lenses, analysis_focus, output_subdir }`.

## Protocol

- For each dimension, match against the standard table in [Standard Mappings](../../resources/dimension-lens-mapping.md#standard-mappings); when no standard mapping matches, derive one per [Custom Dimension Mappings](../../resources/dimension-lens-mapping.md#custom-dimension-mappings), taking the goal-to-lens catalog from `prism.plan-analysis.goal-mapping-matrix`.
- When `{lens_overrides}` holds an entry for a dimension name, use the override values in place of the matched mapping.  
  > When a dimension matches no goal in that catalog, record the closest lens set as a proposal and leave the dimension unmapped pending a `{lens_overrides}` entry for it.
- For each dimension, compose a substantive `analysis_focus` string describing what to examine within the dimension, drawing on `{structure_inventory}` and `{key_topics}`.
- Assign each dimension an `output_subdir` per the [output subdirectory convention](../../resources/dimension-lens-mapping.md#output-subdirectory-convention).
- Record `{dimension_plan}`: an array of `{ dimension, pipeline_mode, lenses, analysis_focus, output_subdir }`.

## Rules

### evidence-based-focus

Every `analysis_focus` references specific target content discovered during the survey, never a generic description; a proposal's specific claims (e.g. market-size assertions) are named in the relevant dimension's `analysis_focus`.

### dimension-focus

Each `analysis_focus` names its evaluation dimension in descriptive language (`evaluate consistency of…`, `assess veracity of claims regarding…`, `analyse feasibility constraints for…`) so prism assigns dimension-prefixed finding IDs (CON-xx, VER-xx, FEA-xx) that the consolidation inherits unchanged.
