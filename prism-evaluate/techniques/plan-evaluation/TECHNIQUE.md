---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.3.0
  order: 0
  legacy_id: 0
---

## Capability

Classify an evaluation target, derive or validate evaluation dimensions, survey the target's structure, and map each dimension to prism analytical lens and pipeline-mode configurations, producing both a machine-readable dimension plan and a human-readable evaluation plan document. The set also creates the output directory and summarises the assembled scope for confirmation.

## Inputs

### dimensions

*(optional)* Evaluation dimensions supplied by the user, each an object `{ name, description, focus_areas }`. Absent when the user provides none.

### lens_overrides

*(optional)* User-specified lens overrides per dimension. Keys are dimension names, values are `{ pipeline_mode, lenses }`.

## Rules

### evidence-based-focus

Every `analysis_focus` references specific target content discovered during the survey, never a generic description; a proposal's specific claims (e.g. market-size assertions) are named in the relevant dimension's `analysis_focus`.

### trigger-isolation

No `analysis_focus` contains the strings `security audit`, `security review`, or the bare word `audit` as its primary descriptor; descriptive evaluation language is used instead (`evaluate consistency of…`, `assess veracity of claims regarding…`, `analyse feasibility constraints for…`).

### lens-override-respect

When `{lens_overrides}` provides a mapping for a dimension, it is used without modification — the user's explicit lens choice takes precedence over the matched mapping.
