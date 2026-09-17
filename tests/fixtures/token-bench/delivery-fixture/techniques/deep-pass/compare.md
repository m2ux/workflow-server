---
metadata:
  version: 1.0.0
---

## Capability

Compare this pass's weights against the figure the one-step activity reported.

## Outputs

### weight_delta

The difference between this pass's total weight and the entry total the earlier activity reported.

## Protocol

### 1. Compare

- Sum `{entry_weights}` and take the difference against `{entry_total}`, the figure the one-step activity landed.
- A difference is expected — the two measurements ask different questions of the same directory — so record it rather than reconciling it.
- Record the result as `{weight_delta}`.
