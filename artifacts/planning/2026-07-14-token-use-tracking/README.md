# Token Use Tracking and Cost Estimation - July 2026

> Feature · Created 2026-07-14 · **Status:** Approved — PR [#233](https://github.com/m2ux/workflow-server/pull/233) awaiting merge.

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

Adds per-activity and per-workflow token use tracking and cost estimation to the workflow-server. Usage is measured via the model's native reporting capabilities where possible, and the per-activity and per-workflow results are logged to the appropriate planning artifact upon completion, giving each work package a durable usage and cost record.

## Problem Overview

When an AI agent runs a workflow through the workflow-server, that work consumes "tokens" — the units of text the underlying AI model reads and writes, which are also what the service charges for. Today, the server keeps no record of how many tokens a workflow run uses or what it costs. Once a piece of work is finished, there is no way to look back and see how expensive it was, or which parts of the process consumed the most.

This work adds usage tracking to the server: each step of a workflow will record how many tokens it used, those figures will be totalled for the whole workflow, and a cost estimate will be calculated from them. When the work completes, the results are written into the work package's planning records, so every piece of work carries its own permanent usage and cost summary that anyone can review later — making it possible to spot expensive steps and compare efficiency over time.

## Solution Overview

The plan adds token tracking in two coordinated parts. First, the server gains a way for the running agent to hand it the token counts the AI model reports for each stage of a workflow. Those counts are saved into the work package's permanent session record as the workflow runs, totalled up across the whole run, and turned into a cost estimate using a built-in, versioned price list — one that gracefully records "unknown" and keeps going whenever a figure or a model price is missing, so a run never fails just because a number was not supplied. Totals also gather in any usage from sub-workflows the run launches, so the final figure reflects the entire piece of work.

Second, because the server never writes human-readable documents itself, the workflow instructions are updated so that the agent both supplies those token counts and, when the work finishes, writes a short usage-and-cost summary into the work package's planning records — a table showing how much each stage used, the totals, and the estimated cost. The result is that every completed work package carries its own durable record of what it consumed and what it cost, letting people review spend, spot the most expensive stages, and compare efficiency between runs. The cost figure is an estimate for guidance, not a bill, and is most meaningful for usage billed per token rather than under a flat subscription.

**Token usage (this run):** No usage relayed — see [14-token-usage.md](14-token-usage.md).

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 03 | [Requirements elicitation](03-requirements-elicitation.md) | Requirements, success criteria, scope boundaries | 15-30m | ✅ Complete |
| 03 | [Deferred items](deferred-items.md) | Deferred scope items and research candidates | 5m | ✅ Complete |
| 04 | [KB & web research](04-kb-research.md) | Native-usage channel evidence, DI-1 head-to-head, pricing table, OTEL findings | 20-45m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan | 1-4h | ✅ Complete |
| 10 | [Change block index](10-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ✅ Complete |
| 09 | [Code review](09-code-review.md) | Manual diff, lean-coding, and code review findings | 10-20m | ✅ Complete |
| 09 | [Debt ledger](09-debt-ledger.md) | Ponytail marker harvest | 5m | ✅ Complete |
| 09 | [Lean change](09-lean-change.md) | Applied simplifications record | 5m | ✅ Complete |
| 10 | [Test suite review](10-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ✅ Complete |
| 10 | [Architecture summary](10-architecture-summary.md) | Stakeholder-facing architecture overview | 10-15m | ✅ Complete |
| 12 | [Strategic review](12-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ✅ Complete |
| — | [Comprehension artifact](../../comprehension/token-use-tracking.md) | Persistent codebase knowledge (+ [portfolio lens analysis](../../comprehension/portfolio-token-use-tracking-synthesis.md)) | 20-45m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ✅ Complete |
| — | PR review | External review feedback cycle | 30-60m | ✅ Complete |
| 14 | [Token usage](14-token-usage.md) | Per-activity usage and cost record (no usage relayed this run) | — | ✅ Complete |
| 14 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables, known limitations, lessons, retrospective | 10-20m | ✅ Complete |
| — | [ADR-0006](../../adr/0006-agent-relayed-token-usage-at-activity-transition.md) | Architecture decision record (Proposed until merge) | 15-30m | ✅ Complete |

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#232](https://github.com/m2ux/workflow-server/issues/232) |
| PR | [#233](https://github.com/m2ux/workflow-server/pull/233) |
