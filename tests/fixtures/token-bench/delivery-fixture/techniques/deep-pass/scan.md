---
metadata:
  version: 1.0.0
---

## Capability

List what the target directory holds, separating what is tracked from what is ignored.

## Outputs

### scanned_entries

The entries found directly under `{target_path}`, each with its kind.

## Protocol

### 1. Scan

- Walk `{target_path}` one level deep and record each entry with its kind — file or directory.
- Separate the entries the tree tracks from the ones it ignores, and carry both: a pass that drops the ignored set cannot say what it skipped.
- Record the result as `{scanned_entries}`, in the order the listing returned them, so two runs against one tree compare directly.
