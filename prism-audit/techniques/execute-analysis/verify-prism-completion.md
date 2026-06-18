---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Verify a triggered prism run completed successfully — its report exists and contains findings and all artifacts expected for the run's pipeline mode are present — recording a failure status against the run when verification does not pass.

## Protocol

### 1. Verify Prism Completion

- Confirm the run's `REPORT.md` exists and contains findings.
- Confirm all analysis artifacts expected for the run's `{pipeline_mode}` are present.
  > If verification fails, record the failure against the run's entry in `{completed_analyses}` with status `'error'`.

## Outputs

### completed_analyses

Array of completed prism analysis references, each carrying the run's verification status
