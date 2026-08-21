---
metadata:
  version: 2.0.0
---

## Capability

Fixes each dimension's prism configuration — its pipeline mode, lenses, analysis focus, and output location — as the machine-readable plan the analysis stage runs from.

## Inputs

### structure_inventory

Sections or modules with their sizes.

### key_topics

The target's key topics and claims.

## Outputs

### dimension_plan

An array of `{ dimension, pipeline_mode, lenses, analysis_focus, output_subdir }`, one entry per dimension.

## Protocol

### 1. Match Each Dimension to a Lens Set

- For each dimension, match against [Standard Mappings](../../resources/dimension-lens-mapping.md#standard-mappings); when no standard mapping matches, derive one per [Custom Dimension Mappings](../../resources/dimension-lens-mapping.md#custom-dimension-mappings), taking the goal-to-lens catalog from `prism.plan-analysis.goal-mapping-matrix`.  
  > Where `{lens_overrides}` holds an entry for a dimension name, the override values stand in place of the matched mapping.  
  > Where a dimension matches no goal in that catalog, record the closest lens set as a proposal and leave the dimension unmapped pending an override for it.

### 2. Compose Each Analysis Focus

- For each dimension, compose its `analysis_focus` from `{structure_inventory}` and `{key_topics}` — what to examine within that dimension, in the target's own terms.

### 3. Record the Plan

- Assign each dimension an `output_subdir` per [Output Subdirectory Convention](../../resources/dimension-lens-mapping.md#output-subdirectory-convention), and record `{dimension_plan}`.

## Rules

### evidence-based-focus

Every `analysis_focus` names content the survey found in this target — a proposal's own market-size assertion, this codebase's own module — rather than the dimension in the abstract.

### dimension-focus

Every `analysis_focus` opens by naming its dimension in descriptive language: `evaluate consistency of…`, `assess veracity of claims regarding…`, `analyse feasibility constraints for…`.
