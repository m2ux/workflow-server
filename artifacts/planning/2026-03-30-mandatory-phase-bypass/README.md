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

The fix adds a new `skills` field to the workflow definition, allowing workflows to declare skills that apply across all activities — not just within a single activity. The workflow-server's `get_skills` tool is extended to accept a workflow ID without specifying an activity, returning these workflow-level skills. This means when a worker agent starts up, it can call `get_skills` with just the workflow ID to discover skills like `execute-activity`, which tells it exactly how to bootstrap, execute steps, write trace files, and report results.

The changes span three layers: the schema (adding the field), the server (extending the API), and the workflow data (declaring the skills and updating the orchestrator's dispatch instructions to tell workers about the new loading step). Dead code from an older skill discovery mechanism is also removed. Because the new schema field is optional, existing workflows continue to work without any changes — only workflows that want to declare workflow-level skills need to add the field.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 03 | [Requirements elicitation](03-requirements-elicitation.md) | Scope, success criteria, three fix approaches | 15-30m | ✅ Complete |
| 04 | [KB research](04-kb-research.md) | Schema design, API extension, dead code analysis | 20-45m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | 8 tasks, execution order, risk register | 20-45m | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | 20 test cases across 6 areas | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan | 1-4h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | [Comprehension artifact](../../comprehension/workflow-server-schemas.md) | Augmented: §9 workflow-level skills | 20-45m | ✅ Complete |
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

**Status:** Assumptions reviewed — ready for implementation
