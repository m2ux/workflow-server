# Execution Traces for Workflows - March 2026

**Created:** 2026-03-25  
**Status:** Planning  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Add structured execution tracing to the workflow server so that every workflow session produces a retrievable record of activities entered, steps completed, and checkpoints resolved. This enables post-execution debugging, audit trails, and data-driven workflow improvement.

---

## Problem Overview

The workflow server guides AI agents through structured multi-step processes, managing which steps to take and in what order. Currently, when an agent works through a workflow, the server processes each request in isolation — it knows where the agent is right now, but keeps no record of the path taken to get there. Once a workflow session ends, all knowledge of what happened during that session is lost.

Without a record of execution, diagnosing problems becomes guesswork. When a workflow produces unexpected results or an agent gets stuck, the only way to understand what happened is to manually piece together clues from chat logs — a time-consuming and unreliable process. Workflow authors also have no way to learn how their workflows are actually being used, which means they cannot identify steps that consistently cause confusion, paths that are never followed, or bottlenecks that slow work down. This lack of visibility makes it difficult to improve workflows over time and undermines confidence in the system's reliability.

---

## Solution Overview

The fix adds an automatic recording system to the workflow server. Every time an AI agent makes a request to the server — such as loading an activity, checking available transitions, or saving progress — the server captures a structured record of that request including what was asked for, how long it took, and whether it succeeded. These records accumulate throughout a workflow session and can be retrieved at any time using a new tool, giving anyone a complete timeline of what happened during the session without relying on chat logs.

The recording works by extending the server's existing request-handling wrapper to also store events in memory, keyed by a unique session identifier embedded in the session token. The events use an industry-standard format that can be exported to external monitoring tools in the future. The solution also introduces two levels of structured reports — one from the worker agent describing step-level activity within each phase, and another from the orchestrator describing the sequence of phases and transitions — so the trace captures not just raw server calls but the workflow-meaningful context behind them.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 04 | [Research](04-kb-research.md) | Tracing patterns, mcp-trace, OTel findings | 20-30m | ✅ Complete |
| 04 | [Solution diagrams](04-solution-diagrams.md) | Sequence diagrams, component architecture | 15-20m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | [Comprehension artifact](../../comprehension/orchestration.md) | Persistent codebase knowledge | 20-45m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#63](https://github.com/m2ux/workflow-server/issues/63) |
| PR | [#64](https://github.com/m2ux/workflow-server/pull/64) |

---

**Status:** Ready for implementation
