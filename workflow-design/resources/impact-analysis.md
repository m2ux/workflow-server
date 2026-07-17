---
name: impact-analysis
description: Guidelines for creating the impact-analysis planning artifact (classification, integrity, removals).
metadata:
  order: 15
---

# Impact Analysis Guide

Update-mode decision surface. Answers: what is touched, is integrity intact, and which removals are intentional? Human gate at impact-and-preservation.

## Template

```markdown
# Impact Analysis — {short title}

**Workflow:** `{workflow-id}` v{version}
**Mode:** Update
**Date:** YYYY-MM-DD
**Change source:** [design specification](NN-design-specification.md)
**Baseline:** [structural inventory](NN-structural-inventory.md)

---

## Summary

[2–3 sentences: kind of change; topology intact or not.]

**removal_count:** N

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

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | Pass / Fail — [one line] |
| Technique / resource references | Pass / Fail — [one line] |
| Variables / `setVariable` / step conditions | Pass / Fail — [one line] |

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `path` or gate | what drops | what stays |

[Empty table + "none" line when removal_count is 0.]

---

## Decision ask

Confirm impact scope and intentional removals — or revise / preserve.
```

## Rules

- **No unaffected per-file essays** — summary note only.
- **Every material removal** gets a removed-vs-preserved row (content-preservation).
- **Integrity** is verdict + one line, not a walkthrough.
- **Line budget:** ~100 lines unless removals inventory is long (then table rows are the length).
