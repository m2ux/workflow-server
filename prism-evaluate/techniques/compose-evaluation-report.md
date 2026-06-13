---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
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

The consolidated [evaluation report](../resources/evaluation-report-template.md#evaluation-report-template).

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

### evaluation_findings

The flat list of findings extracted from the report, each carrying ID, severity, claim, critique, and mitigation tier.

### evaluation_metrics

Finding count by dimension, finding count by severity, dimensions evaluated, number of prism runs triggered, and total analysis artifacts produced.

## Protocol

### 1. Locate Artifacts

- For each dimension in `{dimension_plan}`, locate the prism output artifacts in the dimension's `output_subdir` under `{output_path}`, resolving each run's path and status from `{completed_analyses}` and `{all_artifact_paths}` before reading.
- Determine the expected artifacts for each dimension's `pipeline_mode` from the [terminal artifact convention](../resources/dimension-lens-mapping.md#terminal-artifact-convention).
- Verify the expected artifacts exist.  
  > When expected artifacts are missing for one or more dimensions, report which dimensions lack artifacts, then compose `{evaluation_report}` from the available dimensions and note the incomplete coverage.

### 2. Extract Findings Per Dimension

- For each dimension, read its `pipeline_mode`'s [terminal artifact](../resources/dimension-lens-mapping.md#terminal-artifact-convention).
- For full-prism dimensions, take the synthesis document's definitive classification and final severity assignments as the source of truth.
- For portfolio dimensions, extract the key findings and conservation laws from each lens artifact.
- Assign each finding an ID by dimension prefix (`finding-id-convention`), a severity (`severity-rubric`), a title, and a description.
- Record per dimension: dimension name, finding count, finding count by severity, and the list of findings with IDs into `{evaluation_report.dimension_findings}`.  
  > When a dimension's artifacts contain no extractable findings, still include the dimension with a note that no significant findings were identified.

### 3. Identify Cross-Dimensional Patterns

- Compare findings across dimensions for the same underlying issue surfacing in different dimensions, systemic asymmetries (deep specification in one area versus shallow in another), and reinforcing risks (multiple dimensions pointing to one failure mode).
- Identify `{evaluation_report.core_finding}` — the single deepest insight that explains the most findings across dimensions — with its title and description.
- Record `{evaluation_report.cross_cutting_patterns}` as an array of `{ pattern, affected_dimensions, evidence }`.  
  > When no meaningful pattern spans multiple dimensions, report the per-dimension findings without a core finding and note that the dimensions appear independent.

### 4. Compose Report

- Write `{evaluation_report}` to `{output_path}` using the [evaluation report template](../resources/evaluation-report-template.md#evaluation-report-template), with sections: Executive Summary (what was evaluated, framed from `{evaluation_description}`, with total findings by dimension and severity), Overall Assessment (a `### Verdict` sub-heading plus a headline-risk sub-heading), The Core Finding (labelled `###` facet sub-sections plus a `### Testable prediction`), Per-Dimension Findings (one sub-section per dimension with description, severity table, key findings, and the dimension's most important insight), Cross-Cutting Patterns, and Corrections and Recommendations grouped into immediate / short-term / structural into `{evaluation_report.recommendations}`.
- In every section before Per-Dimension Findings, prefer `###` sub-sections, short paragraphs, and bullet lists or compact tables over dense paragraphs; present enumerable framing (scope, rollout stages, target components) as a compact table or bullet list under a `###` sub-heading.

### 5. Verify Report

- Verify every finding ID is unique and follows the dimension-prefix convention.
- Verify the severity counts in `{evaluation_report.executive_summary}` match the per-dimension detail.
- Verify `{evaluation_report}` contains no methodology metadata — no lens names, passes, pipeline modes, or analytical-process descriptions.

### 6. Compile And Present

- Read `{evaluation_report}` and extract `{evaluation_findings}` — each finding's ID, severity, claim, critique, and mitigation tier.
- Compile `{evaluation_metrics}`: finding count by dimension, finding count by severity (Critical, High, Medium, Low), dimensions evaluated, number of prism runs triggered, and total analysis artifacts produced.
- Present the results to the user: `{evaluation_metrics}`, the `{evaluation_report.core_finding}` highlight, the top-priority entries of `{evaluation_report.recommendations}`, and a document index with the path to `{evaluation_report}`, `{evaluation_plan_path}`, and each dimension-specific analysis artifact, organised by dimension.

## Rules

### methodology-stripping

The report contains no references to analytical methodology: no lens names (`L12`, `claim-inversion`, `knowledge-audit`), no pipeline-mode names (`full-prism`, `portfolio`), no pass descriptions (structural pass, adversarial pass, synthesis), and no process narratives (`the analysis first examined X then challenged Y`). Methodology details remain in the raw analysis artifacts.

### standalone-report

The report is readable and actionable by someone who knows nothing about prism, lenses, or evaluation methodology, reading as a professional, evidence-based evaluation document.

### finding-id-convention

Finding IDs use a 3-letter dimension prefix, a dash, and a two-digit number (`CON-01`, `VER-03`, `PLB-01`, `FEA-07`); for custom dimensions, the prefix is derived from the dimension name's first letters or a natural abbreviation.

### severity-rubric

Every severity label is computed from Impact x Feasibility: `CRITICAL` directly undermines the target's core purpose or stated goals; `HIGH` degrades significant guarantees or creates major gaps; `MEDIUM` has limited scope or requires specific conditions; `LOW` is informational or an improvement opportunity.
