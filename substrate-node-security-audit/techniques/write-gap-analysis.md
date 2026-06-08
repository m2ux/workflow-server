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
3. Map, classify, and analyze per the sections above.
4. Write the `{gap_analysis}` report, assembling the `{summary_metrics}`, `{finding_mapping}`, `{gaps}`, `{severity_calibration}`, `{ai_only_findings}`, and `{recommendations}` sections into the artifact.

## Outputs

### gap_analysis

[Gap analysis report](../resources/gap-analysis-template.md#gap-analysis-template). When persisted, use artifact name.

#### artifact_filename

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
