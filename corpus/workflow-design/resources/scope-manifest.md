---
name: scope-manifest
description: Guidelines for creating the scope-manifest planning artifact (file table + lean structural notes).
metadata:
  version: 1.0.0
  order: 17
---

# Scope Manifest Guide

Activity-layer decision surface for create/update. Answers: which files, what structural shape, and in what drafting order? Human gate at `scope-and-structure-confirmed`. Canonical home for the file manifest, structural design, and drafting order ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).

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

- **File table is the payload** — structural design and drafting order stay compact.
- **Own facts only.** Link design-specification and impact-analysis; do not restate purpose or removals essays ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).
- **Update:** folder layout may be "unchanged"; still enumerate every touched file.
- **Line budget:** ~80 lines unless the file table is long (then table rows are the length).
