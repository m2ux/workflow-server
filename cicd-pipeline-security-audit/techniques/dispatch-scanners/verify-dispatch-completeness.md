---
metadata:
  version: 2.0.0
---

## Capability

Confirm every assigned scanner was gathered with a non-empty return, using meta gather completeness plus the domain roster count.

## Inputs

### gathered_results

Ordered keyed collection from [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[gather-results](../../../meta/techniques/orchestration-patterns/gather-results.md).

### scanners_assigned

Count of scanner agents in the roster.

## Protocol

### 1. Verify Dispatch Completeness

- Confirm `{gathered_results.completeness}` is `complete` and that the number of `ok` rows in `{gathered_results.dispatch_manifest}` equals `{scanners_assigned}`.
- When either check fails, flag `{dispatch_status}` (or the gather manifest) as incomplete and return the shortfall list for re-dispatch — do not invent missing results.
