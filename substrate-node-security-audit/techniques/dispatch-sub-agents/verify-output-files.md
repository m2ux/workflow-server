---
metadata:
  version: 1.0.0
---

## Capability

Confirm every expected per-agent output file persisted into the planning folder, re-dispatching the owning agent for any missing file.

## Inputs

### expected_output_files

The set of per-agent output filenames each dispatched agent must persist into the planning folder, each named by the agent designator and scope with a `.json` extension.

## Protocol

### 1. Verify Output Files

- For each expected filename in `{expected_output_files}`, confirm the file exists in `{planning_folder_path}`.
  > If any expected file is absent, re-dispatch the owning agent before proceeding.
