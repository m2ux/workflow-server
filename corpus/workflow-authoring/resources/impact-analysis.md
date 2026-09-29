---
name: impact-analysis
description: Creation guide for the impact-analysis planning artifact — classification, integrity verdicts, removals inventory.
metadata:
  version: 1.2.0
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

**All integrity checks pass:** exits and graph, entry activity, reachability; technique and resource references; variables, checkpoint effects, step gates.

[Replace the line above with the divergences table when any check fails.]

| Check | Divergence |
|-------|------------|
| check that fails | one line |

---

## 3. Removals inventory

| # | Location | Removed | Preserved | Raised at |
|---|----------|---------|-----------|-----------|
| 1 | `path` or gate | what drops | what stays | impact pass \| drafting `path` \| remediation round N |

[Omit the section when nothing is removed.]

The inventory lists everything the run removed. A later reduction is a row naming the stage that raised it.

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
