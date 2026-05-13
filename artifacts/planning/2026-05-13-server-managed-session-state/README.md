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

The Workflow Server is the program that keeps track of where each piece of work is in its planning workflow — which step you are on, what decisions have been made, what variables matter. Today it remembers that information with the help of the assistant (the AI agent), which has to copy a long opaque code-string between every step. When the agent occasionally mistypes that string, the workflow breaks part-way through. This change moves the bookkeeping inside the server itself. The server saves the workflow's state to a plain file called `session.json` in the planning folder, and signs it with a fingerprint file called `.session-token`. The agent just passes a short six-letter handle (the `session_index`) on each call — short enough to type back correctly every time — and the server uses that handle to find the right folder, check that the file has not been tampered with, do the work, and re-save the file.

The fix works by separating three things that are mixed together today: who carries the state, who owns the state, and how the state stays consistent. The short six-letter handle is what the agent carries; the file in the planning folder is where the state lives; the fingerprint file is how the server proves the state has not been changed behind its back. Because the fingerprint is computed from the exact bytes of the state file, any hand-edit, partial write, or accidental mix-up is caught the next time the workflow tries to advance — the call fails fast with a clear error rather than silently proceeding on inconsistent state. Nested workflows (a workflow that dispatches another workflow, which dispatches another) now record their full parent chain inside the file rather than flattening it to a single level, so grandchild-of-grandchild dispatch is preserved end-to-end. The legacy state file from the old design is automatically converted on first use, so in-flight work continues without interruption.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](02-assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete |
| 03 | [Codebase comprehension](03-codebase-comprehension.md) | AS-IS architecture survey of #115 touchpoints, key abstractions, design rationale, portfolio-lens findings | 20-45m | ✅ Complete |
| 04 | [Requirements elicitation](04-requirements-elicitation.md) | Captured requirements, scope, success criteria; 11 plan-phase decisions forwarded; assumptions reclassified | 15-30m | ✅ Complete |
| 05 | [Research](05-research.md) | Resolved B1 (6-char base32), B2 (HMAC-SHA256 + microbench), F4 (enumeration cost) | 15-30m | ✅ Complete |
| 05 | [Work package plan](05-work-package-plan.md) | Implementation tasks, estimates, dependencies | 20-45m | ✅ Complete |
| 05 | [Test plan](05-test-plan.md) | Test cases, coverage strategy | 15-30m | ✅ Complete |
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

**Status:** Ready — plan-prepare complete; ready for assumptions-review and implementation
