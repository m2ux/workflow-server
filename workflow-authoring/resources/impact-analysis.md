---
name: impact-analysis
description: Creation guide for the impact-analysis planning artifact — classification, integrity verdicts, removals inventory.
metadata:
  version: 1.0.0
  order: 11
---

# Impact Analysis Guide

The update-mode decision surface. Answers: what is touched, is topology intact, and which removals are intentional? Canonical home for impact classification, integrity verdicts and the removals inventory ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).

## Template

```markdown
# Impact Analysis — {short title}

**Workflow:** `{workflow-id}` v{version}
**Mode:** Update
**Date:** YYYY-MM-DD
**Change source:** [link the change brief]
**Baseline:** [link the baseline surface]

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

### Possibly touched at draft time

| File | Why |
|------|-----|
| `path` | one line |

### Unaffected

[One short note: counts by category. No per-file entries.]

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass / Fail — [one line] |
| Technique and resource references | Pass / Fail — [one line] |
| Variables, checkpoint effects, step gates | Pass / Fail — [one line] |

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `path` or gate | what drops | what stays |

[Omit the section when nothing is removed.]

---

## Decision ask

Confirm the impact scope and the inventoried removals — or preserve instead.
```

## Rules

- **No per-file entries for unaffected files** — one summary note.
- **Every material reduction** gets a removed-versus-preserved row. A reduction no row names is unapproved.
- **Integrity is a verdict plus one line**, not a walkthrough of the check.
- **Own facts only.** Link the change brief and the baseline; do not restate purpose or inventory ([canonical-home map](../techniques/TECHNIQUE.md#canonical-home-map)).
- **Line budget:** ~100 lines unless the removals inventory is long, in which case its rows are the length.
