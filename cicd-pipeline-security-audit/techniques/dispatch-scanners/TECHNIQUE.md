---
metadata:
  version: 2.0.0
---

## Capability

Compose domain-specific scanner / verification / merge / gap-remediation worker briefs, project gathered results into the CI/CD dispatch shape, verify output-file persistence, and enforce coverage and reconciliation gates. Concurrent dispatch and ordered gather bind meta [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](../../../meta/techniques/orchestration-patterns/dispatch-workers.md) / [gather-results](../../../meta/techniques/orchestration-patterns/gather-results.md) from the activity. Each phase is a named operation; a step binds the one operation for its phase.

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
