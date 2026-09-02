---
metadata:
  version: 2.0.0
---

## Capability

Shared contract for the CI/CD audit's sub-agent dispatch surface — the domain shapes its worker briefs and gathered results take, the persistence check over the output files, and the coverage and reconciliation gates.

## Inputs

### scanner_assignments

[Agent-to-submodule mapping](../../resources/intermediate-artifact-schemas.md#scanner-assignments) for the scanner roster.

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with per-workflow trigger, permission, and checkout classification data.

### scanners_assigned

Count of scanner agents in the roster.

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
