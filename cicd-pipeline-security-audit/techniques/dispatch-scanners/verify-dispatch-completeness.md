---
metadata:
  version: 1.1.0
---

## Capability

Confirm every assigned scanner was dispatched and returned, assembling the dispatch manifest and flagging any shortfall for re-dispatch.

## Inputs

### dispatched_scanners

The set of scanner agents handed off in the concurrent dispatch batch.

## Protocol

### 1. Verify Dispatch Completeness

- Compare the `{scanner_assignments}` roster against `{dispatched_scanners}` and assemble `{dispatch_status}`: a dispatch manifest (scanner id, assigned submodule, dispatched, returned, status) plus the `{dispatch_status.scanners_dispatched}` and `{dispatch_status.scanners_returned}` counts.
- Confirm `{dispatch_status.scanners_dispatched}` equals `{scanners_assigned}`.  
  > If any roster scanner was not dispatched, flag `{dispatch_status}` as incomplete and return the manifest for re-dispatch.
