---
metadata:
  version: 2.1.0
---

## Capability

The deferred-items register read for entries that name no issue yet.

## Outputs

### open_deferred_items

The register entries whose `issue` is null, each carrying the entry's `id`, `item` and `reason`. Empty when the register does not exist, or when every entry is raised already.

## Protocol

### 1. Locate the Register

- Read `{deferred_items_register}` in `{planning_folder_path}`.
  > The register is created lazily, so a run that deferred nothing has none. `{open_deferred_items}` is empty — a run with nothing outstanding, not a missing-file fault.

### 2. Select Unraised Entries

- Take every register entry whose `issue` is null, and record it in `{open_deferred_items}` with its `id`, its `item` and its `reason`.
