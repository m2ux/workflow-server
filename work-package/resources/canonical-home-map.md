---
name: canonical-home-map
description: The one artifact that homes each shared fact category, and the link-only slot rule every other template follows.
metadata:
  version: 1.0.0
---

# Canonical Home Map

## Map

The canonical home for each shared fact category.

| Fact category | Canonical home |
|---|---|
| Problem statement, scope, success criteria | `requirements-elicitation.md` |
| Problem classification | `design-philosophy.md` (plus a 2–4 sentence ticket-derived statement — written before requirements exists, so it carries its own budgeted statement) |
| Assumptions and their outcomes | `assumptions-log.md` |
| Design decisions, alternatives, planning risks | `work-package-plan.md` (durable decisions graduate to an ADR at completion) |
| Baseline metrics, gaps, measurement strategy | `implementation-analysis.md` |
| Research findings and recommended approach | `knowledge-base-research.md` |
| Test cases and acceptance matrix | `test-plan.md` |
| Review findings (code, test, structural, lean-coding, manual-diff) | `code-review.md` and the reviews' own artifacts — consolidated surfaces reference findings by ID + disposition |
| In-task follow-ups | `follow-ups.md` (see [follow-ups](./follow-ups.md)) |
| Out-of-scope deferred items | `deferred-items.md` (see [deferred-items](./deferred-items.md)) |
| Token counts and cost estimates | `token-usage.md` — the close-out, retrospective and session trace link it and restate no figure, so one ledger produces one artifact |
| Mechanical execution record (dispatches, tool calls, durations, errors) | `session-trace.md` (see [session-trace](./session-trace.md)) |

## Rules

### link-only-slots

A template carries a link-only slot for every fact category it does not home: a markdown link to the canonical home plus at most one line. Restating homed content in such a slot is a conformance violation, whether or not the restatement is accurate.
