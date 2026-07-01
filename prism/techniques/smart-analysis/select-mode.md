---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
---

## Capability

Compose the smart pipeline from the target characteristics and the analytical goal: decompose multi-region code into per-subsystem prisms; otherwise route the goal to a concern-specific lens or pipeline through the single canonical goal-mapping matrix, falling back to L12 when no goal is given

## Protocol

### 1. Attempt Decomposition

- When `{target_type}` is 'code', attempt AST-based subsystem decomposition (apply [subsystem-analysis](../subsystem-analysis/TECHNIQUE.md)::[decompose](../subsystem-analysis/decompose.md))
- If >1 subsystem is found: compose subsystem mode (the calibrator assigns a diversity-maximized prism per region) and skip to Record Steps

### 2. Route By Goal

- For a single-subsystem code target or a `general` target, route `{analysis_focus}` (the analytical goal) to a lens or pipeline using the single canonical `goal-mapping-matrix` rule in [plan-analysis](../plan-analysis.md), honoring its `code-vs-general`, `disjunction-tiebreak`, and `model-gating` rules — do not restrict to L12
- A goal that names one concern → `single` mode carrying that lens slug. A goal warranting self-correction → the L12 `full-prism` pipeline. A goal warranting breadth → `portfolio` with 2-3 complementary lenses. A comprehensive behavioral goal on code → the behavioral pipeline.
- When no goal is provided, default to L12 single pass (or the L12 3-pass pipeline for depth) per `single-lens-default`

### 3. Record Steps

- Record the resulting composed pipeline steps — including the selected lens slug for each step — as `{smart_pipeline_steps}`

## Outputs

### smart_pipeline_steps

The composed pipeline steps.
