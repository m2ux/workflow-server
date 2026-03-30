# Mandatory Phase Bypass Fix - March 2026

**Created:** 2026-03-30  
**Status:** Planning  
**Type:** Bug-Fix

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Fix orchestrator and worker discipline violations where mandatory workflow phases are silently skipped and the worker receives pre-digested instructions instead of self-bootstrapping from the workflow server. The `write-semantic-trace` phase — mandatory in the `execute-activity` skill — has never produced a trace file in any work package execution.

---

## Problem Overview

The workflow-server uses an orchestrator/worker model where a coordinating agent dispatches tasks to a worker agent, which is expected to discover its own instructions by calling the workflow server directly. In practice, the orchestrator bypasses this model: it reads and summarizes the worker's instructions itself, then passes a pre-digested version to the worker. This means the worker never receives the authoritative activity definitions and skill protocols — it operates from a filtered, potentially incomplete interpretation of what it should do.

The consequences are significant. Mandatory phases defined in the workflow — such as writing semantic trace files that document what the worker did and why — are silently skipped because the worker never sees them in the pre-digested instructions. Without these traces, there is no way to verify whether a workflow was followed correctly, debug failures, or audit past work packages. The result is a system that appears to follow a structured process but in reality executes an unpredictable subset of the required steps, undermining the reliability and accountability the workflow system is designed to provide.

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 01 | [Design philosophy](01-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ⬚ Pending |
| 01 | [Assumptions log](01-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ⬚ Pending |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | [Comprehension artifact](../../comprehension/{area}.md) | Persistent codebase knowledge | 20-45m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#86](https://github.com/m2ux/workflow-server/issues/86) |
| PR | [#87](https://github.com/m2ux/workflow-server/pull/87) |
| Branch | `bug/86-mandatory-phase-bypass` |

---

**Status:** Ready for design philosophy
