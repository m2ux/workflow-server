---
name: deferred-items-guide
description: Template and rules for the single deferred-items register every other artifact points at.
metadata:
  version: 2.0.2
---

# Deferred Items Register Guide

## Canonical Home

The register is the one canonical home for work consciously deferred **out of scope** for this work package — descoped requirements, deferred assumptions, and review findings deferred at a checkpoint. In-task work that still belongs inside the package lives in [follow-ups](./follow-ups-guide.md). Every other artifact points here for out-of-scope deferrals (see the [canonical-home map](./canonical-home-map.md#map)).

## Template

A JSON array, one object per deferred item.

```json
[
  {
    "id": "D-1",
    "deferred_at": "the log row ID or finding designator that states it, else the activity or checkpoint that deferred it",
    "item": "what was deferred, in one sentence",
    "reason": "why it falls outside this package",
    "issue": null
  }
]
```

`issue` is `null` until an issue is raised for the item, then `{ "number": "…", "url": "…" }`.

## Rules

- **Out-of-scope only** — entries are conscious deferrals beyond this package. In-task remainders belong in the [follow-ups register](./follow-ups-guide.md#template).
- **One entry per item, updated in place** — raising an issue for an item fills its `issue`; an entry is never deleted.
- **Created lazily, unprefixed** — the register is created as bare `deferred-items.json` when the first deferred item appears; a run that defers nothing has no register.
- **IDs in append order** — each entry takes `D-<n>`, one past the highest ID the register holds.
- **Point, don't restate** — other artifacts point at an entry per `canonical-home-map.link-only-slots`; the entry here is the single statement of the item.
