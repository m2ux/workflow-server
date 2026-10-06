---
metadata:
  version: 1.0.0
---

## Capability

Shared invariants for the worker entry conformance techniques — the record every activity on
an entry path keeps, and the limit on what it may reach for to keep it.

## Rules

### an-activity-evidences-its-own-entry

An activity on an entry path records the path it arrived on and the identity it arrived
under, and nothing more. It cannot see the routine that entered it, so what it leaves is
evidence of what the entry handed over.

### record-cheaply

Every technique here reads the stub, the variable bag and the clock. The run exists to
exercise the entry, so work that costs more than the entry it demonstrates has changed what
is being measured.
