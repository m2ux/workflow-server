---
name: debt-ledger
description: Creation guide for bare filename `debt-ledger.md` — one row per ponytail marker with its ceiling and upgrade trigger, grouped by file, closing with the marker and no-trigger counts.
---

# Debt Ledger Guide

Creation guide for bare filename `debt-ledger.md`. Every deliberate simplification, with the limit it sets and the trigger that would justify passing it. A marker whose trigger is missing is the interesting row, so the ledger flags it rather than leaving it to be noticed.

## Template

```markdown
# Debt Ledger — {target}

## `{file path}`

{file}:{line}, {what was simplified}. ceiling: {the limit}. upgrade: {the trigger}.
{file}:{line}, {what was simplified}. ceiling: {the limit}. upgrade: no-trigger.

{N} markers, {M} with no trigger.
```

## Rules

- **One row per marker, in the grammar above.** Location, what was simplified, the ceiling, the upgrade trigger. The grammar is what makes the ledger totalable by the gain report.
- **Grouped by file.** Rows sort under the file they sit in, so a reader working on one file sees its debt together.
- **A missing trigger is flagged, not omitted.** `upgrade: no-trigger` marks a ceiling nobody can tell when to lift, which is the row most worth revisiting.
- **The counts close the file.** `N markers, M with no trigger.` sums both. When the harvest found none, the whole file is `No ponytail: debt. Clean ledger.` instead.
- **The ledger records, it does not judge.** A marker is debt with a stated ceiling, not a defect; whether to upgrade is decided when the trigger fires.
- **Line budget:** one line per marker, with the file headings the only other content.
