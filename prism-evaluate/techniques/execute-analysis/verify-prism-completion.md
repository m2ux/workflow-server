---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Verify a triggered prism run completed successfully — its expected, substantive analysis artifacts for the run's pipeline mode are present and non-empty — recording a failure status against the run when verification does not pass.

## Protocol

### 1. Verify Prism Completion

- Confirm all analysis artifacts expected for the run's `{pipeline_mode}` are present and contain substantive findings.
  > If verification fails, record the failure against the run's entry in `{completed_analyses}` with status `'error'` and the failure reason.

## Outputs

### completed_analyses

Array of completed prism analysis references, each carrying the run's verification status
