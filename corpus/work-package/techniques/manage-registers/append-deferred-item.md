---
metadata:
  version: 2.0.3
---

## Capability

The out-of-scope deferrals register, carrying one entry per item consciously placed beyond this work package.

## Inputs

### deferred_items

*(optional)* Deferrals a pass emitted directly, each carrying what was set aside, where, and why it falls outside this package. Empty where the pass emitted none.

### assumptions_log

*(optional)* The assumptions log, whose rows marked Deferred are the deferrals it contributes. Absent where the pass has no log to read.

## Outputs

### deferred_items_register

The register's bare filename, once each supplied deferral is appended as an entry, or updated in place where the entry already exists.

#### artifact

`deferred-items.json`

#### audience

`agent`

## Protocol

### 1. Append Entries

- Assemble the deferrals this pass contributes: every entry of `{deferred_items}`, plus every `{assumptions_log}` row whose Outcome is Deferred, deferred at that row's ID
- Write each as an entry in the shape the [register template](../../resources/deferred-items-guide.md#template) gives, creating the register when this is its first entry
  > Where an entry for the item already exists, update that entry rather than adding a second, per the register's [Rules](../../resources/deferred-items-guide.md#rules).
- Leave `issue` null until an issue is raised for the entry, which is what marks it as still unraised
