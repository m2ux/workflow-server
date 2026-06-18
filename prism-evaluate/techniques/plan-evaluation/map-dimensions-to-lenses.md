---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
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

- For each dimension, match against the standard table in [dimension-lens-mapping](../../resources/dimension-lens-mapping.md#standard-mappings); when no standard mapping matches, use the [custom dimension mappings](../../resources/dimension-lens-mapping.md#custom-dimension-mappings) table.
- When `{lens_overrides}` holds an entry for a dimension name, use the override values in place of the matched mapping.  
  > When a user-supplied dimension maps to no known prism lens pattern, suggest the closest lens match from the [custom dimension mappings](../../resources/dimension-lens-mapping.md#custom-dimension-mappings) and request confirmation or a `{lens_overrides}` entry for that dimension.
- For each dimension, compose a substantive `analysis_focus` string describing what to examine within the dimension, drawing on `{structure_inventory}` and `{key_topics}`.
- Assign each dimension an `output_subdir` per the [output subdirectory convention](../../resources/dimension-lens-mapping.md#output-subdirectory-convention).
- Record `{dimension_plan}`: an array of `{ dimension, pipeline_mode, lenses, analysis_focus, output_subdir }`.
