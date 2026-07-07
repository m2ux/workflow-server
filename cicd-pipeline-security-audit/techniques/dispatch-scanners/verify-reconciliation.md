---
metadata:
  version: 1.0.0
---

## Capability

Confirm the merge sub-agent's reconciliation table shows zero unaccounted findings for every scanner, re-dispatching the merge sub-agent otherwise.

## Protocol

### 1. Verify Reconciliation

- Confirm the merge sub-agent's reconciliation table shows zero unaccounted findings for every scanner.  
  > If any scanner shows a non-zero unaccounted count, re-dispatch the merge sub-agent and re-confirm the reconciliation table.
