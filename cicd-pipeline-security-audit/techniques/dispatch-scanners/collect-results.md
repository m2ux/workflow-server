---
metadata:
  version: 2.0.0
---

## Capability

Project meta [gather-results](../../../meta/techniques/orchestration-patterns/gather-results.md) output plus the domain `{scanner_assignments}` roster into the CI/CD `{dispatch_status}` shape (per-scanner structured output, summary counts, submodule-aware manifest).

## Inputs

### gathered_results

Ordered keyed collection from [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[gather-results](../../../meta/techniques/orchestration-patterns/gather-results.md).

## Outputs

### dispatch_status

Dispatch and collection status for all scanner agents.

#### scanners_dispatched

Count of scanners with a non-empty return in `{gathered_results}`.

#### scanners_returned

Same as `{dispatch_status.scanners_dispatched}` (returned count).

#### dispatch_manifest

Per-scanner table with scanner id, assigned submodule, dispatched, returned, and status (from `{gathered_results.dispatch_manifest}` enriched with roster submodule fields).

## Protocol

### 1. Project Gather Into Dispatch Status

- Walk `{gathered_results.items}` in order; parse each non-null `result` into structured per-scanner output when it conforms to the [output schema](../../resources/sub-agent-output-schema.md#schema).
- Build `{dispatch_status.dispatch_manifest}` by joining `{gathered_results.dispatch_manifest}` rows to `{scanner_assignments}` for assigned submodule.
- Set `{dispatch_status.scanners_dispatched}` and `{dispatch_status.scanners_returned}` from rows with status `ok`.
- If `{gathered_results.completeness}` is not `complete`, mark the manifest `INCOMPLETE` so verification / re-dispatch can act.
