---
metadata:
  version: 1.0.0
---

## Capability

The out-of-scope deferrals register, carrying one row per item consciously placed beyond this work package.

## Inputs

### deferred_item_rows

*(optional)* Deferrals a pass emitted directly, each carrying what was set aside, where, and why it falls outside this package. Empty where the pass emitted none.

### assumptions_log

*(optional)* The assumptions log, whose rows marked Deferred are the deferrals it contributes. Absent where the pass has no log to read.

## Outputs

### deferred_items_register

The register with each supplied deferral appended as a row, or updated in place where the row already exists.

#### artifact

`deferred-items.md`

#### audience

`human`

## Protocol

### 1. Append the Rows

- Assemble the deferrals this pass contributes: every entry of `{deferred_item_rows}`, plus every `{assumptions_log}` row whose Outcome is Deferred
- Write each as a row in the shape the [register template](../../resources/deferred-items.md#template) gives, creating the register when this is its first row
  > Where a row for the item already exists, update that row rather than adding a second, per the group's `one-row-per-item-updated-in-place`.
- Leave the Follow-up cell as a dash until an issue is raised for the row, which is what marks it as still unraised
