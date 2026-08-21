---
metadata:
  version: 2.0.0
---

## Capability

Consolidates the per-dimension findings of sibling analysis runs into one evaluation of the target, adding the reading no single run reaches: what holds across dimensions.

## Inputs

### dimension_plan

Each dimension's lens configuration, which labels and interprets a group's findings.

### completed_analyses

Completed prism run references, each with its report path, definitive-findings path, and reported completion status.

### all_artifact_paths

Every analysis artifact path the triggered runs produced.

### evaluation_plan_path

Path to the evaluation plan document.

## Outputs

### evaluation_report

The consolidated evaluation of the target.

#### artifact

`EVALUATION-REPORT.md`

#### audience

`human`

#### executive_summary

The overall assessment, with finding counts and the core insight.

#### core_finding

The deepest cross-dimensional insight.

#### dimension_findings

Per-dimension findings with severity tables.

#### cross_cutting_patterns

Patterns spanning more than one dimension.

#### recommendations

Prioritised corrections and recommendations.

## Rules

### methodology-stripping

The report names no analytical methodology: no lens names (`L12`, `claim-inversion`, `knowledge-audit`), no pipeline-mode names (`full-prism`, `portfolio`), no pass descriptions, and no process narratives. Findings read as conclusions about the target.

### standalone-report

The report is readable and actionable by someone who knows nothing of the analysis that produced it, in the voice of a professional, evidence-based evaluation.

### findings-carry-their-source-identity

Each finding appears under the ID and severity its source analysis assigned. Where two groups assign the same ID, the report adds a group qualifier to one of them.
