---
metadata:
  version: 1.1.0
---

## Capability

The confirmed manifest checked in both directions against what the run actually changed.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

## Outputs

### total_count

Number of entries in the confirmed manifest.

### addressed_count

Number of manifest entries confirmed addressed: the file is present, the recorded action was performed, and its content matches what the entry describes.

### unaddressed_count

Number of manifest entries still unaddressed — `{total_count}` less `{addressed_count}`. Zero when the manifest is fully delivered.

## Protocol

### 1. Check Each Manifest Entry

- For every entry in `{manifest_entries}`, check that the file exists, that the action it records was the action performed, and that the content matches the change the entry describes
- Set `{total_count}`, `{addressed_count}` and `{unaddressed_count}`

### 2. Check the Change Set Against the Manifest

- List the files actually changed for `{target_workflow_id}` under `{target_path}` and compare that set against `{manifest_entries}` in the other direction: a file changed that no entry names is unplanned scope
- Surface each unaddressed entry and each unplanned change with a recommended disposition, exceptions only — a manifest delivered exactly gets one line, not a table of passes

## Rules

### both-directions-or-neither

A scope check runs both directions: every entry delivered, and no file changed that no entry names. A check that runs one direction has not checked scope.
