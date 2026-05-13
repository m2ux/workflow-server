# Server-Managed Session State - May 2026

**Created:** 2026-05-13
**Status:** Planning
**Type:** Refactor

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Make the MCP server workspace-aware so it owns workflow session state end-to-end via `session.json` plus an HMAC integrity seal in the planning folder, replacing the agent-threaded opaque session token. Replaces error-prone per-call token threading with a six-character `session_index`, eliminates agent-side state writes, and represents nested workflow parents as a recursive structure rather than a single flattened level.

---

## Problem Overview

*Populated during start-work-package activity.*

---

## Solution Overview

*Populated during plan-prepare activity.*

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 03 | [Codebase comprehension](03-codebase-comprehension.md) | AS-IS architecture survey of #115 touchpoints, key abstractions, design rationale, portfolio-lens findings | 20-45m | ✅ Complete |
| 04 | [Requirements elicitation](04-requirements-elicitation.md) | Captured requirements, scope, success criteria; 11 plan-phase decisions forwarded; assumptions reclassified | 15-30m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ⬚ Pending |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ⬚ Pending |
| — | Implementation | Code changes per plan | 2-6h | ⬚ Pending |
| 06 | [Change block index](06-change-block-index.md) | Indexed diff hunks for manual review | 5-10m | ⬚ Pending |
| 06 | [Code review](06-code-review.md) | Automated code quality review | 10-20m | ⬚ Pending |
| 06 | [Test suite review](06-test-suite-review.md) | Test quality and coverage assessment | 10-20m | ⬚ Pending |
| 07 | [Strategic review](07-strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | [Completion summary](08-COMPLETE.md) | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |
| 08 | [Workflow retrospective](08-workflow-retrospective.md) | Process improvement recommendations | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| GitHub Issue | [#115](https://github.com/m2ux/workflow-server/issues/115) |
| PR | [#116](https://github.com/m2ux/workflow-server/pull/116) |

---

**Status:** Requirements elicitation complete — ready for research activity
