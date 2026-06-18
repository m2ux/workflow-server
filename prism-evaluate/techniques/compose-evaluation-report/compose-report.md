---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Compose and write the consolidated evaluation report from the per-dimension findings, core finding, and cross-cutting patterns, structured for a reader who knows nothing of the analysis methodology.

## Outputs

### evaluation_report_path

The written `EVALUATION-REPORT.md` path.

## Protocol

- Write `{evaluation_report}` to `{output_path}` using the [evaluation report template](../../resources/evaluation-report-template.md#evaluation-report-template), with sections: Executive Summary (what was evaluated, framed from `{evaluation_description}`, with total findings by dimension and severity), Overall Assessment (a `### Verdict` sub-heading plus a headline-risk sub-heading), The Core Finding (labelled `###` facet sub-sections plus a `### Testable prediction`), Per-Dimension Findings (one sub-section per dimension with description, severity table, key findings, and the dimension's most important insight), Cross-Cutting Patterns, and Corrections and Recommendations grouped into immediate / short-term / structural into `{evaluation_report.recommendations}`.
- In every section before Per-Dimension Findings, prefer `###` sub-sections, short paragraphs, and bullet lists or compact tables over dense paragraphs; present enumerable framing (scope, rollout stages, target components) as a compact table or bullet list under a `###` sub-heading.
- Record `{evaluation_report_path}` as the path the `EVALUATION-REPORT.md` document was written to.
