---
name: provenance-log
description: Creation guide for bare filename `provenance-log.md` — one row per task recording which assistant and model did it, the prompt class, and whether external sources informed it.
metadata:
  order: 31
---

# Provenance Log Guide

Creation guide for bare filename `provenance-log.md`. An append-only record of who did what: one row per task, added as the task completes. Its columns are fixed because rows accumulate across a run and a reader compares them.

## Template

```markdown
| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| {task id} | {assistant name} | {model id} | {prompt class} | repo-only \| web-retrieval \| mixed | {what the task did} |
```

## Rules

- **The header is fixed.** Six columns in that order, with the divider row beneath. A log created without them cannot be appended to consistently.
- **One row per task, appended.** A completed task adds a row; no row is edited or removed once written.
- **Context scope is one of three values.** `repo-only` when only repository-local sources were used, `web-retrieval` when external web sources informed the work, `mixed` when both.
- **The description says what the task did.** Not how it went, and not what the next task will do.
- **Line budget:** one row per task, with no prose above or below the table.
