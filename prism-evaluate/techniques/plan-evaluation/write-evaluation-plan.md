---
metadata:
  version: 1.1.0
---

## Capability

Compose the human-readable evaluation plan document — target overview, dimension plan, and execution groups — write it to the output directory, and present its summary for confirmation.

## Inputs

### target_summary

A summary of the target's scope, goals, and major content, rendered into the plan's target overview.

### structure_inventory

Sections or modules with their sizes, rendered into the plan's target overview.

### key_topics

The target's key topics and claims, rendered into the plan's target overview.

## Outputs

### evaluation_plan

The composed [evaluation plan](../../resources/evaluation-plan-template.md#evaluation-plan-template) document.

#### artifact

`evaluation-plan.md`

#### target_overview

Target classification and structure summary.

#### dimension_plan_section

Per-dimension lens mapping and analysis focus.

### evaluation_plan_path

The written `evaluation-plan.md` path.

## Protocol

- Compose `{evaluation_plan}` into `{output_path}` using the [evaluation plan template](../../resources/evaluation-plan-template.md#evaluation-plan-template):
  - Target Overview — `{target_type}`, `{target_summary}`, `{structure_inventory}`, `{key_topics}`.
  - Dimension Plan — a table mapping each dimension to its `pipeline_mode`, `lenses`, focus areas, and `output_subdir`.
  - Execution Groups — how dimensions are grouped, execution order, and estimated sub-agent dispatch count.
- Record `{evaluation_plan_path}` as the path the `evaluation-plan.md` document was written to.
- Present the dimension-to-lens mapping and execution-group summary for user confirmation before triggering prism analyses.
