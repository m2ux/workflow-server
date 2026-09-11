---
metadata:
  version: 1.0.0
---

## Capability

The in-task follow-ups register, carrying one row per piece of work still owed inside this work package.

## Inputs

### follow_up_rows

The follow-ups to record, each carrying what remains, where it surfaced, and what happens next. Empty where the pass surfaced none.

## Outputs

### follow_ups_register

The register with each supplied follow-up appended as a row, or updated in place where the row already exists.

#### artifact

`follow-ups.md`

#### audience

`human`

## Protocol

### 1. Append the Rows

- For each entry of `{follow_up_rows}`, write a row in the shape the [register template](../../resources/follow-ups.md#template) gives, creating the register when this is its first row
  > Where a row for the item already exists, update that row rather than adding a second, per the group's `one-row-per-item-updated-in-place`.
- Mark a row done when its work closes, leaving the row in place so the record of what was owed survives
