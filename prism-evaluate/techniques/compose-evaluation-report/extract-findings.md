---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Extract the per-dimension findings from each dimension's terminal artifact, assigning each an ID, severity, title, and description into the report's per-dimension findings.

## Protocol

- For each dimension, read its `pipeline_mode`'s [terminal artifact](../../resources/dimension-lens-mapping.md#terminal-artifact-convention).
- For full-prism dimensions, take the synthesis document's definitive classification and final severity assignments as the source of truth.
- For portfolio dimensions, extract the key findings and conservation laws from each lens artifact.
- Assign each finding an ID by dimension prefix (`finding-id-convention`), a severity (`severity-rubric`), a title, and a description.
- Record per dimension: dimension name, finding count, finding count by severity, and the list of findings with IDs into `{evaluation_report.dimension_findings}`.  
  > When a dimension's artifacts contain no extractable findings, still include the dimension with a note that no significant findings were identified.
