---
metadata:
  version: 3.0.0
---

## Capability

Shared contract for the CI/CD audit's sub-agent dispatch surface — the domain shapes its worker briefs and gathered results take, the persistence check over the output files, and the coverage and reconciliation gates.

## Inputs

### scanner_assignments

[Agent-to-submodule roster](../../resources/intermediate-artifact-schemas.md#scanner-assignments), in scanner order. The graph fans one scanner branch per entry, so the roster is also the expectation list every gather here is measured against.

### sub_workflow_scan_outputs

The scanner branches' container: one slot per roster entry, in roster order, each carrying its scanner's `id` and the values that branch reported.

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with per-workflow trigger, permission, and checkout classification data.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array produced by compose operations for the next meta dispatch step.

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
