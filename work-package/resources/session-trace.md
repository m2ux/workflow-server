---
name: session-trace
description: Creation-guide for the lean mechanical session-trace artifact written at close-out.
metadata:
  version: 1.0.0
---


# Session Trace Guide

Lean mechanical summary of resolved execution-trace events for a work-package run. Complements the COMPLETE.md retrospective section ([workflow-retrospective](workflow-retrospective.md)); joins the planning-folder `token-usage.md` by link when present.

## Template

```markdown
# Session Trace

> [Work package] · resolved at close-out · [date]

[token-usage.md](NN-token-usage.md) when present — join by reference; no cost estimates here.

## Per-activity summary

| Activity / token slice | Tool calls | Duration (ms) | Errors | `vw` clusters |
|------------------------|------------|---------------|--------|---------------|
| {activity_id} | N | total/ms | count + sample `err` | summary when present |

<!-- Omit empty metric rows. Prefer compact tables over narrative. -->

**Skip form (empty tokens):** Session trace skipped — no accumulated `trace_tokens`.
```

## Rules

- **Exception-oriented** — omit empty metric rows; prefer compact tables over narrative.
- **Join, don't estimate cost** — link `token-usage.md` when present; never compute cost on this path.
- **Skip when empty** — when tokens are absent or empty, write the one-line skip (or omit the artifact); do not fabricate events.
- **Complementary** — mechanical detail lives here; COMPLETE.md retrospective owns signal classes and recommendations.
