---
name: session-trace
description: Creation-guide for the lean mechanical session-trace artifact written at close-out.
metadata:
  version: 1.1.1
---


# Session Trace Guide

Lean mechanical summary of resolved execution-trace events for a work-package run — what executed, how long it took, and where it went wrong. Complements the COMPLETE.md retrospective section ([workflow-retrospective](workflow-retrospective.md)), which owns signal classes and recommendations.

## Template

```markdown
# Session Trace

> [Work package] · resolved at close-out · [date]

Cost: [token-usage.md](NN-token-usage.md) — the run's sole cost home.

## Per-activity summary

| Activity | Dispatches | Tool calls | Duration (min) | Errors | `vw` clusters |
|----------|------------|------------|----------------|--------|---------------|
| {activity_id} | N | N | total/min | count + sample `err` | summary when present |

<!-- Omit empty metric rows. Prefer compact tables over narrative. -->

**Skip form (empty tokens):** Session trace skipped — no accumulated `trace_tokens`.
```

## Rules

- **Mechanical only** — dispatches, tool calls, durations, errors and `vw` clusters. No token counts, no cost figures, no per-activity spend: the trace and the cost artifact read the same ledger, so a figure restated here turns one wrong ledger into two disagreeing artifacts.
- **Duration in minutes** — wall-clock session time is a reader metric; print **Duration (min)** (one decimal is enough). The harness ledger may store milliseconds — convert at render (`min = ms / 60000`). Do not put ms in the column header or cell.
- **Cost by link** — one line linking `token-usage.md` when present; that artifact is the sole cost home.
- **Exception-oriented** — omit empty metric rows; prefer compact tables over narrative.
- **Skip when empty** — when tokens are absent or empty, write the one-line skip (or omit the artifact); do not fabricate events.
- **Complementary** — mechanical detail lives here; COMPLETE.md retrospective owns signal classes and recommendations.
- **Revised after client exit** — a mid-`complete` draft cannot include the terminal activity's own dispatch, so what is written then is provisional and a later revision of this artifact supersedes it.
- **Line budget:** one row per dispatch, with no prose between rows. The trace grows with the run, so the ceiling is per row.
