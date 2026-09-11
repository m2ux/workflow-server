---
name: applicable-constructs
description: Guidelines for creating the applicable-constructs planning artifact (schema constructs for this change).
metadata:
  order: 13
---

# Applicable Constructs Guide

Literacy surface for create/update drafting. Answers: which schema constructs apply to this change, and why? Agent-facing; short enough for a gate skim.

## Template

```markdown
# Applicable Constructs

Schema constructs for [create/update] of `{workflow-id}`.

| Construct | Why it applies | Reference |
|-----------|----------------|-----------|
| **{construct}** | [one line] | [technique / activity / field] |

## Write-time constraints (this change)

- [Only constraints that bind this draft — e.g. Output Economy, statement-form checkpoints.]
```

## Rules

- **One row per construct this change needs** — not the full construct inventory.
- **Reference column** points at a live file or field; do not paste inventory tables.
- **Line budget:** ~30 lines.
- Skip writing this artifact in review mode.
