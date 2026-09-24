---
metadata:
  version: 1.0.0
---

## Capability

Confirm every expected output file persisted into the planning folder, re-dispatching the worker whose file is missing.

## Inputs

### expected_output_files

The filenames that must exist under the planning folder before the orchestrator reads them. Each name is the file one dispatched worker persists.

## Protocol

### 1. Verify Output Files

- For each filename in `{expected_output_files}`, confirm the file exists in `{planning_folder_path}`.
  > If any expected file is absent, re-dispatch the worker that owns it before proceeding.
