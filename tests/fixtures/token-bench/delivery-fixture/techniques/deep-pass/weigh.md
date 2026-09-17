---
metadata:
  version: 1.0.0
---

## Capability

Give each scanned entry a weight, so the pass has a figure to compare rather than a list.

## Outputs

### entry_weights

One weight per scanned entry, keyed by the entry's name.

## Protocol

### 1. Weigh

- Take `{scanned_entries}` and assign each entry a weight: one for a file, and the count of its own direct children for a directory.
- Leave an entry the scan marked as ignored out of the weighting, and say how many were left out.
- Record the result as `{entry_weights}`.
