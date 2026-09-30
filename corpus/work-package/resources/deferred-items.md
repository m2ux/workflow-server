---
name: deferred-items
description: Template and rules for the single deferred-items register every other artifact links to.
metadata:
  version: 2.0.1
---

# Deferred Items Register Guide

The register is the one canonical home for work consciously deferred **out of scope** for this work package — descoped requirements, deferred assumptions, and review findings deferred at a checkpoint. In-task work that still belongs inside the package lives in [follow-ups](./follow-ups.md). Every other artifact points here for out-of-scope deferrals (see the [canonical-home map](./canonical-home-map.md#map)), naming an entry by its ID and one-line item; none restates it further.

## Template

A JSON array, one object per deferred item.

```json
[
  {
    "id": "D-1",
    "deferred_at": "the activity or checkpoint that deferred it",
    "item": "what was deferred, in one sentence",
    "reason": "why it falls outside this package",
    "issue": null
  }
]
```

`issue` is `null` until an issue is raised for the item, then `{ "number": "…", "url": "…" }`.

## Rules

- **Out-of-scope only** — entries are conscious deferrals beyond this package. In-task remainders belong in the [follow-ups register](./follow-ups.md#template).
- **One entry per item, updated in place** — raising an issue for an item fills its `issue`; an entry is never deleted.
- **Created lazily, unprefixed** — the register is created as bare `deferred-items.json` when the first deferred item appears; a run that defers nothing has no register. Any activity may be the one that defers first, so the register has no owning activity and takes no `artifactPrefix`.
- **Point, don't restate** — other artifacts name an entry by its ID and one-line item; the entry here is the single statement of the item.
