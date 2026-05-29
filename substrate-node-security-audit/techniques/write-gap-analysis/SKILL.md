---
name: write-gap-analysis
description: Produce the gap analysis report comparing AI audit findings against a professional reference report
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 16
  legacy_id: 16
---

# Write Gap Analysis

## Capability

Produce the gap analysis report comparing AI audit findings against a professional reference report

## Inputs

### reference-report-path

Path to the reference report artifact.

## Protocol

### 1. Load Reference Report

- Load reference report from input reference-report-path (first and only time)

### 2. Extract Reference Findings

- Extract reference finding list with severities and affected files

### 3. Map Classify Analyze

- Map, classify, and analyze per the sections above

### 4. Write Artifact

- Write the artifact

## Outputs

### gap-analysis

Gap analysis report. When persisted, use artifact name.

- **artifact**: `02-gap-analysis.md`
- **summary**: Metrics table: total findings each side, matched, partial, gaps, AI-only, overlap rate
- **finding_mapping**: Table mapping every reference finding to the closest AI finding. Classify as matched, partial, or gap.
- **gap_list**: Each gap with root cause analysis: why was it missed (missing check, reasoning error, scope limitation)?
- **severity_calibration**: Table of severity deltas for matched findings. Identify over-rating and under-rating patterns.
- **ai_only_findings**: Findings in the AI report not present in the reference. Assess whether novel or out-of-scope for reference.
- **recommendations**: Workflow improvement suggestions derived from gap root causes
