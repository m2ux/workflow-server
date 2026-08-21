---
metadata:
  version: 1.0.0
---

## Capability

Compiles what the evaluation amounts to in figures, and an index of every artifact it produced, so the delivery names both.

## Outputs

### evaluation_metrics

The evaluation in figures — findings by dimension, findings by severity, dimensions evaluated, analysis runs triggered, artifacts produced — together with the index of those artifacts and their paths, organised by dimension.

## Protocol

### 1. Compile the Figures

- Compile the counts into `{evaluation_metrics}`: findings by dimension, findings by severity (Critical, High, Medium, Low), dimensions evaluated, analysis runs triggered, and total artifacts produced.

### 2. Index the Deliverables

- Fold the deliverable index into `{evaluation_metrics}` — `{evaluation_report_path}`, `{evaluation_plan_path}`, and each artifact in `{all_artifact_paths}` — organised by dimension.
