---
name: deferred-items
description: Template and rules for the single deferred-items register every other artifact links to.
metadata:
  version: 1.0.0
---

# Deferred Items Register Guide

The register is the one canonical home for work consciously deferred during a work package — descoped requirements, deferred assumptions, review findings deferred at a checkpoint, and post-completion follow-ups. Every other artifact links here (see the [canonical-home map](../techniques/manage-artifacts/TECHNIQUE.md#canonical-home-map)); none restates a deferred item.

## Template

```markdown
# Deferred Items

> [Work package] · #[issue] · updated YYYY-MM-DD

| ID | Deferred at | Item | Reason | Follow-up |
|----|-------------|------|--------|-----------|
| D-1 | [activity or checkpoint] | [what was deferred, one line] | [why] | [issue link, or — until raised] |
```

## Rules

- **One row per item, updated in place** — when a deferred item is raised as a tracker issue, add the link to its Follow-up cell; when it is picked up, mark the row `→ #[issue]` rather than deleting it.
- **Created lazily** — the first activity that defers an item creates the register (standard numbered-artifact semantics); a run that defers nothing has no register.
- **Link, don't restate** — producers (requirements Deferred scope, assumption deferrals, review-finding deferrals, COMPLETE.md) record one pointer line to this register; the row here is the single statement of the item.
- **Issue creation reads this register** — deferred-item issues are raised from register rows, carrying the row ID for traceability.
