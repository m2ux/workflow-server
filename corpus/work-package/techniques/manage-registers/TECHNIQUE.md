---
metadata:
  version: 2.0.1
---

## Capability

Shared contract for the work package's two open-work registers — the single home each keeps for its class of outstanding item, and the one-entry-per-item discipline both follow.

## Rules

### register-is-the-single-statement

Each register is the one home for its class of item: out-of-scope deferrals in the deferred-items register, work still owed inside the package in the follow-ups register. Every other artifact links to the register rather than restating its entries, per `manage-artifacts.single-source-and-link`.

### created-lazily-and-unprefixed

A register is created when its first entry arrives and not before, so a run that defers nothing has none, and any activity may be the one that creates it.

### one-entry-per-item-updated-in-place

An item takes one entry for its whole life. A later pass updates that entry rather than appending a second statement of the same item, and a resolved entry is marked rather than deleted.
