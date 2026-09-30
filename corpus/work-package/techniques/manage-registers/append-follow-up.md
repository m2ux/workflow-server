---
metadata:
  version: 2.0.3
---

## Capability

The in-task follow-ups register, carrying one entry per piece of work still owed inside this work package.

## Inputs

### follow_ups

The follow-ups to record, each carrying what remains, where it surfaced, and what happens next. Empty where the pass surfaced none.

## Outputs

### follow_ups_register

The register's bare filename, once each supplied follow-up is appended as an entry, or updated in place where the entry already exists.

#### artifact

`follow-ups.json`

#### audience

`agent`

## Protocol

### 1. Append Entries

- For each entry of `{follow_ups}`, write an entry in the shape the [register template](../../resources/follow-ups.md#template) gives, creating the register when this is its first entry
  > Where an entry for the item already exists, update that entry rather than adding a second, per the register's [Rules](../../resources/follow-ups.md#rules).
- Mark an entry `done` when its work closes, leaving it in place so the record of what was owed survives
