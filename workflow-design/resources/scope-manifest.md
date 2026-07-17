---
name: scope-manifest
description: Guidelines for creating the scope-manifest planning artifact (file list + minimal structure/order).
metadata:
  order: 17
---

# Scope Manifest Guide

Authoritative file list for drafting and commit verify. Answers: which files, what action, in what order? Human gate at scope-and-structure.

## Template

~~~~markdown
# Scope Manifest — {short title}

**Target:** `{workflow-id}` v{version} · **Mode:** create | update
**Basis:** [design specification](NN-design-specification.md) · [impact](NN-impact-analysis.md) when update
**Worktree:** `{path}` ✅|❌ · folder layout [unchanged | described below]

[Create/modify/remove summary one-liner.] Intentional removals: **N** ([impact §3](…)) when update.

`file_count` = **N**

---

## File manifest

| # | Path (under `{workflow-id}/`) | Type | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `…` | activity \| technique \| resource \| … | create \| modify \| remove | … |

**Out of scope this pass:** [bullets]

---

## Structural design

```
{workflow-id}/   # tree or "unchanged"
├── …
```

**Flow:** [one line if topology unchanged; else short transition note]

| Pattern | This change |
|---------|-------------|
| … | … |

---

## Drafting order

1. **Tier** — [one-line rationale]
2. …

**Rationale:** [one line]
~~~~

## Rules

- **File table is canonical** — README Scope Manifest links here; do not mirror the full list in README.
- **Minimal structural/drafting sections** — tree + short order; no pattern essay.
- **Every in-scope file** appears exactly once with action and one-line change.
- **Line budget:** ~80 lines plus one row per file.
