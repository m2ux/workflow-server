---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 8
  legacy_id: 8
---

## Capability

Given two finding lists, produce a finding-by-finding mapping, classify matches/partials/gaps, analyze severity calibration differences, and identify root cause patterns for gaps

## Inputs

### primary-findings

The finding list to evaluate (e.g., AI audit results)

### reference-findings

The benchmark finding list to compare against (e.g., professional audit report)

## Protocol

### 1. Map Findings

- For each finding in {reference-findings}, identify the closest matching finding in {primary-findings}. Classify as: matched (same root cause and affected code), partial match (related but incomplete coverage or different framing), or gap (missed entirely). Record these as `{$finding-classifications}`.

### 2. Identify Gaps

- From `{$finding-classifications}`, list all reference findings classified as gaps. Group by severity and root cause category (e.g., pattern-absence blindness, insufficient file coverage, wrong-layer check, first-positive-signal bias, toolkit depth limitation, mechanical-check skip) into `{$gap-clusters}`.

### 3. Analyze Severity Calibration

- For matched findings in `{$finding-classifications}`, compare severity ratings between primary and reference. Identify systematic over-rating patterns (primary higher than reference) and under-rating patterns (primary lower). Compute average delta by severity tier.

### 4. Analyze Root Causes

- For each cluster in `{$gap-clusters}`, determine the structural cause: insufficient file coverage, pattern-absence blindness, toolkit deprioritization, wrong-layer check application, first-positive-signal bias, mechanical-check skip, or other. Propose countermeasures for each root cause, then assemble the mapping, gaps, calibration analysis, and countermeasures into the {comparison-report}.

## Outputs

### comparison-report

Comparison report with mapping, gaps, calibration analysis, and countermeasures.

#### finding-mapping-table

reference finding, primary finding, match type, severity comparison

#### gap-list

missed reference findings grouped by severity and root cause

#### severity-calibration-analysis

over-rated findings, under-rated findings, average delta

#### root-cause-analysis

root cause analysis with proposed countermeasures
