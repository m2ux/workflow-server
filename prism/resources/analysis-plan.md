---
name: analysis-plan
description: Creation guide for bare filename `analysis-plan.md` — the human-readable plan a run writes before any analysis pass executes. Template plus fill rules; the machine-readable unit array is a separate output and is not laid out here.
metadata:
  order: 66
  type: template
---

# Analysis Plan Guide

Creation guide for bare filename `analysis-plan.md`. The reader is deciding whether to spend the run: what will be analysed, how deep each unit goes, what it costs, and what is being skipped. One plan per run, written before the first pass.

## Template

```markdown
# Analysis Plan — {target}

**Scope:** query | file | module | codebase | document-set · **Budget:** quick | standard | thorough · **Units:** {n} · **Dispatches:** {n}

{One or two sentences: the strategy and why this depth suits the goal.}

## Units

| # | Target | Role | Risk | Mode | Lenses | Why |
|---|--------|------|------|------|--------|-----|
| 1 | `path or query` | api-surface | high | full-prism | l12 | one line |

## Execution

**Order:** {risk tier order, and the dependency reason where one applies}
**Concurrent:** {which units may run at the same time}

## Skipped

| Target | Why |
|--------|-----|
| `path` | below the budget threshold |
```

## Rules

- **Every unit is a row.** One row per unit in execution order, with the mode and lens the row will actually run. A unit missing from the table is a unit nobody agreed to pay for.
- **Why is one line.** The rationale cell says what made this risk and this mode the right call — not what the lens does.
- **Single-unit scopes drop the multi-unit sections.** A query or single-file plan carries the header, the strategy sentence, and one Units row; Execution and Skipped are omitted.
- **Skipped is explicit or absent.** List every unit the budget excluded with its reason, or omit the section when nothing was skipped.
- **Line budget:** ~50 lines.
