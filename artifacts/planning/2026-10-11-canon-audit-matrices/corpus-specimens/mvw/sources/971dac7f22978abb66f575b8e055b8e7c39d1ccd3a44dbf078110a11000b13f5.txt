---
name: drafting-plan
description: Guidelines for creating the drafting-plan planning artifact (per-file delta, updated in place).
metadata:
  order: 18
---

# Drafting Plan Guide

Per-file approach surface for the drafting loop. Answers: what changes in this file? Updated in place each iteration; human-linked from approach gates when present.

## Template

```markdown
# Drafting Plan — {short title}

**Mode:** create | update · **Target:** `{workflow-id}` · Last file: `{path}`

| # | File | Delta |
|---|------|-------|
| N | `path/under/workflow` | one-line what changes (and what stays) |
```

## Rules

- **Delta only** — path, action, what changes; no constructs/patterns/decisions essay.
- **Update in place** — one row per scoped file; refresh the "Last file" line each iteration.
- **Line budget:** header + one row per file (~40 lines for typical scopes).
