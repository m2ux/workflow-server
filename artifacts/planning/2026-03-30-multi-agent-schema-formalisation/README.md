# Multi-Agent Schema Formalisation — March 2026

**Created:** 2026-03-30
**Status:** Planning
**Type:** Enhancement

---

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Extend the workflow-server schemas to support structured definitions for multi-agent execution models. The current schema vocabulary has no constructs for agent identifiers, roles (orchestrator, worker, reviewer), execution model declarations, worker lifecycle management, or inter-agent context passing. These requirements can only be expressed as prose in rules arrays, making them invisible to the server and inconsistently interpreted by agents.

---

## Problem Overview

The workflow orchestration server uses structured schemas to define how AI agents execute workflows — specifying activities, steps, checkpoints, and transitions. However, when a workflow requires multiple agents to work together (for example, one agent coordinating while another performs the actual work), there is no way to express this in the schema. Instead, these multi-agent requirements are written as plain-text rules that agents must read and interpret on their own. The server has no awareness of whether a workflow needs one agent or several, what roles those agents should play, or how they should coordinate.

This gap means agents frequently misinterpret or ignore multi-agent requirements, leading to broken checkpoint interactions, context overload in a single agent, and inconsistent execution across different workflow runs. The server cannot validate that the right agent configuration is in place before a workflow starts, cannot adapt its tooling or session management to multi-agent scenarios, and cannot enforce the separation of responsibilities between orchestrator and worker agents. Until the schemas can express multi-agent execution as structured data rather than prose, any enforcement or tooling improvements are blocked.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Tracking Issue | [#84](https://github.com/m2ux/workflow-server/issues/84) |
| Draft PR | [#85](https://github.com/m2ux/workflow-server/pull/85) |
| Related Issue | [#65](https://github.com/m2ux/workflow-server/issues/65) — Orchestrator/worker rules lack structural enforcement |

---

**Status:** Planning — research complete, transitioning to implementation-analysis
