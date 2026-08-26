---
metadata:
  version: 1.0.0
---

## Capability

The deferred-items register read for rows that name no issue yet.

## Outputs

### open_deferred_items

The register rows whose Follow-up cell holds no issue link, each carrying the row's `id`, `item` and `rationale`. Empty when the register does not exist, or when every row is raised already.

### has_unraised_deferred_items

Boolean gate — true when `{open_deferred_items}` holds at least one row.

## Protocol

### 1. Locate the Register

- Read `deferred-items.md` in `{planning_folder_path}`.
  > The register is created lazily, so a run that deferred nothing has none. `{open_deferred_items}` is empty and `{has_unraised_deferred_items}` false — a run with nothing outstanding, not a missing-file fault.

### 2. Select the Unraised Rows

- Take every row of the register table whose Follow-up cell holds a dash rather than a link, and record it in `{open_deferred_items}` with its ID, its item text and its rationale.
- Set `{has_unraised_deferred_items}` from whether that set holds anything.
