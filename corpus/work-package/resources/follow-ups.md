---
name: follow-ups
description: Template and rules for the in-task follow-ups register (work still inside the current package).
metadata:
  version: 2.0.1
---

# Follow-Ups Register Guide

The register is the one canonical home for **in-task** follow-ups — work still owed inside the current work package before close-out. Out-of-scope deferrals live in [deferred-items](./deferred-items.md). Every other artifact points here for in-task items; none restates it.

## Template

A JSON array, one object per follow-up.

```json
[
  {
    "id": "F-1",
    "surfaced_at": "the activity or checkpoint that surfaced it",
    "item": "what remains in-task, in one sentence",
    "next_step": "who acts, or what happens next",
    "status": "open"
  }
]
```

`status` is `open` or `done`.

## Rules

- **In-task only** — entries are work that must finish, or be explicitly dropped, before package completion. Conscious out-of-scope deferrals belong in the [deferred-items register](./deferred-items.md#template).
- **One entry per item, updated in place** — a closed item is marked `done`; an entry is never deleted.
- **Created lazily, unprefixed** — the register is created as bare `follow-ups.json` when the first in-task follow-up appears; a run with none has no register. Any activity may be the one that logs first, so the register has no owning activity and takes no `artifactPrefix`.
- **IDs in append order** — each entry takes `F-<n>`, one past the highest ID the register holds.
- **Point, don't restate** — other artifacts point at an entry per `canonical-home-map.link-only-slots`; the entry here is the single statement of the item.
