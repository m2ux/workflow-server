---
name: impact-analysis
description: Guidelines for creating the impact-analysis planning artifact (classification, integrity, removals).
metadata:
  version: 1.3.0
  order: 15
---

# Impact Analysis Guide

Update-mode decision surface. Answers: what is touched, is integrity intact, and which removals are intentional? Canonical home for impact classification, integrity, and removals ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).

## Template

```markdown
# Impact Analysis — {short title}

**Workflow:** `{workflow-id}` v{version}
**Mode:** Update
**Date:** YYYY-MM-DD
**Change source:** [design specification](NN-design-specification.md)
**Baseline:** [structural inventory](NN-structural-inventory.json)

---

## Summary

[2–3 sentences: kind of change; topology intact or not.]

**Removals inventoried:** N

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `path` | one line |

### Possibly touched (draft-time)

| File | Why |
|------|-----|
| `path` | one line |

### Unaffected (summary)

[One short note: counts/categories. No per-file essays.]

---

## 2. Integrity checks

**All integrity checks pass:** exits and graph / `initialActivity` / reachability; technique / resource references; variables / `setVariable` / step conditions.

[Replace the line above with the divergences table when any check fails.]

| Check | Divergence |
|-------|------------|
| check that fails | one line |

---

## 3. Removals inventory

[Omit if none — a Summary count of 0 removals inventoried logs the null.]

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `path` or gate | what drops | what stays |
```

## Rules

- **No unaffected per-file essays** — summary note only.
- **Every material removal** gets a removed-vs-preserved row.
- **Integrity** is verdict + one line, not a walkthrough.
- **Own facts only.** Link design-specification and structural-inventory; do not restate purpose or inventory body ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).
- **Line budget:** ~100 lines unless removals inventory is long (then table rows are the length).
