---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Compose and concurrently dispatch per-submodule scanner sub-agents — each receiving its assigned submodule path, workflow file list, workflow inventory classification data, and injection pattern catalog — verify dispatch completeness and output-file persistence, then dispatch the verification (V) and merge (M) coordination agents and enforce the coverage and reconciliation gates. The operations in this set decompose that orchestration into scanner-dispatch, dispatch-completeness, result-collection, output-file-verification, verification-dispatch, gap-remediation, merge-dispatch, and reconciliation-gate phases.

## Inputs

### scanner_assignments

[Agent-to-submodule mapping](../../resources/intermediate-artifact-schemas.md#scanner-assignments) for the scanner roster.

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with per-workflow trigger, permission, and checkout classification data.

### scanners_assigned

Count of scanner agents in the roster.

## Outputs

### dispatch_status

Dispatch and collection status for all agents.

#### scanners_dispatched

Count of dispatched scanner agents.

#### scanners_returned

Count of returned scanner agents.

#### verification_dispatched

Whether V was dispatched.

#### merge_dispatched

Whether M was dispatched.
