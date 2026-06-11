---
metadata:
  version: 1.0.0
---

## Capability

Update the work package's ADR to Accepted, recording the implementation outcome.

## Inputs

### adr

*(optional)* The [Architecture Decision Record](../../resources/architecture-review.md#adr-template) created for this work package, if one exists; inherited from the [finalize-documentation](./TECHNIQUE.md) group root.

### pr_number

The merged PR number, cross-referenced when recording the ADR implementation outcome; inherited from the [finalize-documentation](./TECHNIQUE.md) group root.

## Output

### finalized_adr

The work package's [ADR](../../resources/architecture-review.md#adr-template) with status updated to Accepted and the implementation outcome (plus any deviations) recorded, cross-referencing the merged PR via `{pr_number}`. No output when no ADR was created for this work package.

## Protocol

1. If the `{adr}` exists, update status to Accepted.
2. Record implementation outcome and any deviations, cross-referencing the merged PR via its `{pr_number}`.
3. If no ADR was created for this work package, skip ADR finalization and proceed with the other steps.
