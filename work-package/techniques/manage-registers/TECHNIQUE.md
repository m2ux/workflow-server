---
metadata:
  version: 1.0.0
---

## Capability

Shared contract for the work package's two open-work registers — the single home each keeps for its class of outstanding item, and the append-only discipline both follow.

## Rules

### register-is-the-single-statement

Each register is the one home for its class of item: out-of-scope deferrals in the deferred-items register, work still owed inside the package in the follow-ups register. Every other artifact links to the row rather than restating it, per [single-source-and-link](../manage-artifacts/TECHNIQUE.md#single-source-and-link).

### created-lazily-and-unprefixed

A register is created when its first row arrives and not before, so a run that defers nothing has none, and any activity may be the one that creates it.

### one-row-per-item-updated-in-place

An item takes one row for its whole life. A later pass updates that row rather than appending a second statement of the same item, and a resolved row is marked rather than deleted.
