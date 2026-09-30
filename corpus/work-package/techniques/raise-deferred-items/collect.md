---
metadata:
  version: 2.0.0
---

## Capability

The deferred-items register read for entries that name no issue yet.

## Inputs

### deferred_items_register

The register holding this run's out-of-scope deferrals, named by its bare filename.

#### default

`deferred-items.json`

## Outputs

### open_deferred_items

The register entries whose `issue` is null, each carrying the entry's `id`, `item` and `rationale`. Empty when the register does not exist, or when every entry is raised already.

### has_unraised_deferred_items

Boolean gate — true when `{open_deferred_items}` holds at least one entry.

## Protocol

### 1. Locate the Register

- Read `{deferred_items_register}` in `{planning_folder_path}`.
  > The register is created lazily, so a run that deferred nothing has none. `{open_deferred_items}` is empty and `{has_unraised_deferred_items}` false — a run with nothing outstanding, not a missing-file fault.

### 2. Select the Unraised Entries

- Take every register entry whose `issue` is null, and record it in `{open_deferred_items}` with its `id`, its `item` and its `reason` as the rationale.
- Set `{has_unraised_deferred_items}` from whether that set holds anything.
