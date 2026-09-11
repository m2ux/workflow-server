---
metadata:
  version: 3.0.0
---

## Capability

Confirm every assigned scanner was gathered with a non-empty return, using meta gather completeness plus the domain roster.

## Inputs

### gathered_results

Ordered keyed collection of worker returns, carrying its per-id dispatch manifest and completeness verdict.

## Protocol

### 1. Verify Dispatch Completeness

- Confirm `{gathered_results.completeness}` is `complete` and that the `ok` rows in `{gathered_results.dispatch_manifest}` name every entry of `{scanner_assignments}`.
- When either check fails, flag `{dispatch_status}` (or the gather manifest) as incomplete and return the shortfall list for re-dispatch — do not invent missing results.
