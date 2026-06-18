---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.3.0
  order: 1
  legacy_id: 1
---

## Capability

Consolidate prism analysis artifacts from multiple evaluation dimensions into a unified evaluation report with cross-dimensional synthesis, then compile and present the report's metrics and deliverable index.

## Inputs

### dimension_plan

The dimension-to-lens mapping, used to locate and interpret artifacts.

### completed_analyses

Array of completed prism run references with output paths and status.

### all_artifact_paths

Accumulated paths to every analysis artifact produced across the triggered prism runs.

### evaluation_plan_path

Path to the evaluation plan document.

## Outputs

### evaluation_report

The consolidated [evaluation report](../../resources/evaluation-report-template.md#evaluation-report-template), built up across the consolidation phases and read by the verification and presentation phases.

#### artifact

`EVALUATION-REPORT.md`

#### executive_summary

Overall assessment with finding counts and core insight.

#### core_finding

Deepest cross-dimensional insight.

#### dimension_findings

Per-dimension findings with severity tables.

#### cross_cutting_patterns

Cross-dimensional patterns.

#### recommendations

Prioritised corrections and recommendations.

## Rules

### methodology-stripping

The report contains no references to analytical methodology: no lens names (`L12`, `claim-inversion`, `knowledge-audit`), no pipeline-mode names (`full-prism`, `portfolio`), no pass descriptions (structural pass, adversarial pass, synthesis), and no process narratives (`the analysis first examined X then challenged Y`). Methodology details remain in the raw analysis artifacts.

### standalone-report

The report is readable and actionable by someone who knows nothing about prism, lenses, or evaluation methodology, reading as a professional, evidence-based evaluation document.

### finding-id-convention

Finding IDs use a 3-letter dimension prefix, a dash, and a two-digit number (`CON-01`, `VER-03`, `PLB-01`, `FEA-07`); for custom dimensions, the prefix is derived from the dimension name's first letters or a natural abbreviation.

### severity-rubric

Every severity label is computed from Impact x Feasibility: `CRITICAL` directly undermines the target's core purpose or stated goals; `HIGH` degrades significant guarantees or creates major gaps; `MEDIUM` has limited scope or requires specific conditions; `LOW` is informational or an improvement opportunity.
