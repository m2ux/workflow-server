---
metadata:
  version: 2.0.0
---

## Capability

DCO compliance and AI provenance tracking for the work package — the record of which assistant did what, and the human certification that closes it.

## Inputs

### provenance_log

*(optional)* The provenance [log](../../resources/provenance-log.md#template) as it stands, which each operation here extends. Absent before the first task row is written.

#### default

`provenance-log.md`

## Rules

### one-record-appended-never-rewritten

The log is append-only: a task row is added as its task completes and no row is edited or removed once written, so the record reads in the order the work happened.

### attestation-follows-a-human-decision

The attestation records a decision a person made. It is written only after that person has selected an option, never synthesised ahead of one.
