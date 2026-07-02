---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.3.0
  order: 1
  legacy_id: 1
---

## Capability

Consolidate the per-dimension DEFINITIVE-FINDINGS.md contracts prism produced into a unified evaluation report — inheriting prism's findings, IDs, and severities and adding the one thing prism cannot do across sibling runs: cross-dimensional synthesis. Then compile and present the report's metrics and deliverable index. prism's raw pass artifacts are never re-read; findings are never re-extracted or re-numbered.

## Inputs

### dimension_plan

The dimension-to-lens mapping, used to label and interpret each group's findings.

### completed_analyses

Array of completed prism runs, each carrying that group's `report_path`, `definitive_findings_path`, and prism-reported `status`. DEFINITIVE-FINDINGS.md is the findings source for consolidation.

### all_artifact_paths

Accumulated paths to every analysis artifact produced across the triggered prism runs, for the deliverable index.

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

The report contains no references to analytical methodology: no lens names (`L12`, `claim-inversion`, `knowledge-audit`), no pipeline-mode names (`full-prism`, `portfolio`), no pass descriptions (structural pass, adversarial pass, synthesis), and no process narratives (`the analysis first examined X then challenged Y`). prism's DEFINITIVE-FINDINGS.md is already methodology-free, so consolidation preserves that voice rather than re-stripping raw artifacts.

### standalone-report

The report is readable and actionable by someone who knows nothing about prism, lenses, or evaluation methodology, reading as a professional, evidence-based evaluation document.

### finding-id-convention

Finding IDs are inherited from prism's DEFINITIVE-FINDINGS.md, which assigns a 3-letter dimension prefix, a dash, and a two-digit number (`CON-01`, `VER-03`, `PLB-01`, `FEA-07`) from the dimension names passed in `analysis_focus`. Consolidation preserves these IDs and does not re-number; it only disambiguates a genuine collision between two groups by adding a group qualifier.

### severity-rubric

Severities are inherited from DEFINITIVE-FINDINGS.md, which carries prism's post-reconciliation Impact x Feasibility assignments (`CRITICAL` undermines the target's core purpose; `HIGH` degrades significant guarantees; `MEDIUM` has limited scope; `LOW` is informational). Consolidation does not re-grade findings.
