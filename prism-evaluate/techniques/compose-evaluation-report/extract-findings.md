---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Read each dimension's findings from the prism run's DEFINITIVE-FINDINGS.md contract into the report's per-dimension findings — inheriting prism's IDs, severities, and per-finding fields rather than re-extracting or re-numbering.

## Inputs

### completed_analyses

The triggered prism runs, each carrying its group's `definitive_findings_path` (the DEFINITIVE-FINDINGS.md the run produced) and prism-reported `status`. The findings source for every dimension.

## Protocol

- For each execution group's run in `{completed_analyses}`, read its DEFINITIVE-FINDINGS.md at the `definitive_findings_path`. This is the findings source — the raw pass artifacts (synthesis.md, portfolio-*.md) are never read here.
- Take each finding's ID, severity, title, description, and remaining fields directly from DEFINITIVE-FINDINGS.md. prism assigned dimension-prefixed IDs (`finding-id-convention`) and post-reconciliation severities (`severity-rubric`); the consolidation inherits both and does not re-number or re-grade.
- Attribute each finding to its dimension(s) — a group may cover more than one dimension sharing a pipeline mode; use the group's `dimensions` to label them.
- Record per dimension: dimension name, finding count, finding count by severity, and the list of findings with IDs into `{evaluation_report.dimension_findings}`.  
  > When a run's manifest `status` is `error` or `partial`, still include its dimension(s) with a note that coverage was incomplete for that dimension, rather than dropping it silently. When a dimension's DEFINITIVE-FINDINGS.md contains no findings, include the dimension with a note that no significant findings were identified.
