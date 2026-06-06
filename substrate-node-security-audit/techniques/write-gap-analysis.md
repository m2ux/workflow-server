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

### reference-report-path

Path to the reference report artifact.

## Protocol

1. Load reference report from input {reference-report-path} (first and only time).
2. Extract reference finding list with severities and affected files.
3. Map, classify, and analyze per the sections above.
4. Write the {gap-analysis} report, assembling the {summary}, {finding-mapping}, {gap-list}, {severity-calibration}, {ai-only-findings}, and {recommendations} sections into the artifact.

## Outputs

### gap-analysis

[Gap analysis report](../resources/gap-analysis-template.md#gap-analysis-template). When persisted, use artifact name.

#### artifact

`02-gap-analysis.md`

#### summary

Metrics table: total findings each side, matched, partial, gaps, AI-only, overlap rate

#### finding-mapping

Table mapping every reference finding to the closest AI finding. Classify as matched, partial, or gap.

#### gap-list

Each gap with root cause analysis: why was it missed (missing check, reasoning error, scope limitation)?

#### severity-calibration

Table of severity deltas for matched findings. Identify over-rating and under-rating patterns.

#### ai-only-findings

Findings in the AI report not present in the reference. Assess whether novel or out-of-scope for reference.

#### recommendations

Workflow improvement suggestions derived from gap root causes
