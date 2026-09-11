---
metadata:
  version: 1.0.0
---

## Capability

Confirm every dispatched scanner's output file exists in the planning folder, re-dispatching any scanner whose file is missing.

## Protocol

### 1. Verify Output Files

- For each scanner in `{dispatch_status}`, confirm its [scanner output file](../../resources/sub-agent-output-schema.md#file-naming-convention) exists under `{planning_folder_path}`.  
  > If any scanner's output file is missing, re-dispatch that scanner and re-confirm its file before proceeding.
