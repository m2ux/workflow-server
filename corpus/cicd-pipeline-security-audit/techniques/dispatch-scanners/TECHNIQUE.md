---
metadata:
  version: 3.2.0
---

## Capability

Shared contract for the CI/CD audit's sub-agent dispatch surface — the domain shapes its worker briefs and gathered results take, the filenames those workers persist, and the coverage and reconciliation gates.

## Inputs

### scanner_assignments

[Agent-to-submodule roster](../../resources/intermediate-artifact-schemas.md#scanner-assignments), in scanner order. The graph fans one scanner branch per entry, so the roster is also the expectation list every gather here is measured against.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array produced by compose techniques for the next meta dispatch step.

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
