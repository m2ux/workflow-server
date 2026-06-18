---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 16
  legacy_id: 16
---

## Capability

Produce the gap analysis report comparing AI audit findings against a professional reference report

## Inputs

### reference_report

Path to the reference report artifact.

## Protocol

1. Load reference report from input `{reference_report}` (first and only time).
2. Extract reference finding list with severities and affected files.
3. Map each reference finding to the closest AI finding, classify each as matched/partial/gap, and severity-calibrate the matched findings.
4. Write the `{gap_analysis}` report, assembling the `{gap_analysis.summary_metrics}`, `{gap_analysis.finding_mapping}`, `{gap_analysis.gaps}`, `{gap_analysis.severity_calibration}`, `{gap_analysis.ai_only_findings}`, and `{gap_analysis.recommendations}` sections into the artifact.

## Outputs

### gap_analysis

[Gap analysis report](../resources/gap-analysis-template.md#gap-analysis-template).

#### artifact

`02-gap-analysis.md`

#### summary_metrics

Metrics table: total findings each side, matched, partial, gaps, AI-only, overlap rate

#### finding_mapping

Table mapping every reference finding to the closest AI finding. Classify as matched, partial, or gap.

#### gaps

Each gap with root cause analysis: why was it missed (missing check, reasoning error, scope limitation)?

#### severity_calibration

Table of severity deltas for matched findings. Identify over-rating and under-rating patterns.

#### ai_only_findings

Findings in the AI report not present in the reference. Assess whether novel or out-of-scope for reference.

#### recommendations

Workflow improvement suggestions derived from gap root causes

## Rules

### reference-targets-same-commit

The reference report compared against must target the same commit as the AI audit for the comparison to be valid.

### reference-loaded-once-here

The reference report is loaded for the first and only time during this comparison; it must not have been read or discussed earlier.
