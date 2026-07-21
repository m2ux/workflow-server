---
name: follow-ups
description: Template and rules for the in-task follow-ups register (work still inside the current package).
metadata:
  version: 1.0.0
---

# Follow-Ups Register Guide

The register is the one canonical home for **in-task** follow-ups — work still owed inside the current work package before close-out. Out-of-scope deferrals live in [deferred-items](./deferred-items.md). Every other artifact links here for in-task items; none restates a follow-up row.

## Template

```markdown
# Follow-Ups

> [Work package] · #[issue] · updated YYYY-MM-DD

| ID | Surfaced at | Item | Owner / next step | Status |
|----|-------------|------|-------------------|--------|
| F-1 | [activity or checkpoint] | [what remains in-task, one line] | [who / what happens next] | open \| done |
```

## Rules

- **In-task only** — rows are work that must finish (or explicitly drop) before package completion. Conscious out-of-scope deferrals go to `deferred-items.md`.
- **One row per item, updated in place** — mark `done` when closed; do not delete historical rows.
- **Created lazily** — create the register when the first in-task follow-up appears; a run with none has no register.
- **Link, don't restate** — producers record one pointer line to this register; the row here is the single statement of the item.
