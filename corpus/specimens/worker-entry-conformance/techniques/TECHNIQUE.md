---
metadata:
  version: 1.1.0
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

A technique on an entry path reads the stub, the variable bag and the clock, and reaches no
further. The run exists to exercise the entry, so a record assembled from anything the entry did
not hand over is evidence about the lookup rather than about the entry, and work that costs more
than the entry it demonstrates has changed what is being measured. The convergence is not on an
entry path: it reads the session record, which is the product it exists to write.
